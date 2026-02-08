---
title: "Embedded C Masterclass: Part 2 - Pointers & Memory Mapping"
date: "Feb 08, 2026"
excerpt: "The bridge to the hardware. Learn how pointers unlock direct access to high-speed registers and physical memory."
category: "Embedded Systems"
tags: ["Pointers", "Memory Mapping", "Registers", "Volatile"]
prev_link: "article-embedded-c-basics-1.html"
next_link: "article-embedded-c-basics-3.html"
---

In the first part, we mastered bitwise logic. Now, we use those tools to talk to human-engineered silicon. In embedded systems, **Pointers** are not just for data structures; they are the physical wires of your software.

## 4) Pointers in Embedded C (The Hardware Bridge)

Every button, LED, and sensor in your system is represented by a unique address in the CPU's memory space. This is called **Memory-Mapped I/O (MMIO)**.

#### Accessing a Hardware Register
To control a pin on an STM32 or AVR, you must write to a specific location in RAM. We use a `volatile` pointer to ensure the compiler doesn't "optimize out" our writes.

```c
#include <stdint.h>

// 1. Define the physical address (from the Datasheet)
#define GPIOB_ODR_ADDRESS 0x48000414 

// 2. Cast the address to a volatile pointer
#define GPIOB_ODR (*(volatile uint32_t*)GPIOB_ODR_ADDRESS)

void turn_on_led() {
    // 3. Use the pointer as if it were a variable
    GPIOB_ODR |= (1 << 5); // Set pin 5 to HIGH
}
```

#### Pointer Arithmetic & Offsets
Peripherals usually have a group of registers (Mode, Input, Output, Speed). We can use a `struct` to represent this group, allowing for cleaner pointer usage.

```c
typedef struct {
    volatile uint32_t MODER;   // Offset 0x00
    volatile uint32_t OTYPER;  // Offset 0x04
    volatile uint32_t OSPEEDR; // Offset 0x08
    volatile uint32_t PUPDR;   // Offset 0x0C
    volatile uint32_t IDR;     // Offset 0x10
    volatile uint32_t ODR;     // Offset 0x14
} GPIO_RegDef_t;

#define GPIOB ((GPIO_RegDef_t*)0x48000400)

void configure_pin() {
    GPIOB->MODER |= (1 << 10); // Set Pin 5 as Output
}
```

---

## 5) Memory Organization (The silicon map)

A microcontroller's memory is divided into several logical stages. Understanding these is the difference between a "hobbyist" and a "systems engineer".

#### 1. Flash Memory (The permanent home)
- **Content**: Your code (`.text`) and constant data (`.rodata`).
- **Nature**: Non-volatile (survives power loss).
- **Execution**: Most modern MCUs use "Execute In Place" (XIP) to run code directly from Flash.

#### 2. SRAM (The workspace)
- **`.data` Section**: Global variables that have an initial value (e.g., `int x = 5;`). These are copied from Flash to RAM during boot.
- **`.bss` Section**: Global variables initialized to ZERO. They are cleared in RAM during boot.
- **Stack**: Used for local variables and function call management. Grows "downwards".
- **Heap**: Used for dynamic data. **Warning:** Avoid in automotive code to prevent memory fragmentation.

#### 3. Linker Scripts (`.ld` files)
How does the CPU know where RAM starts? The **Linker Script** specifies which memory regions exist and where each section of your code should be placed.

```ld
/* Simplified Linker Script Example */
MEMORY {
  FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 128K
  RAM   (rwx): ORIGIN = 0x20000000, LENGTH = 20K
}
```

#### Diagnosing Memory Issues
If your code crashes randomly, you likely have a **Stack Overflow**. This happens when local variables or deep recursion exceed the allocated RAM. Always monitor your stack size!

In [Part 3: Timing & GPIO](article-embedded-c-basics-3.html), we will bring this theory to life by creating a real-time blinky driver and handling inputs.
