/* ============================================================
   app.js
   ------------------------------------------------------------
   APPLICATION ENTRY / SIMULATION LOOP
   Wires the input controls, drives the VehicleModel at a fixed
   timestep inside requestAnimationFrame, renders the Dashboard,
   pushes rolling data into Chart.js and orchestrates the
   predefined TEST SCENARIOS.

   Architecture (ECU-style data path):
       InputModel (DOM + scenario driver)
           ↓
       VehicleModel (Engine→Transmission→Physics)
           ↓
       SignalManager (signal bus)
           ↓
       Dashboard (gauges) + Chart (graphs) + Monitor (tables)
   ============================================================ */

// ---- Globals ---------------------------------------------------
const APP = {};
const Sigs = SignalBus;                       // shared signal bus
const vehicle = new VehicleModel(Sigs);       // full vehicle model
const dashboard = new Dashboard();            // renderer

APP.running = false;      // is the simulation advancing?
APP.recording = false;    // is the graph recording?
APP.acc = 0;              // record accumulator
APP.lastTime = null;
APP.scenario = null;      // active test-scenario id
APP.scTime = 0;           // scenario elapsed time
APP.simStep = 0;
APP.recAcc = 0;           // sub-100ms record accumulator

// Rolling-window data buffers for Chart.js (last 60 s @ 10 Hz ≈ 600 pt).
const MAX_POINTS = 600;
const CH = {
    labels: [],
    accel: [], brake: [], speed: [], rpm: [], torque: [],
    currentGear: [], targetGear: []
};
let chart = null;

// ---- Chart.js setup ----------------------------------------------
function buildChart() {
    const ctx = document.getElementById("live-chart").getContext("2d");
    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: CH.labels,
            datasets: [
                { label: "Accel %", data: CH.accel, borderColor: "#39e27b", yAxisID: "yPct", borderWidth: 1.4, pointRadius: 0 },
                { label: "Brake %", data: CH.brake, borderColor: "#ff453a", yAxisID: "yPct", borderWidth: 1.4, pointRadius: 0 },
                { label: "Speed km/h", data: CH.speed, borderColor: "#2f9bff", yAxisID: "yMain", borderWidth: 1.6, pointRadius: 0 },
                { label: "RPM", data: CH.rpm, borderColor: "#ff9f0a", yAxisID: "yMain", borderWidth: 1.4, pointRadius: 0 },
                { label: "Torque Nm", data: CH.torque, borderColor: "#bf5af2", yAxisID: "yMain", borderWidth: 1.3, pointRadius: 0 },
                { label: "Gear", data: CH.currentGear, borderColor: "#5ac8fa", yAxisID: "yGear", borderWidth: 1, stepped: true, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: { legend: { labels: { color: "#9fb0c8", font: { size: 10 } } } },
            scales: {
                x: { ticks: { color: "#7e8fa9", font: { size: 9 } }, grid: { color: "#1c2433" } },
                yPct: { position: "left", min: 0, max: 100, title: { display: true, text: "%", color: "#7e8fa9" }, ticks: { color: "#7e8fa9", font: { size: 9 } }, grid: { color: "#202a3d" } },
                yMain: { position: "right", min: 0, title: { display: true, text: "km/h · rpm · Nm", color: "#7e8fa9" }, ticks: { color: "#7e8fa9", font: { size: 9 } }, grid: { drawOnChartArea: false } },
                yGear: { position: "right", min: 0, max: 7, title: { display: true, text: "gear", color: "#7e8fa9" }, ticks: { stepSize: 1, color: "#7e8fa9", font: { size: 9 } }, grid: { drawOnChartArea: false } }
            }
        }
    });
}

// Append one vertical "slice" of data, dropping the oldest (rolling window).
function pushData() {
    const s = Sigs.signals;
    CH.labels.push("");                                   // Chart.js uses data ordering for time
    CH.accel.push(s.acceleratorPedal);
    CH.brake.push(s.brakePedal);
    CH.speed.push(+s.vehicleSpeed.toFixed(1));
    CH.rpm.push(s.engineRPM);
    CH.torque.push(s.engineTorque);
    CH.currentGear.push(gearToNum(s.currentGear));
    CH.targetGear.push(gearToNum(s.targetGear));

    if (CH.labels.length > MAX_POINTS) {
        ["labels", "accel", "brake", "speed", "rpm", "torque", "currentGear", "targetGear"]
            .forEach((k) => CH[k].shift());
    }
    if (chart) chart.update();
}

