/* ============================================================
   engineModel.js
   ------------------------------------------------------------
   ENGINE MODEL
   A simplified but realistic internal-combustion-engine model.

   States : OFF, CRANKING, IDLE, RUNNING, STALL
   Reads oxygen-free fuel mapping via throttle (0..1), steps
   engine speed through time-based integration so RPM changes
   smoothly, and derives torque from an interpolated torque
   curve scaled by the accelerator position.
   ============================================================ */
class EngineModel {
    constructor() {
        this.state = "OFF";
        this.rpm = 0;
        this.torque = 0;
        this.temperature = 25; // °C

        // Operating parameters
        this.idleRpm = 800;       // target idle
        this.maxRpm = 7500;       // absolute limit
        this.redline = 6500;      // start of red zone (marking)
        this.startRpm = 300;      // RPM where combustion begins (from cranking)
        this.stallRpm = 250;      // RPM below which a loaded engine may stall
        this.torqueEfficiency = 0.9;

        // RPM dynamics (time-based integration gains)
        this.accelRate = 1.8;     // how fast RPM chases target on acceleration
        this.decelRate = 1.2;     // how fast RPM decays toward idle
        this.crankRate = 5.0;     // starter spin-up rate (0 -> startRpm)

        // Torque curve table: [RPM, torque Nm] (simplified)
        this.torqueCurve = [
            [800,   100],
            [1200,  150],
            [1800,  200],
            [2500,  230],
            [3500,  240],
            [4500,  220],
            [5500,  190],
            [6500,  150]
        ];
    }

    // Linear interpolation of peak torque across the curve.
    getMaxTorque(rpm) {
        const c = this.torqueCurve;
        if (rpm <= c[0][0]) return c[0][1];
        if (rpm >= c[c.length - 1][0]) return c[c.length - 1][1];
        for (let i = 0; i < c.length - 1; i++) {
            const r0 = c[i][0], t0 = c[i][1];
            const r1 = c[i + 1][0], t1 = c[i + 1][1];
            if (rpm >= r0 && rpm <= r1) {
                const t = (rpm - r0) / (r1 - r0);
                return t0 + t * (t1 - t0);
            }
        }
        return c[c.length - 1][1];
    }

    // Step the engine one fixed timestep.
    //  dt          : seconds
    //  throttle    : 0..1 accelerator position
    //  ignition    : "LOCK" | "ACC" | "ON" | "START"
    //  brakeFrac   : 0..1 brake position (used as engine load)
    update(dt, throttle, ignition, brakeFrac) {
        const ignitionOn = (ignition === "ON");
        const cranking = (ignition === "START");

        // ---- Thermal model: warm up toward 90°C when running, cool otherwise
        const running = (this.state === "RUNNING" || this.state === "IDLE");
        if (running) {
            this.temperature += (90 - this.temperature) * 0.004;
        } else {
            this.temperature += (25 - this.temperature) * 0.002;
        }

        switch (this.state) {
            case "OFF":
                this.rpm = 0;
                this.torque = 0;
                // Starter engages when ignition is held at START
                if (cranking) {
                    this.state = "CRANKING";
                }
                break;

            case "CRANKING":
                // Starter cranks engine up toward startRpm
                this.rpm += (this.startRpm - this.rpm) * Math.min(1, this.crankRate * dt);
                this.torque = 0;
                if (this.rpm >= this.startRpm - 1) {
                    this.state = "IDLE";   // engine "caught"
                }
                break;

            case "IDLE":
            case "RUNNING": {
                if (!ignitionOn && !cranking) {
                    // Key off -> engine dies
                    this.state = "OFF";
                    this.rpm = 0;
                    this.torque = 0;
                    break;
                }

                // Engine load reduces available RPM when brakes applied in gear
                const loadDrop = brakeFrac * 250;

                // Determine target RPM
                let targetRpm;
                if (throttle < 0.02) {
                    targetRpm = this.idleRpm;
                    this.state = "IDLE";
                } else {
                    targetRpm = this.idleRpm + throttle * (this.maxRpm - this.idleRpm);
                    this.state = "RUNNING";
                }
                targetRpm -= loadDrop;

                // Time-based RPM integration (smooth, inertial feel)
                const rate = (targetRpm > this.rpm) ? this.accelRate : this.decelRate;
                this.rpm += (targetRpm - this.rpm) * Math.min(1, rate * dt);

                // Never drop below ~idle while running
                const floor = this.idleRpm * 0.9;
                if (this.rpm < floor) this.rpm = floor;
                if (this.rpm > this.maxRpm) this.rpm = this.maxRpm;

                // Derive torque from curve, then scale by throttle & efficiency
                const peak = this.getMaxTorque(this.rpm);
                this.torque = peak * throttle * this.torqueEfficiency;

                // Possible stall when heavily loaded at very low rpm
                if (this.rpm <= this.stallRpm && brakeFrac > 0.9) {
                    this.state = "STALL";
                }
                break;
            }

            case "STALL":
                // Spinning down to dead stop
                this.rpm += (0 - this.rpm) * Math.min(1, 2 * dt);
                this.torque = 0;
                if (this.rpm < 20) this.state = "OFF";
                break;
        }
    }

    // The engine is "running" whenever it holds combustion.
    isRunning() {
        return this.state === "RUNNING" || this.state === "IDLE";
    }

    reset() {
        this.state = "OFF";
        this.rpm = 0;
        this.torque = 0;
        this.temperature = 25;
    }
}