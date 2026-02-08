---
title: "Embedded C Masterclass: Part 1 - Kernels & Bitwise Logic"
date: "Feb 08, 2026"
excerpt: "Mastering the foundation. A deep dive into standard integer types, storage classes, and the art of bitwise manipulation."
category: "Embedded Systems"
tags: ["C Programming", "Bitwise", "Optimization", "Embedded Systems"]
next_link: "article-embedded-c-basics-2.html"
---

Welcome to the **Embedded C Masterclass**. This series is designed to take you from a standard C programmer to a bare-metal expert capable of writing safety-critical code for automotive ECUs.

<div class="toc-card">
    <h2>📑 Series Table of Contents</h2>
    <div class="toc-grid">
        <a href="article-embedded-c-basics-1.html" class="toc-item">
            <h4>Part 1: Kernels & Logic</h4>
            <p>C Fundamentals, stdint.h & Bit Manipulation mastery.</p>
        </a>
        <a href="article-embedded-c-basics-2.html" class="toc-item">
            <h4>Part 2: Pointers & Memory</h4>
            <p>Register mapping, Flash/SRAM & Linker scripts.</p>
        </a>
        <a href="article-embedded-c-basics-3.html" class="toc-item">
            <h4>Part 3: Timing & GPIO</h4>
            <p>SysTick, Blocking Delays & GPIO lifecycle driver.</p>
        </a>
        <a href="article-embedded-c-basics-4.html" class="toc-item">
            <h4>Part 4: Interrupts & Timers</h4>
            <p>NVIC, Event-driven logic & PWM pulse generation.</p>
        </a>
        <a href="article-embedded-c-basics-5.html" class="toc-item">
            <h4>Part 5: Communication</h4>
            <p>Exhaustive deep-dive: UART, SPI, I2C & CAN Bus.</p>
        </a>
        <a href="article-embedded-c-basics-6.html" class="toc-item">
            <h4>Part 6: Systems & Automotive</h4>
            <p>MCAL/HAL Architecture, UDS Diagnostics & AUTOSAR.</p>
        </a>
    </div>
</div>

---

## 1) C Programming Fundamentals (The Core)

In the world of microcontrollers, every byte of RAM and every clock cycle of CPU power matters. Standard C practices that work on a PC can be disastrous in an embedded environment.

#### The Importance of `<stdint.h>`
Never use `int`, `long`, or `short`. Their size depends on the compiler and the CPU architecture (8-bit, 16-bit, or 32-bit). In embedded, we need deterministic bit-widths.

```c
#include <stdint.h>

// Fixed-width unsigned types
uint8_t   status;  // 8 bits (0 to 255)
uint16_t  timer;   // 16 bits (0 to 65535)
uint32_t  address; // 32 bits (0 to 4.29 Billion)

// Fixed-width signed types
int8_t    temp;    // 8 bits (-128 to 127)
int32_t   count;   // 32 bits (-2.1B to 2.1B)
```

#### Storage Classes: The Hidden Power
- **`static` Variables**: 
    - Inside a function: Retain their value between calls (stored in `.data` or `.bss`, not the stack).
    - Outside a function: Scope is limited to the current file. This is **Encapsulation** in C.
- **`extern`**: Declares a variable that is defined in another file, allowing for modular driver design.
- **`volatile`**: **The Golden Rule of Embedded.** Tells the compiler: "This variable can change without your knowledge" (e.g., by a hardware register or an Interrupt). Without `volatile`, the compiler might optimize out "redundant" reads, causing your code to miss hardware events.

```c
// Example of Volatile usage in an ISR flag
volatile uint8_t g_uart_received = 0; 

void UART_Handler() {
    g_uart_received = 1; // Changed by Hardware Interrupt
}
```

---

## 2) Embedded C vs Normal C (Mindset Shift)

#### The Hardware Reality
In Normal C, you have an Operating System (Windows/Linux) that manages memory, files, and threads. In Embedded C, **you are the OS**.
- **No `printf`**: Unless you implement a driver to send characters over UART.
- **Boot Sequence**: Your code starts from a "Reset Vector" that initializes the stack and memory before calling `main()`.
- **Resource Constraints**: You might have 2MB of Flash but only 128KB of RAM. Dynamic allocation (`malloc`) is generally forbidden due to fragmentation risks.

---

## 3) Bit Manipulation (Mastering logic)

Microcontrollers are controlled by writing to individual bits in a "Register". You must be able to manipulate bits without disturbing others.

#### Setting Bits (Turning things ON)
Use the bitwise OR (`|`) with a shifted mask.
```c
uint8_t CTRL_REG = 0b00000000;

// Set bit 3 to 1
CTRL_REG |= (1 << 3); 
// Result: 0b00001000
```

#### Clearing Bits (Turning things OFF)
Use the bitwise AND (`&`) with a negated mask.
```c
// Clear bit 3
CTRL_REG &= ~(1 << 3);
// Result: 0b00000000
```

#### Toggling Bits (Flashing an LED)
Use the bitwise XOR (`^`).
```c
// Toggle bit 5
CTRL_REG ^= (1 << 5); 
// Flips 0 to 1, or 1 to 0
```

#### Checking Bit Status (Reading a Button)
Use the bitwise AND (`&`) to mask the bit.
```c
// Check if bit 4 is set
if (STATUS_REG & (1 << 4)) {
    // Logic for 'High' signal
}
```

#### Field Isolation (Multi-bit registers)
Often a register has 2 or 3 bits for a specific setting (e.g., Baud rate).
```c
// Clear bits 0 and 1, then set to 0b10 (binary 2)
CONFIG_REG &= ~(0x03 << 0); // Clear bits
CONFIG_REG |= (0x02 << 0);  // Apply new value
```

In [Part 2: Memory & Pointers](article-embedded-c-basics-2.html), we will explore how to use these bitwise techniques to directly control hardware memory addresses.