// Map gear label to a numeric axis value (P=0,N=1,R=2,1..6=3..8).
function gearToNum(g) {
    if (g === "P") return 0;
    if (g === "N") return 1;
    if (g === "R") return 2;
    const n = parseInt(g, 10);
    return (n >= 1 && n <= 6) ? n + 2 : 0;
}

// ---- Console logging ---------------------------------------------
function log(msg) {
    const box = document.getElementById("console-log");
    if (!box) return;
    const t = new Date().toLocaleTimeString("en-GB");
    const line = document.createElement("div");
    line.className = "console-line";
    line.innerHTML = `<span class="t">${t}</span> <span class="m">${msg}</span>`;
    box.appendChild(line);
    while (box.children.length > 200) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
}

// ---- DOM references ----------------------------------------------
const $ = (id) => document.getElementById(id);

// ---- Ignition rotary control --------------------------------------
// ---- Ignition UI (Push button + Rotary + Stage badges) ------------
function setIgnitionUI(state) {
    const knob = $("ignition-knob");
    const order = ["LOCK", "ACC", "ON", "START"];
    const angle = order.indexOf(state) * 45 - 45;   // -45..90
    if (knob) knob.style.transform = `rotate(${angle}deg)`;
    if ($("ignition-text")) $("ignition-text").textContent = state;

    // Update active ignition stage buttons
    document.querySelectorAll(".ign-stage-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.state === state);
    });

    // Update Engine Start / Stop push-button
    const essBtn = $("btn-start-stop");
    const essMain = $("ess-main-text");
    const essSub = $("ess-sub-text");

    if (essBtn) {
        essBtn.classList.remove("running", "ready", "cranking", "off");
        if (!vehicle.batteryOn) {
            essBtn.classList.add("off");
            if (essMain) essMain.textContent = "START";
            if (essSub) essSub.textContent = "STOP";
        } else if (vehicle.engineRunning()) {
            essBtn.classList.add("running");
            if (essMain) essMain.textContent = "STOP";
            if (essSub) essSub.textContent = "ENGINE";
        } else if (state === "START") {
            essBtn.classList.add("cranking");
            if (essMain) essMain.textContent = "CRANK";
            if (essSub) essSub.textContent = "START";
        } else if (state === "ON") {
            essBtn.classList.add("ready");
            if (essMain) essMain.textContent = "START";
            if (essSub) essSub.textContent = "ENGINE";
        } else {
            essBtn.classList.add("off");
            if (essMain) essMain.textContent = "START";
            if (essSub) essSub.textContent = "ENGINE";
        }
    }
}

// Battery master switch UI (toggle, label, top-bar chip).
function updateBatteryUI(on) {
    const txt = $("battery-text");
    if (txt) {
        txt.textContent = on ? "ON" : "OFF";
        txt.classList.toggle("on", on);
        txt.classList.toggle("off", !on);
    }
    const sw = $("battery-switch");
    if (sw) sw.checked = on;
    const chip = $("battery-status");
    if (chip) {
        chip.textContent = on ? "BATT ON" : "BATT OFF";
        chip.className = "status-chip " + (on ? "running" : "off");
    }
    setIgnitionUI(vehicle.ignitionState);
}

// ---- Sliders with optional pedal plate fill --------------------------
function bindSlider(id, labelId, onVal, fillBarId) {
    const input = $(id);
    const label = $(labelId);
    const fillBar = fillBarId ? $(fillBarId) : null;
    if (!input) return;
    const update = () => {
        const v = parseFloat(input.value);
        if (label) label.textContent = Math.round(v) + " %";
        if (fillBar) fillBar.style.height = `${Math.max(0, Math.min(100, v))}%`;
        onVal(v);
    };
    input.addEventListener("input", update);
    update();
}

