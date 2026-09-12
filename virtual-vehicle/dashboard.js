/* ============================================================
   dashboard.js
   ------------------------------------------------------------
   DASHBOARD MODEL / RENDERER
   Renders the instrument cluster (RPM, Speed, Fuel, Coolant)
   and all live status panels (gear cluster, signal monitor,
   gear state matrix, current/target gear). Gauges are drawn
   on <canvas> so needles rotate smoothly every frame.
   ============================================================ */

// Generic analog gauge painter (used for speed and rpm dials).
function paintGauge(ctx, o) {
    const { cx, cy, radius } = o;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    const a0 = (o.startDeg - 90) * Math.PI / 180;      // canvas angle (0 = up)
    const a1 = (o.endDeg - 90) * Math.PI / 180;
    const clampedVal = Math.max(o.min, Math.min(o.max, o.value));
    const frac = (clampedVal - o.min) / (o.max - o.min);

    // Subtle dial face circular backing
    const bgGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, radius + 4);
    bgGrad.addColorStop(0, "rgba(22, 30, 44, 0.4)");
    bgGrad.addColorStop(0.85, "rgba(13, 17, 24, 0.75)");
    bgGrad.addColorStop(1, "rgba(8, 12, 18, 0.95)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius + (o.isBig ? 6 : 4), 0, Math.PI * 2);
    ctx.fillStyle = bgGrad;
    ctx.fill();

    // Outer subtle bezel border
    ctx.beginPath();
    ctx.arc(cx, cy, radius + (o.isBig ? 6 : 4), 0, Math.PI * 2);
    ctx.strokeStyle = o.isBig ? "rgba(47, 155, 255, 0.3)" : "rgba(42, 56, 80, 0.4)";
    ctx.lineWidth = o.isBig ? 2 : 1;
    ctx.stroke();

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, radius, a0, a1);
    ctx.strokeStyle = "#1a2334";
    ctx.lineWidth = o.trackWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Colored filled arc up to current value
    if (frac > 0.003) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, a0, a0 + (a1 - a0) * frac);
        ctx.strokeStyle = o.arcColor;
        ctx.lineWidth = o.trackWidth;
        ctx.lineCap = "round";
        if (o.isBig) {
            ctx.shadowColor = o.arcColor;
            ctx.shadowBlur = 10;
        }
        ctx.stroke();
        ctx.restore();
    }

    // Danger red-zone arc overlay
    if (o.redFrom != null) {
        const rf = (o.redFrom - o.min) / (o.max - o.min);
        const rfA = a0 + rf * (a1 - a0);
        ctx.beginPath();
        ctx.arc(cx, cy, radius, rfA, a1);
        ctx.strokeStyle = "rgba(255,69,58,0.45)";
        ctx.lineWidth = o.trackWidth;
        ctx.stroke();
    }

    // Tick marks
    const ticks = o.isBig ? 48 : 32;
    for (let i = 0; i <= ticks; i++) {
        const t = i / ticks;
        const ang = a0 + t * (a1 - a0);
        const major = i % (o.isBig ? 6 : 4) === 0;
        const outerR = radius - (major ? (o.isBig ? 6 : 4) : (o.isBig ? 10 : 8));
        const innerR = radius - (o.isBig ? 16 : 12);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
        ctx.lineTo(cx + Math.cos(ang) * innerR, cy + Math.sin(ang) * innerR);
        ctx.strokeStyle = major ? "#8fa8cc" : "#2f3e58";
        ctx.lineWidth = major ? (o.isBig ? 2.5 : 1.8) : 1;
        ctx.stroke();
    }

    // Numeric labels
    ctx.fillStyle = o.isBig ? "#d4e4f8" : "#9fb0c8";
    ctx.font = `600 ${o.labelSize}px 'Segoe UI', Roboto, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    (o.tickLabels || []).forEach((lab, i) => {
        const t = i / (o.tickLabels.length - 1);
        const ang = a0 + t * (a1 - a0);
        const lr = radius - (o.labelInset || 24);
        ctx.fillText(lab, cx + Math.cos(ang) * lr, cy + Math.sin(ang) * lr + 1);
    });

    // Needle (shape points up = -Y, so add +90deg to align with arc angles)
    const needleAng = a0 + frac * (a1 - a0);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(needleAng + Math.PI / 2);
    ctx.shadowColor = "rgba(0,0,0,0.65)";
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    ctx.beginPath();
    ctx.moveTo(-(o.isBig ? 3 : 2), 14);
    ctx.lineTo((o.isBig ? 3 : 2), 14);
    ctx.lineTo(0.5, -(radius - (o.isBig ? 14 : 10)));
    ctx.lineTo(-0.5, -(radius - (o.isBig ? 14 : 10)));
    ctx.closePath();
    ctx.fillStyle = o.needleColor || "#ff453a";
    ctx.fill();
    ctx.restore();

    // Metallic Center Hub
    const hubR = o.isBig ? 10 : 7;
    ctx.beginPath();
    ctx.arc(cx, cy, hubR, 0, Math.PI * 2);
    ctx.fillStyle = "#121924";
    ctx.fill();
    ctx.strokeStyle = o.isBig ? "#2f9bff" : "#5c6f8c";
    ctx.lineWidth = o.isBig ? 2.5 : 1.5;
    ctx.stroke();

    // Center digital readout + unit
    const readY = cy + radius * (o.isBig ? 0.62 : 0.70);
    ctx.fillStyle = "#ffffff";
    ctx.font = `800 ${o.readoutSize}px 'Segoe UI', Roboto, monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.valueText, cx, readY);

    ctx.fillStyle = o.isBig ? "#2f9bff" : "#7e8fa9";
    ctx.font = `600 ${Math.round(o.labelSize * 0.95)}px 'Segoe UI', Roboto, sans-serif`;
    ctx.fillText(o.unit || "", cx, readY + (o.isBig ? 18 : 12));
}

