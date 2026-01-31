---
title: "The CAN Bus Protocol Explained"
date: "Jan 27, 2026"
excerpt: "Deep dive into Controller Area Network (CAN) frames, arbitration, and error handling."
---
# CAN Bus Protocol

Modern cars have 70+ ECUs (Electronic Control Units). They talk to each other using CAN (Controller Area Network).

![Automotive Dashboard](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## Why CAN?
1.  **Differential Signaling**: Resistant to noise (EMI) in harsh car environments.
2.  **Robust**: Built-in error checking and retransmission.
3.  **Arbitration**: Non-destructive bitwise arbitration ensures critical messages (like Brakes) always win the bus.

## The Standard Frame (CAN 2.0A) - 11-bit ID

| Field | Bits | Description |
| :--- | :--- | :--- |
| SOF | 1 | Start of Frame |
| Identifier | 11 | Message Priority |
| RTR | 1 | Remote Transmission Request |
| DLC | 4 | Data Length Code |
| Data | 0-64 | Payload (up to 8 bytes) |
| CRC | 15 | Error check |
| EOF | 7 | End of Frame |
