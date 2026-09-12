/* ============================================================
   transmissionModel.js
   ------------------------------------------------------------
   TRANSMISSION MODEL
   Automatic transmission: P R N D + 6 forward gears.

   - Selector input P / R / N / D.
   - In D the TargetGear is computed from speed bands, engine
     RPM and accelerator using hysteresis so it does not rapidly
     oscillate between gears.
   - The CurrentGear smoothly chases TargetGear over a short
     shift window (simulated shift time).
   - ratio() returns the net gear ratio (signed negative for R).
   ============================================================ */
class TransmissionModel {
    constructor(vehicle) {
        this.vehicle = vehicle;
        this.selector = "P";      // selected position P R N D
        this.currentGear = "P";   // physically engaged gear
        this.targetGear = "P";    // requested gear

        // Gear box ratios (forward). Reverse handled separately.
        this.gearRatios = {
            1: 3.40,
            2: 2.00,
            3: 1.45,
            4: 1.10,
            5: 0.85,
            6: 0.68
        };
        this.reverseRatio = 3.20; // stored as positive; direction sign = -1

        // Hysteresis / shift behaviour
        this.shiftTime = 0.6;     // seconds to complete a gear change
        this.shiftTimer = 0;
        this.finalDriveRatio = 3.5;
        this.transmissionEfficiency = 0.92;

        // Shift-denial warning: held for a short window so the cluster banner
        // stays visible (a denied request is latched back to the current gate,
        // so without a hold timer the next frame would clear the warning).
        this.shiftWarn = "";     // "" | "moving" | "brake" | "accel"
        this.warnTimer = 0;      // remaining hold seconds
        this.warnHold = 2.5;     // seconds before the warning auto-dismisses
    }

    // Speed-band edges facilitating gear selection (km/h)
    speedBand() {
        return { 1: 15, 2: 30, 3: 50, 4: 75, 5: 110, 6: Number.POSITIVE_INFINITY };
    }

    // Base gear purely from road speed.
    baseGearFromSpeed(kmh) {
        const bands = this.speedBand();
        let g = 1;
        for (let i = 1; i <= 6; i++) {
            if (kmh > bands[i]) g = i + 1;
            else break;
        }
        return Math.min(6, g);
    }

    // Automatic gear selection with RPM + throttle hysteresis.
    autoGear(kmh, rpm, throttle) {
        let target = this.baseGearFromSpeed(kmh);
        const cur = this.currentGearNum();
        const bands = this.speedBand();

        if (cur >= 1 && cur <= 6) {
            // Upshift when RPM crosses a throttle-dependent threshold AND the
            // next higher gear's floor speed is met (prevents hunting).
            if (cur < 6) {
                const upRpm = 2600 + throttle * 1400;      // 2600..4000 rpm
                if (rpm >= upRpm && kmh >= bands[cur]) {
                    target = Math.max(target, cur + 1);
                }
            }
            // Downshift when RPM falls low or speed drops below current gear band.
            if (cur > 1) {
                const downRpm = 1700 - throttle * 400;     // 1300..1700 rpm
                const prevFloor = (cur === 2) ? 0 : bands[cur - 2];
                if (rpm <= downRpm || kmh < bands[cur - 1] && kmh > 0) {
                    // Use a hysteresis band: don't downshift right after an upshift
                    if (kmh < bands[cur - 1]) {
                        target = Math.min(target, cur - 1);
                    }
                }
            }
        }
        return Math.max(1, Math.min(6, target));
    }

    // Current forward gear as a number (0 when not in a forward gear).
    currentGearNum() {
        const n = parseInt(this.currentGear, 10);
        return (n >= 1 && n <= 6) ? n : 0;
    }

    // Advance the transmission.
    update(dt, speed, rpm, throttle) {
        // Decay any active warning hold (dt may be 0 on UI-only refresh calls).
        if (this.warnTimer > 0) {
            this.warnTimer -= dt;
            if (this.warnTimer <= 0) { this.warnTimer = 0; this.shiftWarn = ""; }
        }

        const requested = this.vehicle.inputs.gearSelector; // P R N D
        const brake = this.vehicle.inputs.brake || 0;       // 0..100 %
        const kmh = Math.abs(speed) * 3.6;                  // road speed magnitude
        const curGate = this.selector;                      // P / R / N / D
        const sameGate = curGate === requested;

        // MANDATORY transition table & pedal dependency:
        // EVERY selector change (P/R/N/D gate swap) requires:
        //   1) vehicle stopped  2) brake pressed  3) accelerator released.
        // Same-gate requests (P->P, R->R, N->N, D->D) are always allowed.
        if (!sameGate) {
            const stopped = kmh < 0.5;              // speed ~ 0
            const brakePressed = brake >= 10;       // "PRESSED"
            const accelReleased = throttle < 0.01;  // "RELEASED"

            let block = null;
            if (!stopped) block = "moving";
            else if (!brakePressed) block = "brake";
            else if (!accelReleased) block = "accel";

            if (block) {
                // LATCHED OFF (safety rules 7/8): keep the current gate unchanged
                // and cancel the stale request — the driver must re-press the
                // gear button. Hold the warning visible for warnHold seconds.
                this.vehicle.inputs.gearSelector = curGate;
                this.shiftTimer = 0;
                this.shiftWarn = block;
                this.warnTimer = this.warnHold;
                // Keep the engaged gear consistent with the held gate.
                if (curGate === "R") this.targetGear = "R";
                else if (curGate === "P" || curGate === "N") this.targetGear = curGate;
                else this.targetGear = String(this.autoGear(speed * 3.6, rpm, throttle)); // D
                return;
            }

            // Valid selector change accepted — clear any stale warning.
            this.shiftWarn = "";
            this.warnTimer = 0;
        }

        // Resolve the (possibly new or unchanged) gate.
        this.selector = requested;
        if (this.selector === "P") {
            this.targetGear = "P";
        } else if (this.selector === "R") {
            this.targetGear = "R";
        } else if (this.selector === "N") {
            this.targetGear = "N";
        } else { // D
            this.targetGear = String(this.autoGear(speed * 3.6, rpm, throttle));
        }

        this._animateShift(dt);
    }

    // Animate gear engagement over a short shift window.
    _animateShift(dt) {
        if (this.targetGear !== this.currentGear) {
            this.shiftTimer += dt;
            if (this.shiftTimer >= this.shiftTime) {
                this.currentGear = this.targetGear;
                this.shiftTimer = 0;
            }
        } else {
            this.shiftTimer = 0;
        }
    }

    // Overall ratio of the engaged gear. Zero => no drive to wheels.
    // Returns a SIGNED ratio (negative for reverse).
    ratio() {
        if (this.currentGear === "R") return -this.reverseRatio;
        if (this.currentGear === "P" || this.currentGear === "N" || this.currentGear === "D") return 0;
        const n = this.currentGearNum();
        if (n === 0) return 0;
        return this.gearRatios[n];
    }

    reset() {
        this.selector = "P";
        this.currentGear = "P";
        this.targetGear = "P";
        this.shiftTimer = 0;
        this.shiftWarn = "";
        this.warnTimer = 0;
    }
}