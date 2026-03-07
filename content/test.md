---
title: "STM32 Microcontroller: Beginner Introduction"
category: "Embedded Systems"
date: "Mar 07, 2026"
tags: ["STM32", "Microcontroller", "Embedded C"]
---

# Introduction to STM32

STM32 is a family of 32-bit microcontrollers developed by the [STMicroelectronics](chatgpt://generic-entity?number=0).  
They are based on the [ARM Cortex-M](chatgpt://generic-entity?number=1) processor architecture and are widely used in embedded systems such as automotive electronics, industrial automation, IoT devices, robotics, and consumer electronics.

> [!NOTE]
> STM32 microcontrollers provide high performance, low power consumption, and a rich set of peripherals, making them ideal for modern embedded applications.

## The Three Main Parts of an STM32 System

A typical STM32-based embedded system consists of three main parts:

1. Core (Processor)
2. Peripherals
3. Memory

---

## 1. Core (Processor)

The core is the brain of the microcontroller that executes instructions written in C or assembly.

STM32 devices use ARM Cortex-M cores such as:

- Cortex-M0
- Cortex-M3
- Cortex-M4
- Cortex-M7

The core is responsible for:

- Executing program instructions
- Performing arithmetic and logical operations
- Handling interrupts
- Managing system control functions

---

## 2. Peripherals

Peripherals are hardware modules integrated inside the STM32 microcontroller that allow interaction with external devices.

Common STM32 peripherals include:

- GPIO (General Purpose Input Output)
- UART / USART
- SPI
- I2C
- ADC (Analog to Digital Converter)
- Timers
- PWM
- CAN communication

These peripherals allow the microcontroller to communicate with sensors, displays, motors, and other hardware components.

---

## 3. Memory

STM32 microcontrollers contain different types of internal memory:

- **Flash Memory:** Stores the program code.
- **SRAM:** Used for runtime variables and stack.
- **EEPROM / Emulated EEPROM:** Used for storing non-volatile data.

This memory structure enables efficient execution of embedded applications.

```c
// Example STM32 GPIO Initialization (Bare Metal)

#define GPIOA_BASE 0x48000000
#define GPIOA_MODER (*(volatile unsigned int*)(GPIOA_BASE + 0x00))
#define GPIOA_ODR   (*(volatile unsigned int*)(GPIOA_BASE + 0x14))

void GPIO_Init(void)
{
    // Configure PA5 as output
    GPIOA_MODER |= (1 << 10);
}

void LED_On(void)
{
    GPIOA_ODR |= (1 << 5);
}