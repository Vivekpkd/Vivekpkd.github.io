---
title: "I2C vs SPI: Choosing the Right Bus"
date: "Jan 21, 2026"
excerpt: "Comparison of the two most common on-board communication protocols."
---
# I2C vs SPI

Every embedded engineer faces this choice. Which one is better?

![Automotive Dashboard](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## I2C (Inter-Integrated Circuit)
- **Wires**: 2 (SDA, SCL).
- **Speed**: Slow (100kHz - 3.4MHz).
- **Addressing**: Software addresses (great for many slaves).
- **Use Case**: Sensors, EEPROM, reading configurations.

## SPI (Serial Peripheral Interface)
- **Wires**: 4 (MISO, MOSI, SCK, CS).
- **Speed**: Fast (up to 50MHz+).
- **Addressing**: Chip Select Lines (hardware).
- **Use Case**: SD Cards, LCD Displays, High-speed ADCs.

## Verdict
Use **SPI** when speed matters. Use **I2C** when pin count is limited.
