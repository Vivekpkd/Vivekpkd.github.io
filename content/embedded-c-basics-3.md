---
title: "Embedded C Masterclass: Part 3 - Timing & GPIO"
date: "Feb 08, 2026"
excerpt: "Making the CPU interact with real time. Master the GPIO driver lifecycle and precision hardware timing."
category: "Embedded Systems"
tags: ["Timing", "GPIO", "Drivers", "Real-time"]
prev_link: "article-embedded-c-basics-2.html"
next_link: "article-embedded-c-basics-4.html"
---

Now that we understand memory mapping, we can start "doing" things. In this part, we focus on the most fundamental interaction: **Time and Electrical signals (GPIO)**.

## 6) Delay & Timing (Mastering the Clock)

Everything in a microcontroller is driven by a crystal oscillator (e.g., 16MHz). We need to scale these millions of cycles down to human-readable time (milliseconds).

#### Software Delay (The "Blocking" way)
A simple loop that wastes CPU cycles. Effective for quick tests, but terrible for multitasking because it freezes the engine.

```c
void delay_cycles(uint32_t count) {
    // __asm("nop") ensures the compiler doesn't optimize out
    // the "empty" loop.
    while(count--) {
        __asm("nop"); 
    }
}
```

#### SysTick & Millisecond Delays (The "Systems" way)
Most ARM Cortex-M microcontrollers have a **SysTick** timer. It can be configured to trigger an interrupt every 1ms.

```c
volatile uint32_t g_ms_ticks = 0;

// This function is automatically called every 1ms by hardware
void SysTick_Handler(void) {
    g_ms_ticks++;
}

void delay_ms(uint32_t duration) {
    uint32_t start = g_ms_ticks;
    while((g_ms_ticks - start) < duration) {
        // CPU waits, but other interrupts can still run!
    }
}
```

---

## 7) GPIO Programming (The physical interface)

GPIO (General Purpose Input/Output) pins are the "fingers" of your MCU. A single pin can be configured in multiple ways:

#### 1. The Initialization Sequence
Always follow this 3-step ritual to avoid ghost bugs:
1. **Enable the Clock**: Hardware ports are powered OFF by default to save energy.
2. **Configure the Mode**: Input, Output, or Alternate Function.
3. **Configure the Pulls**: Pull-up, Pull-down, or Floating.

```c
void GPIO_Init_LED() {
    // Enable clock for Port A (Address 0x40023830 on STM32)
    *(volatile uint32_t*)0x40023830 |= (1 << 0); 
    
    // Set Pin 5 as Output (Mode bits 11:10 = 01)
    GPIOA->MODER &= ~(3 << 10); // Clear bits
    GPIOA->MODER |=  (1 << 10); // Set to Output
}
```

#### 2. Digital Output (Driving an LED)
In automotive systems, we often use **Push-Pull** mode to actively drive current to a relay or indicator.

```c
void LED_On() {
    GPIOA->ODR |= (1 << 5); // Write 1 to Port A Pin 5
}

void LED_Toggle() {
    GPIOA->ODR ^= (1 << 5); // Flip the current state
}
```

#### 3. Digital Input (Reading a Button)
When reading an input, use an internal **Pull-up** resistor. This ensures that when the button is NOT pressed, the pin reads HIGH (3.3V) instead of a "floating" noise.

```c
void GPIO_Init_Button() {
    // Set Pin 13 as Input
    GPIOC->MODER &= ~(3 << 26); 
    
    // Enable Pull-up Resistor
    GPIOC->PUPDR |= (1 << 26); 
}

uint8_t Read_Button() {
    // Read the Input Data Register (IDR)
    if (!(GPIOC->IDR & (1 << 13))) {
        return 1; // Button is pressed (GND connected)
    }
    return 0;
}
```

#### 4. Hardware Debouncing
Buttons are mechanical; they "bounce" electrically for ~10ms when pressed. Software must wait or check multiple times before confirming a press to avoid "ghost pulses".

In [Part 4: Interrupts & Timers](article-embedded-c-basics-4.html), we will learn how to make the hardware react to these button presses instantly via Interrupts, without constantly polling in `main()`.