// ---- Control wiring (run once) --------------------------------------
function wireControls() {
    // Battery master switch
    const battSwitch = $("battery-switch");
    if (battSwitch) {
        battSwitch.addEventListener("change", () => {
            const on = vehicle.setBattery(battSwitch.checked);
            updateBatteryUI(on);
            vehicle.publishSignals();
            dashboard.draw(Sigs.signals);
            log(on ? "BATTERY MASTER -> ON (ECU powered)" : "BATTERY MASTER -> OFF (ECU unpowered, engine killed)");
        });
    }

    // Engine Start / Stop Push Button
    const essBtn = $("btn-start-stop");
    if (essBtn) {
        essBtn.addEventListener("click", () => {
            if (!vehicle.batteryOn) {
                log("IGNITION BLOCKED - battery master switch is OFF");
                return;
            }
            if (!APP.running) {
                startSim();
            }
            if (vehicle.engineRunning()) {
                vehicle.setIgnitionState("LOCK");
                log("ENGINE STOP - ignition set to LOCK");
            } else {
                vehicle.setIgnitionState("START");
                log("ENGINE START PRESSED - cranking starter motor");
            }
            setIgnitionUI(vehicle.ignitionState);
            vehicle.publishSignals();
            dashboard.draw(Sigs.signals);
        });
    }

    // Ignition knob click (cycle)
    const rotary = $("rotary-interactive");
    if (rotary) {
        rotary.addEventListener("click", () => {
            if (!vehicle.batteryOn) {
                log("IGNITION BLOCKED - battery master is OFF");
                return;
            }
            vehicle.cycleIgnition();
            setIgnitionUI(vehicle.ignitionState);
            log(`IGNITION KEY CYCLED → ${vehicle.ignitionState}`);
        });
    }

    // "TURN KEY" button
    const btnIgn = $("btn-ignition");
    if (btnIgn) {
        btnIgn.addEventListener("click", () => {
            if (!vehicle.batteryOn) {
                log("IGNITION BLOCKED - battery master switch is OFF");
                return;
            }
            vehicle.cycleIgnition();
            setIgnitionUI(vehicle.ignitionState);
            log(`IGNITION → ${vehicle.ignitionState}`);
        });
    }

    // Ignition stage buttons (LOCK, ACC, ON, START)
    document.querySelectorAll(".ign-stage-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            if (!vehicle.batteryOn) {
                log("IGNITION BLOCKED - battery master is OFF");
                return;
            }
            const target = btn.dataset.state;
            vehicle.setIgnitionState(target);
            setIgnitionUI(target);
            log(`IGNITION STAGE → ${target}`);
        });
    });

    // Gear selector (P R N D) — vertical shifter gate
    const GEAR_NAMES = { P: "PARK", R: "REVERSE", N: "NEUTRAL", D: "DRIVE" };
    function moveShifter(g) {
        const sh = $("gear-shifter");
        if (sh) sh.dataset.active = g;
        const ro = $("shifter-readout");
        if (ro) ro.textContent = g + " — " + (GEAR_NAMES[g] || "");
    }
    ["P", "R", "N", "D"].forEach((g) => {
        const btn = $("btn-ga-" + g.toLowerCase());
        if (!btn) return;
        btn.addEventListener("click", () => {
            vehicle.inputs.gearSelector = g;
            document.querySelectorAll(".gear-btn").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            moveShifter(g);
            log(`GEAR SELECTOR → ${g}`);
        });
    });
    APP.moveShifter = moveShifter;

    // Pedals + slope
    bindSlider("accel-slider", "accel-val", (v) => { vehicle.inputs.accelerator = v; }, "accel-fill-bar");
    bindSlider("brake-slider", "brake-val", (v) => { vehicle.inputs.brake = v; }, "brake-fill-bar");
    bindSlider("slope-slider", "slope-val", (v) => {
        vehicle.inputs.slope = v;
        const dir = $("slope-direction");
        if (dir) dir.textContent = v > 0 ? "UPHILL" : (v < 0 ? "DOWNHILL" : "FLAT");
    });

    // Pedal shortcut buttons
    const setPedal = (sliderId, val) => {
        const slider = $(sliderId);
        if (slider) {
            slider.value = val;
            slider.dispatchEvent(new Event("input"));
        }
    };
    $("btn-accel-0")?.addEventListener("click", () => setPedal("accel-slider", 0));
    $("btn-accel-50")?.addEventListener("click", () => setPedal("accel-slider", 50));
    $("btn-accel-100")?.addEventListener("click", () => setPedal("accel-slider", 100));

    $("btn-brake-0")?.addEventListener("click", () => setPedal("brake-slider", 0));
    $("btn-brake-50")?.addEventListener("click", () => setPedal("brake-slider", 50));
    $("btn-brake-100")?.addEventListener("click", () => setPedal("brake-slider", 100));

    $("btn-slope-0")?.addEventListener("click", () => setPedal("slope-slider", 0));

    // Pedal plate clicks
    $("gas-pedal-plate")?.addEventListener("click", () => {
        const cur = parseFloat($("accel-slider").value || 0);
        setPedal("accel-slider", cur >= 90 ? 0 : cur + 25);
    });
    $("brake-pedal-plate")?.addEventListener("click", () => {
        const cur = parseFloat($("brake-slider").value || 0);
        setPedal("brake-slider", cur >= 90 ? 0 : cur + 50);
    });

    // Simulation transport
    $("btn-start").addEventListener("click", startSim);
    $("btn-stop").addEventListener("click", stopSim);
    $("btn-reset").addEventListener("click", resetAll);

    // Recording
    $("btn-rec").addEventListener("click", () => {
        APP.recording = true;
        $("rec-status").textContent = "REC ●";
        $("rec-status").classList.add("active");
        log("Graph recording STARTED");
    });
    $("btn-recstop").addEventListener("click", () => {
        APP.recording = false;
        $("rec-status").textContent = "STANDBY";
        $("rec-status").classList.remove("active");
        log("Graph recording STOPPED");
    });
    $("btn-rec-clear").addEventListener("click", clearChart);

    // Test scenarios
    document.querySelectorAll("[data-test]").forEach((btn) => {
        btn.addEventListener("click", () => startScenario(parseInt(btn.dataset.test, 10)));
    });

    // Bottom tabs (exclude the panel-collapse toggle button)
    document.querySelectorAll(".tab-btn[data-tab]").forEach((btn) => {
        btn.addEventListener("click", () => {
            switchTab(btn.dataset.tab);
            // Clicking a tab while collapsed also expands the panel.
            expandPanel();
        });
    });

    // Collapse / expand the bottom console panel
    const toggle = $("panel-toggle");
    if (toggle) {
        toggle.addEventListener("click", () => {
            const bar = document.querySelector(".bottombar");
            const collapsed = bar.classList.toggle("collapsed");
            toggle.textContent = collapsed ? "\u25B2 PANEL" : "\u25BC PANEL";
            toggle.title = collapsed ? "Expand panel" : "Minimize panel";
        });
    }

    setIgnitionUI(vehicle.ignitionState);
    log("Autodevv Virtual Vehicle ready. Start the simulation.");
}

