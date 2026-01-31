---
title: "Debugging with JTAG and SWD"
date: "Jan 23, 2026"
excerpt: "Going beyond printf: Hardware-level debugging of embedded firmware."
---
# Debugging with JTAG and SWD

When your embedded system crashes at 3:00 AM, `printf("Here\n");` isn't going to save you. You need to look inside the registers and memory of the chip while it's running. This is where JTAG and SWD come in.

## The Tools of the Trade

### JTAG (Joint Test Action Group)
The traditional industry standard. Uses 4-5 pins.
- **Capabilities**: Can "Chain" multiple chips together on a single board for testing.
- **Use Case**: Large, complex PCBs with multiple processors.

### SWD (Serial Wire Debug)
The ARM-specific, two-wire alternative.
- **Pros**: Saves pins! Only requires **SWDIO** and **SWCLK**.
- **Capabilities**: Provides almost all the same features as JTAG but with a smaller footprint.

## Why You Need a Debugger (Segger J-Link, ST-LINK)

1. **Breakpoints**: Stop the code execution on a specific line of code.
2. **Step-Through**: Watch the code execute line-be-line.
3. **Register View**: See the EXACT state of the hardware (Interrupts, Timers, DMA).
4. **Memory Watch**: Monitor variables in real-time without stopping the CPU.

---

## Conclusion

Hardware debugging is a "superpower" for firmware engineers. Once you master a debugger, you'll find and fix bugs in minutes that would have taken days using serial logs.