class Dashboard {
    constructor() {
        // Canvases for the dials (speed = big, rpm = small).
        this.canvases = {
            rpm: document.getElementById("gauge-rpm"),
            speed: document.getElementById("gauge-speed"),
            temp: document.getElementById("gauge-temp")
        };
        this.ctx = {};
        Object.keys(this.canvases).forEach((k) => {
            const c = this.canvases[k];
            if (!c) return;                       // defensive: element may be missing
            c.width = c.clientWidth;
            c.height = c.clientHeight;
            this.ctx[k] = c.getContext("2d");
        });

        // Gear cluster + indicators.
        this.gearSlot = document.querySelectorAll("#gear-cluster .gear-slot");
        this.curBox = document.getElementById("cur-gear-box");
        this.tgtBox = document.getElementById("tgt-gear-box");
        this.monitorBody = document.getElementById("signal-monitor-body");
        this.matrixBody = document.getElementById("gear-matrix-body");
        this.engineStatus = document.getElementById("engine-status");
        this.vehicleStatus = document.getElementById("vehicle-status");
    }

    // Main entry, called once per rendered frame.
    draw(signals) {
        // Small RPM Tachometer Gauge
        this.paintDial("rpm", signals.engineRPM, 0, 8000, {
            unit: "RPM ×1000", startDeg: 135, endDeg: 405, arcColor: "#39e27b",
            tickLabels: ["0", "2", "4", "6", "8"], redFrom: 6500, valueShort: true,
            isSmall: true
        });

        // 1 Big Speedometer Gauge (dominant)
        this.paintDial("speed", signals.vehicleSpeed, 0, 240, {
            unit: "KM/H", startDeg: 135, endDeg: 405, arcColor: "#2f9bff",
            tickLabels: ["0", "30", "60", "90", "120", "150", "180", "210", "240"],
            isBig: true
        });

        // Small mobile HUD text widgets: gear position + fuel % (single row).
        const gearEl = document.getElementById("hud-gear");
        if (gearEl) gearEl.textContent = signals.currentGear;
        const fuelEl = document.getElementById("hud-fuel");
        if (fuelEl) fuelEl.textContent = Math.round(signals.fuelLevel);
        // Small HORIZONTAL Fuel Gauge (DOM bar) — turns red below 15%.
        const fuelFill = document.getElementById("aux-fuel-fill");
        const fuelVal = document.getElementById("aux-fuel-val");
        if (fuelFill) {
            fuelFill.style.width = `${Math.max(0, Math.min(100, signals.fuelLevel))}%`;
            fuelFill.classList.toggle("low", signals.fuelLevel < 15);
        }
        if (fuelVal) {
            fuelVal.textContent = `${Math.round(signals.fuelLevel)}%`;
            fuelVal.classList.toggle("low", signals.fuelLevel < 15);
        }

        const tempFill = document.getElementById("aux-temp-fill");
        const tempVal = document.getElementById("aux-temp-val");
        if (tempFill) {
            const tempPct = Math.max(0, Math.min(100, ((signals.engineTemperature - 20) / (130 - 20)) * 100));
            tempFill.style.width = `${tempPct}%`;
        }
        if (tempVal) tempVal.textContent = `${Math.round(signals.engineTemperature)}°C`;

        // Shift-interlock cluster warnings: PRESS BRAKE (P->gear w/o brake),
        // reverse shift ignored while moving.
        const warnEl = document.getElementById("shift-warn");
        if (warnEl) {
            let msg = "";
            if (signals.brakeWarning) msg = "⚠ PRESS BRAKE TO SHIFT FROM PARK";
            else if (signals.reverseLock) msg = "⚠ STOP VEHICLE TO ENGAGE REVERSE";
            warnEl.textContent = msg;
            warnEl.classList.toggle("show", msg !== "");
        }

        this.updateGearCluster(signals.currentGear);
        this.updateCurrentTarget(signals);
        this.updateMonitor(signals);
        this.updateMatrix(signals);
        this.updateStatus(signals);
    }

