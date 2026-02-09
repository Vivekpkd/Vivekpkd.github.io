---
title: "AUTOSAR Masterclass: Part 4 - Data in Motion (COM Stack)"
date: "Feb 09, 2026"
excerpt: "Deep dive into the AUTOSAR Communication Stack. Learn how signals travel from your application to the CAN/Ethernet bus through the PduR and COM modules."
category: "AUTOSAR"
tags: ["AUTOSAR", "COM Stack", "CAN", "PduR", "Networking"]
prev_link: "article-autosar-masterclass-3.html"
next_link: "article-autosar-masterclass-5.html"
---

In [Part 3: The Glue (RTE)](article-autosar-masterclass-3.html), we saw how Application Software talks to the middleware. But how does that data actually leave the ECU and travel across a wire? 

Welcome to the **Communication Stack (COM Stack)**.

---

## 1) The Role of the COM Stack

The COM Stack is a vertical pillar in the Basic Software (BSW). Its job is to provide a standardized way to send and receive data via automotive networks (CAN, LIN, FlexRay, Ethernet).

It abstracts the network specifics so the **RTE** doesn't need to know if it's talking over a 500kbps CAN bus or a 1Gbps Ethernet link.

---

## 2) The Main Actors (Modules)

The COM Stack is composed of several specialized modules. Think of it like a relay race where the "Data Packet" is the baton.

<div class="com-stack-diagram" style="margin: 3rem 0; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;">
    <!-- COM -->
    <div style="background: rgba(16, 185, 129, 0.2); border: 2px solid #10b981; padding: 1rem; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <strong style="color: #10b981;">COM Module</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);">Signals to PDUs (Packing/Unpacking, Filtering)</div>
    </div>
    
    <div style="text-align: center; margin-bottom: 20px;"><i class="fa-solid fa-arrow-down" style="color: var(--primary);"></i></div>

    <!-- PduR -->
    <div style="background: rgba(59, 130, 246, 0.2); border: 2px solid #3b82f6; padding: 1rem; border-radius: 8px; margin-bottom: 20px; text-align: center;">
        <strong style="color: #3b82f6;">PDU Router (PduR)</strong>
        <div style="font-size: 0.8rem; color: var(--text-muted);">The Traffic Controller (Routes PDUs to the right Bus)</div>
    </div>

    <div style="text-align: center; margin-bottom: 20px;"><i class="fa-solid fa-arrow-down" style="color: var(--primary);"></i></div>

    <!-- Interface Layers -->
    <div style="display: flex; justify-content: space-around;">
        <div style="width: 45%; background: rgba(139, 92, 246, 0.1); border: 1px solid var(--primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <strong style="color: var(--primary);">CAN Interface</strong>
        </div>
        <div style="width: 45%; background: rgba(139, 92, 246, 0.1); border: 1px solid var(--primary); padding: 1rem; border-radius: 8px; text-align: center;">
            <strong style="color: var(--primary);">Eth Interface</strong>
        </div>
    </div>
</div>

### A. COM Module
This is the entry point. It converts high-level **Signals** (like `EngineSpeed`) into **PDUs** (Protocol Data Units—raw byte arrays). It handles:
- Signal Packing/Unpacking.
- Filtering (e.g., only send if value changes).
- Transmission deadlines.

### B. PDU Router (PduR)
The "Heart" of the stack. It receives a PDU and decides where it goes.
- Is it for the CAN Interface? 
- Should it be routed to another ECU (Gatewaying)? 
- Is it a large message that needs the **Transport Protocol (CanTp)**?

### C. Interface Layers (CanIf / LinIf)
These modules abstract the hardware. They provide a common set of APIs for the PduR regardless of which CAN controller chip is being used.

---

## 3) The Life of a Message (Transmission)

1. **SWC**: Calls `Rte_Write_Port_Speed(120)`.
2. **RTE**: Calls `Com_SendSignal(SignalID, 120)`.
3. **COM**: Packs '120' into Byte 2 of PDU_01. Calls `PduR_ComTransmit(PduID, &data)`.
4. **PduR**: Sees that PDU_01 belongs to CAN_BUS_1. Calls `CanIf_Transmit(PduID, &data)`.
5. **CanIf**: Calls the **MCAL** driver function: `Can_Write(Hth, &pduinfo)`.
6. **MCAL**: Writes the data to the physical SPI or internal registers of the CAN peripheral.

---

## 4) Transport Protocols (TP)

What if you need to send a **Diagnostic Message** that is 100 bytes long, but CAN only supports 8 bytes per frame?
The **CanTp** module handles this by:
- **Segmentation**: Breaking the 100 bytes into small frames.
- **Flow Control**: Ensuring the receiver isn't overwhelmed.
- **Reassembly**: Putting it back together on the other side.

---

## 5) Summary

The COM Stack is a high-performance, strictly ordered pipeline. It ensures that data moves from a logical variable in your code to a voltage spike on a wire with mathematical precision.

In [Part 5: Stability & Storage](article-autosar-masterclass-5.html), we will look at how AUTOSAR handles permanent data storage (NvM) and error detection (DEM/DCM).
