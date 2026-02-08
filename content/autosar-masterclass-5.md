---
title: "AUTOSAR Masterclass: Part 5 - Stability Stacks (Mem & Diag)"
date: "Feb 09, 2026"
excerpt: "How cars remember settings and detect faults. Explore the Memory Stack (NvM) and the Diagnostic Stack (DCM/DEM) in the BSW."
category: "Embedded Systems"
tags: ["AUTOSAR", "NvM", "Diagnostics", "DEM", "DCM"]
prev_link: "article-autosar-masterclass-4.html"
next_link: "article-autosar-masterclass-6.html"
---

A car that forgets your steering wheel position or doesn't know why the "Check Engine" light is on is a poorly designed system. 

In AUTOSAR, these critical safety and convenience features are handled by the **Stability Stacks**: The Memory Stack and the Diagnostic Stack.

---

## 1) The Memory Stack (NvM)

Embedded memory (like EEPROM or Flash) is slow and can wear out. The **Non-Volatile Memory (NvM)** module abstracts these complexities.

### The Problem: Flash vs C Logic
Your Application SWC wants to save a setting. It shouldn't care if it's being saved to an external SPI Flash or internal CPU EEPROM. 

### The Solution: Blocks & RAM Mirrors
1. **The Block**: Data is organized into blocks (e.g., `Block_UserPreferences`).
2. **RAM Mirror**: To keep the system fast, the NvM maintains a copy of the data in RAM.
3. **Implicit/Explicit Sync**: The SWC writes to the RAM mirror, and the NvM handles the background task of writing it to the physical hardware.

<div class="nvm-diagram" style="margin: 2rem 0; padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: space-around;">
    <div style="text-align: center; width: 30%;">
        <div style="background: rgba(59, 130, 246, 0.2); border: 1px solid #3b82f6; padding: 10px; border-radius: 4px; color: #3b82f6; font-size: 0.8rem;">Application SWC</div>
        <i class="fa-solid fa-arrow-right" style="margin: 10px 0; color: var(--text-muted);"></i>
    </div>
    <div style="text-align: center; width: 30%; background: var(--glass); padding: 10px; border-radius: 8px; border: 1px solid var(--border);">
        <strong style="color: var(--secondary); font-size: 0.9rem;">NvM Module</strong>
        <div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 5px;">(RAM Mirror)</div>
    </div>
    <div style="text-align: center; width: 30%;">
        <i class="fa-solid fa-arrow-right" style="margin: 10px 0; color: var(--text-muted);"></i>
        <div style="background: #2a2a2a; border: 1px solid #444; padding: 10px; border-radius: 4px; color: #aaa; font-size: 0.8rem;">Physical Flash</div>
    </div>
</div>

---

## 2) The Diagnostic Stack (DCM & DEM)

Modern cars are rolling sensors. If a sensor fails, the car must record it. This is the domain of **OBD (On-Board Diagnostics)** and **UDS (Unified Diagnostic Services)**.

### A. Diagnostic Event Manager (DEM)
The "Black Box Recorder". When an error occurs (e.g., `Voltage_Too_High`), the software reports it to the DEM.
- **DTC (Diagnostic Trouble Code)**: The DEM stores a unique code for the error (e.g., P0101).
- **Freeze Frame**: It records the vehicle state (Speed, Temp, Time) the exact moment the error happened.

### B. Diagnostic Communication Manager (DCM)
The "External Interface". When a mechanic plugs a scan tool into the OBD port, they talk to the DCM.
- It handles the **UDS Protocol**.
- It retrieves DTCs from the DEM.
- It allows the mechanic to trigger hardware tests (e.g., "Flash the headlights").

---

## 3) Function Inhibitor Manager (FiM)

The FiM is the "Safety Guard". If the DEM detects a critical error, it tells the FiM to **inhibit** certain car functions.
- **Example**: If the "Brake Sensor" has a DTC, the FiM may disable the "Cruise Control" for safety.

---

## 4) Summary

The Stability Stacks ensure that:
1. Data is **Persistent** (remembered after the key is turned off).
2. Faults are **Observable** (mechanics can find the problem).
3. The system is **Self-Aware** (blocking dangerous functions during failure).

In [Part 6: From Config to Code](article-autosar-masterclass-6.html), we will wrap up the series by looking at the **Methodology**—how we actually move from an idea to a running ECU using tools and ARXML.