function startSim() {
    if (APP.running) return;
    APP.running = true;
    APP.lastTime = null;
    $("btn-start").classList.add("active");
    $("btn-stop").classList.remove("active");
    log("SIMULATION STARTED");
    // Begin recording automatically for easy viewing.
    if (!APP.recording) {
        APP.recording = true;
        $("rec-status").textContent = "REC ●";
        $("rec-status").classList.add("active");
    }
}

function stopSim() {
    APP.running = false;
    APP.scenario = null;
    $("btn-start").classList.remove("active");
    $("btn-stop").classList.add("active");
    log("SIMULATION STOPPED");
}

function resetAll() {
    stopSim();
    vehicle.reset();
    setIgnitionUI("LOCK");
    // Reset UI sliders/gears to reflect the model.
    $("accel-slider").value = 0; $("accel-val").textContent = "0 %";
    $("brake-slider").value = 0; $("brake-val").textContent = "0 %";
    $("slope-slider").value = 0; $("slope-val").textContent = "0 %";
    $("slope-direction").textContent = "FLAT";
    document.querySelectorAll(".gear-btn").forEach((b) => b.classList.remove("active"));
    $("btn-ga-p").classList.add("active");
    if (APP.moveShifter) APP.moveShifter("P");
    clearChart();
    dashboard.draw(Sigs.signals);
    log("VEHICLE RESET — ignition LOCK, RPM 0, speed 0, fuel 100%");
}

