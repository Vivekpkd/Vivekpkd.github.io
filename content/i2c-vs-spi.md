---
title: "I2C vs SPI: Choosing the Right Peripheral"
date: "Jan 23, 2026"
excerpt: "A comparison of serial communication protocols for board-level sensors."
---
# I2C vs SPI: Choosing the Right Peripheral

When connecting sensors, EEPROMs, or displays to your micro-controller, you usually face two choices: I2C (Inter-Integrated Circuit) or SPI (Serial Peripheral Interface).

## I2C: The Two-Wire Convenience
I2C uses only two lines: **SDA** (Data) and **SCL** (Clock).

- **Pros**: Very easy to wire multiple devices (up to 127) on the same bus using addressing.
- **Cons**: Slower speeds (standard 400kHz or 1MHz) and higher overhead due to protocol bits.
- **Best For**: Low-speed sensors and configuration chips.

## SPI: The High-Speed Giant
SPI is a 4-wire full-duplex protocol: **MOSI**, **MISO**, **SCK**, and **SS**.

- **Pros**: Faster speeds (20MHz to 50MHz+) and very low hardware overhead.
- **Cons**: Requires a dedicated "Slave Select" (SS) pin for every device you add, complicating PCB routing.
- **Best For**: Displays, high-speed ADCs, and external flash memory.

---

## The Verdict

If you are pin-constrained and speed isn't critical, go with **I2C**. If you need to move large amounts of data (like pixel data for a dashboard) quickly, **SPI** is the winner.
