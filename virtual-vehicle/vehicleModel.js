/* ============================================================
   vehicleModel.js
   ------------------------------------------------------------
   VEHICLE MODEL (Longitudinal dynamics + ignition coordinator)
   ------------------------------------------------------------
   Data path (approx. ECU-style):

       InputModel (user inputs)
            ↓
       EngineModel ──> TransmissionModel
            ↓
       Vehicle Physics (longitudinal dynamics)
            ↓
       SignalManager (signal bus)
            ↓
       Dashboard + Charts + Monitor

   All physics use SI units internally (m/s, N, kg); vehicle
   speed is converted to km/h only at the signal/display layer.
   ============================================================ */
class VehicleModel {
    constructor(signalManager) {
        this.signals = signalManager;
        this.inputs = { accelerator: 0, brake: 0, slope: 0, gearSelector: "P" };

        this.engine = new EngineModel();
        this.transmission = new TransmissionModel(this);

        // ---- Longitudinal vehicle parameters
        this.mass = 1500;                 // kg
        this.gravity = 9.81;              // m/s^2
        this.wheelRadius = 0.33;          // m
        this.finalDriveRatio = 3.5;
        this.transmissionEfficiency = 0.92;
        this.dragCoefficient = 0.30;
        this.frontalArea = 2.2;           // m^2
        this.airDensity = 1.225;          // kg/m^3
        this.rollingResistance = 0.012;   // Cr
        this.maxBrakeForce = 12000;       // N (full brake pedal)
        this.maxDecel = 14;               // m/s^2 safety cap for stability

        // ---- State
        this.ignitionState = "LOCK";      // LOCK ACC ON START
        this.batteryOn = true;            // battery master switch (ECU power)
        this.speed = 0;                   // m/s (signed: +fwd, -rev)
        this.position = 0;                // m
        this.fuel = 100;                  // %
        this.fuelConsumption = 0.012;     // % per second while running

        // Stat accumulators
        this.stats = {
            distance: 0,
            maxSpeed: 0,
            shifts: 0,
            engineStarts: 0,
            runtime: 0
        };
        this._lastGear = "P";
        this._acceleration = 0;
    }

    // ---- Convenience accessors
    engineRunning() { return this.engine.isRunning(); }
    brakeFrac() { return this.inputs.brake / 100; }
    throttle() { return this.inputs.accelerator / 100; }

    // ---- Ignition rotation LOCK -> ACC -> ON -> START (START is momentary)
    advanceIgnition() {
        this.cycleIgnition();
    }

    cycleIgnition() {
        if (!this.batteryOn) return;
        const order = ["LOCK", "ACC", "ON", "START"];
        const idx = order.indexOf(this.ignitionState);
        const next = order[(idx + 1) % order.length];
        this.setIgnitionState(next);
    }

    setIgnitionState(state) {
        if (!this.batteryOn) return;
        const valid = ["LOCK", "ACC", "ON", "START"];
        if (!valid.includes(state)) return;
        this.ignitionState = state;
        if (state === "LOCK" || state === "ACC") {
            if (this.engine.state !== "OFF") {
                this.engine.state = "OFF";
                this.engine.rpm = 0;
                this.engine.torque = 0;
            }
        }
    }

    toggleStartStop() {
        if (!this.batteryOn) return false;
        if (this.engineRunning()) {
            this.setIgnitionState("LOCK");
            return false;
        } else {
            this.setIgnitionState("START");
            return true;
        }
    }

    // ---- Battery master switch: cutting power kills the ECU, the ignition
    // authority and the engine immediately (like disconnecting the 12V rail).
    setBattery(on) {
        this.batteryOn = !!on;
        if (!this.batteryOn) {
            this.ignitionState = "LOCK";  // key loses all authority
            this.engine.state = "OFF";    // instant power cut
            this.engine.rpm = 0;
            this.engine.torque = 0;
        }
        return this.batteryOn;
    }

    // Safety / reset.
    reset() {
        this.ignitionState = "LOCK";
        this.batteryOn = true;
        this.inputs.accelerator = 0;
        this.inputs.brake = 0;
        this.inputs.slope = 0;
        this.inputs.gearSelector = "P";
        this.speed = 0;
        this.position = 0;
        this.fuel = 100;
        this._acceleration = 0;
        this.engine.reset();
        this.transmission.reset();
        this.stats = { distance: 0, maxSpeed: 0, shifts: 0, engineStarts: 0, runtime: 0 };
        this._lastGear = "P";
    }

    // Record a gear shift when the engaged gear changes.
    _trackShift(newGear) {
        if (this._lastGear !== newGear) {
            this._lastGear = newGear;
            this.stats.shifts++;
        }
    }

