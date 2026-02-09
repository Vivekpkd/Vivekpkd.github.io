---
title: "AUTOSAR Masterclass: Part 3 - The Glue (RTE)"
date: "Feb 09, 2026"
excerpt: "Master the Runtime Environment (RTE). The vital middleware that transforms virtual connections into real C code and handles task scheduling."
category: "AUTOSAR"
tags: ["AUTOSAR", "RTE", "Middleware", "Code Generation", "Scheduling"]
prev_link: "article-autosar-masterclass-2.html"
next_link: "article-autosar-masterclass-4.html"
---

In [Part 2: ASW & VFB](article-autosar-masterclass-2.html), we connected our Software Components on a "Virtual" bus. Now, it's time to get real. 

The **Runtime Environment (RTE)** is the heart of an AUTOSAR ECU. It is the middleware that sits between the Application Layer and the Basic Software (BSW).

---

## 1) What is the RTE?

The RTE is the **Communication Middleware**. Its primary job is to provide a uniform interface to Software Components, regardless of their location.

- **Intra-ECU**: Communication between two SWCs on the same CPU.
- **Inter-ECU**: Communication between SWCs on different ECUs (via CAN/Ethernet).
- **ASW-to-BSW**: Allowing application logic to access system services like memory or OS tasks.

### The "No-Hardware" Rule
Application developers **never** write direct hardware access code. Instead, they call RTE APIs. 
For example, instead of reading a register, they call:
`Rte_Read_Port_Speed(&data);`

---

## 2) The Glue Logic (Mapping)

The RTE is not a static library. It is **generated** specifically for your ECU configuration. 

When you configure your system, the RTE generator looks at your VFB design and maps it to the real world:
- If SWC-A and SWC-B are on the same core, the RTE creates a **Shared Variable**.
- If they are on different ECUs, the RTE triggers the **COM Stack** (Part 4) to send a network message.

<div class="mapping-diagram" style="margin: 3rem 0; padding: 2rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: top;">
        <!-- Application Layer -->
        <div style="width: 45%; border: 2px dashed #3b82f6; padding: 1rem; border-radius: 8px;">
            <div style="text-align: center; color: #3b82f6; font-weight: 800; margin-bottom: 20px;">APPLICATION LAYER</div>
            <div style="background: var(--glass); border: 1px solid var(--border); padding: 5px; margin-bottom: 5px; font-size: 0.8rem; text-align:center;">SWC Control</div>
            <div style="background: var(--glass); border: 1px solid var(--border); padding: 5px; font-size: 0.8rem; text-align:center;">SWC Monitor</div>
        </div>

        <div style="display: flex; flex-direction: column; justify-content: center; align-items: center; width: 10%;">
            <i class="fa-solid fa-arrow-right" style="color: var(--primary); font-size: 1.5rem;"></i>
        </div>

        <!-- RTE Generated Layer -->
        <div style="width: 45%; border: 2px solid #f59e0b; padding: 1rem; border-radius: 8px; background: rgba(245, 158, 11, 0.05);">
            <div style="text-align: center; color: #f59e0b; font-weight: 800; margin-bottom: 10px;">GENERATED RTE</div>
            <div style="font-family: var(--font-mono); font-size: 0.7rem; color: #f59e0b;">
                void Rte_Write_Port_X(...) {<br>
                &nbsp;&nbsp;internal_var = val;<br>
                &nbsp;&nbsp;Com_SendSignal(...);<br>
                }
            </div>
        </div>
    </div>
    <p style="text-align: center; font-size: 0.85rem; color: var(--text-muted); margin-top: 20px;">The RTE transforms high-level Port calls into low-level BSW triggers.</p>
</div>

---

## 3) Runnable Entities & Scheduling

The RTE doesn't just pass data; it also handles **Execution**. 
Inside an SWC, the actual logic resides in **Runnable Entities**. These runnables are mapped to **OS Tasks** via the RTE.

- **Periodic Runnables**: Triggered every 10ms, 20ms, etc.
- **Event-Driven Runnables**: Triggered by a data reception or an error.

### The "RTE Contract"
The RTE ensures that when a Runnable starts:
1. All required data is already received.
2. The data remains consistent throughout the execution.
3. The Runnable doesn't interfere with others.

---

## 4) Summary

- **Separation**: SWCs only talk through RTE APIs.
- **Generation**: The RTE code is built specifically for your architecture.
- **Abstraction**: It hides the complexity of multi-core and network communication.

In [Part 4: Data in Motion](article-autosar-masterclass-4.html), we will dive into the **Communication Stack** to see how the RTE actually pushes data onto the wire via CAN and Ethernet.