function clearChart() {
    CH.labels.length = 0;
    ["accel", "brake", "speed", "rpm", "torque", "currentGear", "targetGear"]
        .forEach((k) => CH[k].length = 0);
    if (chart) chart.update();
    log("Graph data CLEARED");
}

// ---- Bottom tab panel switching -------------------------------------
function switchTab(name) {
    document.querySelectorAll(".tab-btn[data-tab]").forEach((b) => {
        b.classList.toggle("active", b.dataset.tab === name);
    });
    document.querySelectorAll(".tab-panel").forEach((p) => {
        p.classList.toggle("active", p.id === "panel-" + name);
    });
}

// Expand the bottom panel if it is minimized (used when a tab is clicked).
function expandPanel() {
    const bar = document.querySelector(".bottombar");
    const toggle = $("panel-toggle");
    if (bar && bar.classList.contains("collapsed")) {
        bar.classList.remove("collapsed");
        if (toggle) { toggle.textContent = "\u25BC PANEL"; toggle.title = "Minimize panel"; }
    }
}

// ---- HUD / tab content refresh ----------------------------------------
function updateHUD() {
    const s = Sigs.signals;
    setIgnitionUI(s.ignitionState);
    if ($("hud-rpm")) $("hud-rpm").textContent = s.engineRPM;
    if ($("hud-speed")) $("hud-speed").textContent = s.vehicleSpeed.toFixed(1);
    // Module-tab live states
    if ($("mod-engine")) { $("mod-engine").textContent = s.engineState; }
    if ($("mod-trans")) { $("mod-trans").textContent = s.currentGear; }
    updateSignalTree();
}

// Live populate of the "ECU Signals" tree in the left explorer.
function populateSignalTree() {
    const tree = $("signal-tree");
    if (!tree) return;
    const keys = ["ignitionState", "engineRPM", "vehicleSpeed", "engineTorque", "currentGear", "fuelLevel"];
    tree.innerHTML = keys.map((k) => {
        return `<div class="exp-node file sig" data-sig="${k}">▶ ${k}: <span class="sig-val" id="sigtree-${k}">—</span></div>`;
    }).join("");
}
function updateSignalTree() {
    const s = Sigs.signals;
    ["ignitionState", "engineRPM", "vehicleSpeed", "engineTorque", "currentGear", "fuelLevel"]
        .forEach((k) => {
            const el = $("sigtree-" + k);
            if (el) el.textContent = s[k];
        });
}

function updateVariablesTab() {
    const s = Sigs.signals;
    const box = $("variables-list");
    if (!box) return;
    if (APP.simStep % 6 !== 0) return;                      // throttle DOM writes
    const keys = [
        "batteryOn", "ignitionState", "vehicleState", "engineState", "engineRunning",
        "acceleratorPedal", "brakePedal", "slope",
        "vehicleSpeed", "engineRPM", "engineTorque",
        "currentGear", "targetGear", "engineTemperature", "fuelLevel"
    ];
    box.innerHTML = keys.map((k) => {
        let v = s[k];
        if (typeof v === "boolean") v = v ? "TRUE" : "FALSE";
        return `<div class="var-row"><span class="vk">${k}</span><span class="vv">${v}</span></div>`;
    }).join("");
}

function updateStatsTab(force) {
    const box = $("stats-body");
    if (!box) return;
    if (!force && !box.classList.contains("active")) return;
    const st = vehicle.stats;
    box.innerHTML = [
        ["Distance", st.distance.toFixed(1) + " m"],
        ["Max Speed", st.maxSpeed.toFixed(1) + " km/h"],
        ["Gear Shifts", st.shifts],
        ["Engine Starts", st.engineStarts],
        ["Engine Runtime", st.runtime.toFixed(1) + " s"],
        ["Vehicle Mass", vehicle.mass + " kg"],
        ["Final Drive", vehicle.finalDriveRatio]
    ].map(([k, v]) => `<tr><td>${k}</td><td class="val">${v}</td></tr>`).join("");
}