    // ---- Main per-frame step
    step(dt) {
        dt = Math.min(dt, 0.033); // clamp to avoid spiral of death
        const inputs = this.inputs;

        // 0) POWER SUPPLY: battery master cut forces the ECU into LOCK
        // (engine dies on the next engine.update because ignition != ON/START).
        if (!this.batteryOn && this.ignitionState !== "LOCK") {
            this.ignitionState = "LOCK";
        }

        // If engine was off and we just entered START, count a start attempt.
        const wasRunning = this.engineRunning();

        // 1) UPDATE ENGINE
        this.engine.update(dt, this.throttle(), this.ignitionState, this.brakeFrac());

        if (!wasRunning && this.engineRunning()) {
            this.stats.engineStarts++;
        }

        // Automatic return from START to ON once engine has caught.
        if (this.ignitionState === "START" && this.engineRunning()) {
            this.ignitionState = "ON";
        }

        // 2) UPDATE TRANSMISSION
        this.transmission.update(dt, this.speed, this.engine.rpm, this.throttle());
        this._trackShift(this.transmission.currentGear);

        // 3) COMPUTE DRIVE FORCE
        const ratio = this.transmission.ratio();      // signed
        const engaged = ratio !== 0;
        const driveDir = engaged ? (ratio > 0 ? 1 : -1) : 0;

        let driveForceMag = 0;
        if (engaged && this.engineRunning()) {
            driveForceMag =
                this.engine.torque *
                Math.abs(ratio) *
                this.finalDriveRatio *
                this.transmissionEfficiency /
                this.wheelRadius;
        }
        const Fd = driveForceMag * driveDir;           // signed drive force

        // 4) EXTERNAL FORCES
        const v = this.speed;
        const slopeAngle = Math.atan(inputs.slope / 100); // positive = uphill
        const Fslope = -this.mass * this.gravity * Math.sin(slopeAngle); // pushes downhill
        const signV = v > 0 ? 1 : (v < 0 ? -1 : 0);
        const airMag = 0.5 * this.airDensity * this.dragCoefficient * this.frontalArea * v * v;
        const rollMag = this.rollingResistance * this.mass * this.gravity;
        const FbrakeMag = (inputs.brake / 100) * this.maxBrakeForce;

        // 5) NET FORCE / ACCELERATION
        let a;
        if (Math.abs(v) < 0.05) {
            // STANDSTILL: resolve whether drive/slope overcomes static friction + brake.
            const push = Fd + Fslope;                  // force trying to set vehicle in motion
            const staticResist = FbrakeMag + rollMag;   // hold force
            if (Math.abs(push) <= staticResist) {
                a = 0;                                  // held
            } else {
                a = push / this.mass;                   // break free (ignore velocity resists)
            }
        } else {
            // MOVING: resistances oppose current motion, brake opposes motion.
            const dragForce = -signV * airMag;
            const rollForce = -signV * rollMag;
            const brakeForce = -signV * FbrakeMag;
            const Fnet = Fd + Fslope + dragForce + rollForce + brakeForce;
            a = Fnet / this.mass;
        }

        // Stability clamp.
        if (a > this.maxDecel) a = this.maxDecel;
        if (a < -this.maxDecel) a = -this.maxDecel;
        this._acceleration = a;

        // 6) INTEGRATE
        let newSpeed = v + a * dt;
        // Zero-out micro creep so it looks parked.
        if (Math.abs(newSpeed) < 0.005) newSpeed = 0;
        // Only reverse when actually in R (prevents driving "backwards" in D).
        if (this.transmission.currentGear !== "R" && newSpeed < 0) newSpeed = 0;
        this.speed = newSpeed;
        this.position += this.speed * dt;

        // 7) FUEL
        if (this.engineRunning()) {
            this.fuel = Math.max(0, this.fuel - this.fuelConsumption * dt);
        }

        // 8) STATS
        this.stats.distance = Math.abs(this.position);
        this.stats.runtime += this.engineRunning() ? dt : 0;
        if (Math.abs(this.speed) * 3.6 > this.stats.maxSpeed) {
            this.stats.maxSpeed = Math.abs(this.speed) * 3.6;
        }

        // 9) PUBLISH TO SIGNAL BUS
        this.publishSignals();
    }

    // Derive a coarse "vehicle state" label.
    vehicleState() {
        const ign = this.ignitionState;
        const run = this.engineRunning();
        if (!run) {
            if (ign === "LOCK") return "OFF";
            if (ign === "ACC") return "ACCESSORY";
            if (ign === "START") return "STARTING";
            return "IGNITION_ON";
        }
        if (this.transmission.currentGear === "R") return "REVERSE";
        if (this.transmission.currentGear === "N") return "NEUTRAL";
        if (this.transmission.currentGear === "P") return "PARK";
        const decel = Math.abs(this.speed) > 0.5 && this._acceleration < -0.4;
        if (this.brakeFrac() > 0.02 || decel) return "BRAKING";
        if (Math.abs(this.speed) < 0.3) return "IDLE";
        return "RUNNING";
    }

    publishSignals() {
        this.signals.set({
            ignitionState: this.ignitionState,
            batteryOn: this.batteryOn,
            acceleratorPedal: this.inputs.accelerator,
            brakePedal: this.inputs.brake,
            slope: this.inputs.slope,
            vehicleSpeed: this.speed * 3.6,          // display in km/h
            engineRPM: Math.round(this.engine.rpm),
            engineTorque: Math.round(this.engine.torque),
            currentGear: this.transmission.currentGear,
            targetGear: this.transmission.targetGear,
            engineTemperature: Math.round(this.engine.temperature),
            fuelLevel: +this.fuel.toFixed(1),
            engineRunning: this.engineRunning(),
            engineState: this.engine.state,
            vehicleState: this.vehicleState(),
            brakeWarning: !!this.transmission.brakeWarning,
            reverseLock: !!this.transmission.reverseLock
        });
    }
}