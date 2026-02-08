---
title: "Embedded C Masterclass: Part 5 - Communication Protocols"
date: "Feb 08, 2026"
excerpt: "Exhaustive guide to UART, SPI, I2C, and CAN. Master the physical and logical layers of industrial communication."
category: "Embedded Systems"
tags: ["UART", "SPI", "I2C", "CAN Bus", "Protocols", "Communication"]
prev_link: "article-embedded-c-basics-4.html"
next_link: "article-embedded-c-basics-6.html"
---

Welcome to the most critical part of the series. Microcontrollers don't live in isolation; they must talk to sensors, memory, and each other. In this part, we deep-dive into the "Big 4" protocols: **UART, SPI, I2C, and CAN**.

## 10) Communication Protocols (Exhaustive Analysis)

---

### A. UART (The Universal Debugger)
**Physical**: 2 Wires (TX/RX). Asynchronous (no shared clock).
**Usage**: PC-to-MCU, GSM modules, Bluetooth.

#### Driver Logic (Polling Transmission)
```c
void UART_SendChar(char c) {
    // 1. Wait for Transmission Register to be Empty
    while(!(USART1->SR & (1 << 7)));
    
    // 2. Load data into Register
    USART1->DR = (uint8_t)c;
}

void UART_SendString(char *s) {
    while(*s) UART_SendChar(*s++);
}
```

---

### B. SPI (The High-Speed Bus)
**Physical**: 4 Wires (SCK, MOSI, MISO, CS). Synchronous (shared clock).
**Usage**: SD cards, Displays, High-speed ADCs.

#### Protocol Characteristics
- **Full-Duplex**: Sends and receives data simultaneously.
- **Master/Slave**: One Master drives the clock.
- **Chip Select (CS)**: Hardware pin used to select which slave should listen.

```c
uint8_t SPI_TransmitReceive(uint8_t data) {
    // 1. Write data to Buffer
    SPI1->DR = data;
    
    // 2. Wait for transmission to complete
    while(!(SPI1->SR & (1 << 1))); // TXE (Transmit Empty)
    while(SPI1->SR & (1 << 7));    // BSY (Busy Flag)
    
    // 3. Return the data received simultaneously
    return SPI1->DR;
}
```

---

### C. I2C (The 2-Wire Specialist)
**Physical**: 2 Wires (SDA - Data, SCL - Clock). Pull-up resistors required.
**Usage**: Temperature sensors, EEPROM, RTCs.

#### Protocol Characteristics
- **Addressing**: Every slave has a unique 7-bit address.
- **Multi-Master**: Built-in arbitration for multiple controllers.
- **ACK/NACK**: Mechanism to confirm if the receiver is alive.

```c
void I2C_Write(uint8_t addr, uint8_t data) {
    I2C_Start();
    I2C_SendAddress(addr, WRITE_MODE);
    if(I2C_CheckACK()) {
        I2C_SendData(data);
    }
    I2C_Stop();
}
```

---

### D. CAN Bus (The Automotive King)
**Physical**: 2 Wires (CAN High / CAN Low). Differential signalling for noise immunity.
**Usage**: Engine Control, Transmission, ABS, Body Electronics.

#### Why CAN is Different
- **Message-Based**: No addresses. Every message has an **ID** (e.g., Engine Temp or Speed).
- **Arbitration**: Lower IDs have higher priority. If two ECUs send at once, the lower ID wins without destroying data.
- **Fault Tolerance**: Automatic re-transmission and error-passive states.

#### CAN Transmission Structure (C-Abstraction)
```c
typedef struct {
    uint32_t StdId;     // Standard ID (11 bits)
    uint32_t DLC;       // Data Length Code (0-8 bytes)
    uint8_t  Data[8];   // The actual 8-byte payload
} CAN_Msg_t;

void CAN_Transmit(CAN_Msg_t *msg) {
    // 1. Check for empty mailbox
    while(!(CAN1->TSR & (1 << 26))); // Mailbox 0 empty?
    
    // 2. Load ID and Data
    CAN1->sTxMailBox[0].TIR = (msg->StdId << 21);
    CAN1->sTxMailBox[0].TDTR = msg->DLC;
    
    // Copy data (usually 2 uint32_t words)
    uint32_t data_low = (msg->Data[3] << 24 | msg->Data[2] << 16 | msg->Data[1] << 8 | msg->Data[0]);
    CAN1->sTxMailBox[0].TDLR = data_low;
    
    // 3. Request Transmission
    CAN1->sTxMailBox[0].TIR |= (1 << 0);
}
```

In [Part 6: Systems & Automotive](article-embedded-c-basics-6.html), we will conclude the series by looking at the high-level architectures like UDS and AUTOSAR that reside on top of these protocols.