function updateConfigTab() {
    const box = $("config-body");
    if (!box) return;
    const cfg = [
        ["Mass", vehicle.mass + " kg"],
        ["Wheel Radius", vehicle.wheelRadius + " m"],
        ["Final Drive Ratio", vehicle.finalDriveRatio],
        ["Transmission Eff.", vehicle.transmissionEfficiency],
        ["Drag Coeff (Cd)", vehicle.dragCoefficient],
        ["Frontal Area", vehicle.frontalArea + " m²"],
        ["Rolling Res (Cr)", vehicle.rollingResistance],
        ["Max Brake Force", vehicle.maxBrakeForce + " N"],
        ["Max Decel (clamp)", vehicle.maxDecel + " m/s²"],
        ["Idle RPM", vehicle.engine.idleRpm]
    ];
    box.innerHTML = cfg.map(([k, v]) => `<tr><td>${k}</td><td class="val">${v}</td></tr>`).join("");
}

// ---- TEST SCENARIOS ----------------------------------------------------
// Each scenario drives the vehicle inputs programmatically over time.
function startScenario(id) {
    stopSim();
    vehicle.reset();
    setIgnitionUI("LOCK");
    APP.scenario = id;
    APP.scTime = 0;
    if (!APP.recording) {
        APP.recording = true;
        $("rec-status").textContent = "REC ●";
        $("rec-status").classList.add("active");
    }
    APP.running = true;
    APP.lastTime = null;
    $("btn-start").classList.add("active");
    clearChart();
    log(`TEST #${id} STARTED — ${scenarioName(id)}`);
}

function scenarioName(id) {
    return ["", "Engine Start", "Full Accelerator", "Full Brake", "0–100 km/h Test",
            "Automatic Gear Shift Test", "Reverse Test", "Hill Start", "Emergency Brake"][id] || "Test";
}

function runScenario(dt) {
    APP.scTime += dt;
    const i = vehicle.inputs;
    const t = APP.scTime;

    switch (APP.scenario) {
        case 1: // Engine Start
            if (t < 0.2) vehicle.ignitionState = "START";
            break;

        case 2: // Full Accelerator (requires engine first)
            if (t < 2.5) vehicle.ignitionState = "START";
            else if (t >= 2.5) {
                vehicle.ignitionState = "ON";
                i.gearSelector = "D";
                i.accelerator = Math.min(100, (t - 2.5) * 40);
            }
            if (t > 4 && i.accelerator === 100) APP.scenario = null;
            break;

        case 3: // Full Brake
            if (t < 6) vehicle.ignitionState = "START";
            else if (t >= 8 && i.brake < 100) i.brake = Math.min(100, (t - 8) * 80);
            break;

        case 4: // 0-100 km/h test
            if (t < 2.5) vehicle.ignitionState = "START";
            else if (t >= 2.5) {
                vehicle.ignitionState = "ON";
                i.gearSelector = "D";
                i.accelerator = 100;
                if (i.brake > 0) i.brake = Math.max(0, i.brake - 20 * dt);
            }
            if (t > 2.5 && Sigs.signals.vehicleSpeed >= 100) {
                i.accelerator = 0;
                APP.scenario = null;
                log("0–100 km/h TEST COMPLETE");
            }
            break;

        case 5: // Automatic Gear Shift Test
            if (t < 2.5) vehicle.ignitionState = "START";
            else if (t >= 2.5) {
                vehicle.ignitionState = "ON";
                i.gearSelector = "D";
                i.accelerator = Math.min(70, (t - 2.5) * 12);
            }
            if (t > 40) { i.accelerator = 0; APP.scenario = null; log("SHIFT TEST COMPLETE"); }
            break;

        case 6: // Reverse Test
            if (t < 2.5) vehicle.ignitionState = "START";
            else if (t >= 2.5 && t < 4) { vehicle.ignitionState = "ON"; i.gearSelector = "R"; }
            else if (t >= 4) {
                i.accelerator = Math.min(50, (t - 4) * 15);
                if (i.brake > 0) i.brake = Math.max(0, i.brake - 20 * dt);
            }
            if (t > 14) { i.accelerator = 0; i.brake = 100; APP.scenario = null; log("REVERSE TEST COMPLETE"); }
            break;

        case 7: // Hill Start
            if (t < 2.5) vehicle.ignitionState = "START";
            else if (t >= 2.5 && t < 4) { vehicle.ignitionState = "ON"; i.slope = 15; i.brake = 100; }
            else if (t >= 4 && t < 6) { i.brake = Math.max(0, 100 - (t - 4) * 80); i.accelerator = 60; i.gearSelector = "D"; }
            if (t > 8 && Sigs.signals.vehicleSpeed > 20) { i.slope = 0; APP.scenario = null; log("HILL START COMPLETE"); }
            break;

        case 8: // Emergency Brake from cruising speed
            if (t < 6) { vehicle.ignitionState = "START"; }
            else if (t < 10) { vehicle.ignitionState = "ON"; i.gearSelector = "D"; i.accelerator = 80; }
            else if (t >= 10) { i.accelerator = 0; i.brake = Math.min(100, (t - 10) * 120); }
            if (t > 12.5 && i.brake >= 100) { APP.scenario = null; log("EMERGENCY BRAKE COMPLETE"); }
            break;
    }
}