    // Paint one dial using the generic painter (device-pixel-ratio crisp).
    paintDial(key, value, min, max, cfg) {
        const c = this.canvases[key];
        const ctx = this.ctx[key];
        if (!c) return;
        const dpr = window.devicePixelRatio || 1;
        const width = c.clientWidth || (cfg.isBig ? 300 : 175);
        const height = c.clientHeight || (cfg.isBig ? 225 : 175);
        if (c.width !== width * dpr || c.height !== height * dpr) {
            c.width = width * dpr;
            c.height = height * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(cx, cy) - (cfg.isBig ? 16 : 10);
        const valueText = cfg.valueShort ? String((Math.round(value / 100) / 10).toFixed(1)) : String(Math.round(value));
        paintGauge(ctx, {
            cx, cy, radius, min, max, value,
            startDeg: cfg.startDeg, endDeg: cfg.endDeg,
            arcColor: cfg.arcColor, needleColor: cfg.needleColor || "#ff453a",
            redFrom: cfg.redFrom, tickLabels: cfg.tickLabels,
            labelSize: cfg.isBig ? 13.5 : 10.5,
            labelInset: cfg.isBig ? 30 : 22,
            readoutSize: cfg.isBig ? 38 : 23,
            trackWidth: cfg.isBig ? 11 : 7,
            unit: cfg.unit, valueText,
            isBig: cfg.isBig
        });
    }

    // Highlight the currently selected gear in the central cluster.
    updateGearCluster(current) {
        this.gearSlot.forEach((slot) => {
            slot.classList.toggle("active", slot.dataset.gear === current);
        });
    }

    // Current / Target gear indicator widgets.
    updateCurrentTarget(signals) {
        const cur = signals.currentGear;
        this.curBox.textContent = cur === "D" ? "—" : cur;
        this.curBox.classList.toggle("isgear", /^[1-6]$/.test(cur));
        this.tgtBox.textContent = signals.targetGear === "D" ? "—" : signals.targetGear;
        this.tgtBox.classList.toggle("isgear", /^[1-6]$/.test(signals.targetGear));
    }

    // Live signal monitor table.
    updateMonitor(s) {
        if (!this.monitorBody) return;
        const rows = [
            ["IgnitionState", s.ignitionState],
            ["AcceleratorPedal", s.acceleratorPedal.toFixed(0) + " %"],
            ["BrakePedal", s.brakePedal.toFixed(0) + " %"],
            ["VehicleSpeed", s.vehicleSpeed.toFixed(1) + " km/h"],
            ["EngineRPM", s.engineRPM + " rpm"],
            ["EngineTorque", s.engineTorque + " Nm"],
            ["CurrentGear", s.currentGear],
            ["TargetGear", s.targetGear],
            ["EngineTemperature", s.engineTemperature + " °C"],
            ["FuelLevel", s.fuelLevel + " %"],
            ["EngineRunning", s.engineRunning ? "TRUE" : "FALSE"]
        ];
        this.monitorBody.innerHTML = rows
            .map(([k, v]) => `<tr><td>${k}</td><td class="val">${v}</td></tr>`)
            .join("");
    }

    // Gear state matrix (automotive test-style table: gears x A-E cells).
    updateMatrix(s) {
        if (!this.matrixBody) return;
        const gears = [1, 2, 3, 4, 5, 6, "R"];
        const cur = s.currentGear;
        const tgt = s.targetGear;
        const curIdx = gears.indexOf(cur); // -1 when in N/P/D
        const tgtIdx = gears.indexOf(tgt);

        const html = gears.map((g) => {
            const cells = ["A", "B", "C", "D", "E"].map(() => {
                return `<td class="cell"></td>`;
            }).join("");
            return `<tr><td class="gear-label">G${g}</td>${cells}</tr>`;
        }).join("");

        this.matrixBody.innerHTML = html;

        // Mark current gear cell (column E) and target gear cell (column B).
        if (curIdx >= 0) {
            const row = this.matrixBody.querySelectorAll("tr")[curIdx];
            if (row) row.querySelectorAll("td")[5].classList.add("cur");
        }
        if (tgtIdx >= 0 && tgtIdx !== curIdx) {
            const row = this.matrixBody.querySelectorAll("tr")[tgtIdx];
            if (row) row.querySelectorAll("td")[3].classList.add("tgt");
        }
    }

    // Engine + vehicle status readouts.
    updateStatus(s) {
        if (this.engineStatus) {
            this.engineStatus.textContent = s.engineRunning ? "RUNNING" : s.engineState;
            this.engineStatus.className = "status-chip " + (s.engineRunning ? "running" : s.engineState.toLowerCase());
        }
        if (this.vehicleStatus) {
            this.vehicleStatus.textContent = s.vehicleState;
            this.vehicleStatus.className = "status-chip " + s.vehicleState.toLowerCase().replace(/\s+/g, "_");
        }
    }
}