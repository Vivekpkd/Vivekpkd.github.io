---
title: "C Programming for Embedded Systems"
category: "Embedded C"
date: "Mar 07, 2026"
tags: ["C", "Pointers", "Memory"]
---

# Embedded C Programming

When programming microcontrollers, standard C code needs to be adapted to severe memory constraints, specific hardware registers, and real-time requirements.

> [!IMPORTANT]
> The `volatile` and `static` keywords are crucial concepts in embedded programming.

## Bit Manipulation

Microcontrollers operate heavily via registers. Each bit in a register typically controls a specific hardware function (like turning an LED on, or enabling a timer).

We use bitwise operators to modify specific bits without affecting others.

```c
#define LED_PIN (1 << 5) // Pin 5

// Setting a bit (Turning LED ON)
PORTA |= LED_PIN;

// Clearing a bit (Turning LED OFF)
PORTA &= ~LED_PIN;

// Toggling a bit
PORTA ^= LED_PIN;

// Checking if a bit is set
if (PORTA & LED_PIN) {
    // LED is currently ON
}
```

## The Volatile Keyword

The `volatile` keyword tells the compiler that a variable's value can change unexpectedly at any time, independently of the normal program flow.

```c
// A hardware register that changes based on external inputs
volatile uint8_t* const PORTA_IN = (uint8_t*)0x40004000;

void wait_for_button() {
    // If PORTA_IN wasn't volatile, the compiler might optimize this loop away!
    while((*PORTA_IN & 0x01) == 0) {
        // Wait for button press on pin 0
    }
}
```

### When to use `volatile`:
1. Hardware registers mapped to memory.
2. Global variables modified within an Interrupt Service Routine (ISR).
3. Variables shared between multi-threaded applications.

## Structures and Packing

Embedded systems often need to transmit data packets or configure hardware registers. Standard structures might be padded by the compiler for memory alignment, which breaks strict data layouts.

We use packing directives (compiler-specific) to prevent this padding.

```c
// GCC attribute to pack the struct
typedef struct __attribute__((__packed__)) {
    uint8_t id;      // 1 byte
    uint32_t data;   // 4 bytes
} CanPacket;         // Total size: 5 bytes (without packing, it might be 8 bytes)
```

## Using Pointers Safely

Pointers are incredibly powerful, especially for memory-mapped I/O, but they must be managed carefully to avoid null pointer dereferences and memory leaks.

- Always check if a pointer is `NULL` before using it (if dynamically allocated).
- Prefer statically allocated memory to dynamic (`malloc` / `free`) to avoid heap fragmentation in resource-constrained ECUs.