// ---- Simulation loop (fixed-timestep inside rAF) ------------------------
// Sub-steps of 1/120 hz keep the physics stable and independent of
// display refresh rate; the UI still renders at ~60 fps.
function frame(now) {
    if (APP.lastTime == null) APP.lastTime = now;
    const dt = (now - APP.lastTime) / 1000;
    APP.lastTime = now;

    if (APP.running) {
        const h = 1 / 120;
        let acc = Math.min(dt, 0.05);
        while (acc > 1e-6) {
            const s = Math.min(acc, h);
            vehicle.step(s);
            if (APP.scenario) runScenario(s);
            acc -= s;
        }

        APP.recAcc += dt;
        if (APP.recording && APP.recAcc >= 0.1) {      // charts at 10 Hz
            APP.recAcc = 0;
            pushData();
        }
        APP.simStep++;

        updateHUD();
        updateVariablesTab();
        updateStatsTab(false);
        dashboard.draw(Sigs.signals);
    }

    requestAnimationFrame(frame);
}

// ---- Boot ----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", boot);

function boot() {
    buildChart();
    wireControls();
    dockTransportMobile(); // move START/STOP/RESET after graph on mobile
    window.matchMedia("(max-width: 768px)").addEventListener("change", dockTransportMobile);
    updateConfigTab();
    updateStatsTab(true);
    populateSignalTree();
    dashboard.draw(Sigs.signals);
    // Build-tab log
    const bl = $("build-log");
    if (bl) {
        const lines = [
            "[build] compiling autodevv-virtual-vehicle ...",
            "[build] modules: engineModel.js, transmissionModel.js, vehicleModel.js, signalManager.js",
            "[build] done — 0 errors, 0 warnings ✔"
        ];
        lines.forEach((l) => { const d = document.createElement("div"); d.className = "build-success"; d.textContent = l; bl.appendChild(d); });
    }
    log("Autodevv Virtual Vehicle — SIL instrument cluster online.");
    // Mobile: keep gauges + chart crisp on rotate / resize / scroll.
    let _rzT = null;
    window.addEventListener("resize", () => {
        clearTimeout(_rzT);
        _rzT = setTimeout(() => {
            try { dashboard.draw(Sigs.signals); } catch (e) {}
            try { if (chart) chart.resize(); } catch (e) {}
        }, 120);
    });
    window.addEventListener("orientationchange", () => {
        setTimeout(() => {
            try { dashboard.draw(Sigs.signals); } catch (e) {}
            try { if (chart) chart.resize(); } catch (e) {}
        }, 250);
    });
    requestAnimationFrame(frame);
}

// ---- Mobile transport dock -------------------------------------------------
// On mobile the START/STOP/RESET buttons live AFTER the Real-Time Signal Graph
// (inside #transport-slot). On desktop they stay in the topbar. Wiring uses
// stable element IDs so moving the node keeps all listeners working.
function dockTransportMobile() {
    const slot = $("transport-slot");
    const topbar = document.querySelector(".topbar");
    let transport = slot ? slot.querySelector(".transport") : null;
    if (!transport) transport = topbar ? topbar.querySelector(".transport") : null;
    if (!transport || !slot || !topbar) return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
        if (transport.parentElement !== slot) slot.appendChild(transport);
    } else {
        if (transport.parentElement !== topbar) topbar.appendChild(transport);
    }
    try { if (chart) chart.resize(); } catch (e) {}
}