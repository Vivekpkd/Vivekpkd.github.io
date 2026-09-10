/* ============================================================
   signalManager.js
   ------------------------------------------------------------
   CAN-SIGNAL STYLE ARCHITECTURE
   A lightweight "signal bus" mimicking how an automotive ECU
   distributes real-time signals. Consumers (dashboard, charts,
   monitors) subscribe to signal updates. This makes it trivial
   to later swap the internal values with real CAN / WebSocket
   / HIL data by replacing the `signals` payload source.
   ============================================================ */
class SignalManager {
    constructor() {
        // Canonical signal set for the whole virtual vehicle.
        this.signals = {
            ignitionState: "LOCK",
            batteryOn: true,       // battery master switch (ECU power supply)
            acceleratorPedal: 0,   // 0..100 %
            brakePedal: 0,         // 0..100 %
            vehicleSpeed: 0,       // km/h
            engineRPM: 0,          // rpm
            engineTorque: 0,       // Nm
            currentGear: "P",      // P R N 1..6
            targetGear: "P",       // requested gear
            engineTemperature: 25, // °C
            fuelLevel: 100,        // 0..100 %
            engineRunning: false,
            engineState: "OFF",    // OFF CRANKING IDLE RUNNING STALL
            vehicleState: "OFF",   // gross vehicle state
            slope: 0               // + downhill, - ... (see UI)
        };
        this._listeners = new Set();
    }

    // Broadcast a partial or full update to all subscribers.
    set(payload) {
        Object.assign(this.signals, payload);
        this._listeners.forEach((fn) => fn(this.signals));
    }

    // Register a callback that fires on every signal update.
    subscribe(fn) {
        this._listeners.add(fn);
        return () => this._listeners.delete(fn);
    }
}

// Global instance shared across modules when loaded as plain scripts.
const SignalBus = new SignalManager();