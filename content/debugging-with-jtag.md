---
title: "Debugging with JTAG and SWD"
date: "Jan 20, 2026"
excerpt: "Stop using printf debugging. Learn to use hardware debuggers."
---
# Debugging with JTAG

`printf("Here 1");` is not debugging. Real debugging requires a probe (J-Link, ST-Link) and JTAG/SWD.

![Embedded Circuit](images/embedded-circuit.png)

<!-- ad-placeholder -->

## What can JTAG do?
1.  **Breakpoints**: Halt the CPU at a specific line.
2.  **Watchpoints**: Halt the CPU when a specific variable changes value.
3.  **Register View**: See the state of CPU registers and Peripherals in real-time.
4.  **Fault Analysis**: When the system crashes to `HardFault_Handler`, JTAG tells you exactly which instruction caused it.
