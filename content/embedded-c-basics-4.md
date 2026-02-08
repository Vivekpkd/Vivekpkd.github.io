---
title: "Embedded C Masterclass: Part 4 - Interrupts & Timers"
date: "Feb 08, 2026"
excerpt: "Master the nervous system of the MCU. Learn how Interrupts and hardware Timers enable ultra-responsive event handling."
category: "Embedded Systems"
tags: ["Interrupts", "NVIC", "Timers", "PWM", "Event-driven"]
prev_link: "article-embedded-c-basics-3.html"
next_link: "article-embedded-c-basics-5.html"
---

In the previous part, we read a button by "polling" (asking the constant question: *Is it pressed?*). This wastes CPU power. In this part, we master **Interrupts**, where the hardware tells the CPU: *"The button has been pressed; drop everything and handle it!"*

## 8) Interrupts (The Event-driven Kernel)

An interrupt is an electrical signal that forces the CPU to jump to a specific function called an **ISR (Interrupt Service Routine)**.

#### The NVIC (Nested Vectored Interrupt Controller)
On ARM Cortex-M processors, the NVIC manages priorities. It ensures that critical tasks (like a Brake System event) can interrupt less important tasks (like a GUI update).

#### Implementing an External Interrupt (EXTI)
To make a button press trigger an interrupt, we must:
1. Initialize the GPIO as an Input.
2. Link the GPIO pin to an EXTI line.
3. Enable the interrupt in the NVIC.

```c
// External Interrupt Handler for Pin 13
void EXTI15_10_IRQHandler(void) {
    // 1. Check if the interrupt came from Line 13
    if (EXTI->PR & (1 << 13)) {
        
        // 2. Clear the 'Pending' flag (Mandatory)
        EXTI->PR |= (1 << 13);
        
        // 3. Perform the logic
        Emergency_Stop();
    }
}
```

#### Best Practices for ISRs
- **Keep it Short**: Never use `delay()` inside an ISR.
- **No Complex Logic**: Just set a flag and return.
- **The `volatile` Keyword**: Any variable shared between an ISR and `main()` must be marked `volatile`.

---

## 9) Advanced Timers (Precision pulses)

Hardware timers are independent counters inside the MCU that run at the clock speed. They don't need CPU attention until a specific count is reached.

#### 1. The Counter Principle
A timer counts from 0 to an **Auto-Reload Value (ARR)**. When it hits the limit, it can trigger an interrupt or flip a pin.

#### 2. Pulse Width Modulation (PWM)
PWM is used to control the intensity of light or speed of a motor. By changing the "Duty Cycle", we change the average voltage.

```c
void PWM_Init() {
    // 1. Set Timer 2 Channel 1 to PWM Mode
    TIM2->CCMR1 |= (0x06 << 4); 
    
    // 2. Set the Period (1kHz frequency)
    TIM2->ARR = 1000;
    
    // 3. Set Duty Cycle to 25% (250 / 1000)
    TIM2->CCR1 = 250;
    
    // 4. Start the Timer
    TIM2->CR1 |= (1 << 0);
}
```

#### 3. Input Capture (Measuring Speed)
Input Capture allows the hardware to "snapshot" the timer value exactly when an external pulse arrives. This is how we measure the RPM of an engine or the frequency of a sensor.

```c
// ISR for Timer 2 (Speed Sensor)
void TIM2_IRQHandler() {
    if (TIM2->SR & (1 << 1)) { // Capture event
        uint32_t current_pulse = TIM2->CCR1;
        uint32_t rpm = calculate_rpm(current_pulse - last_pulse);
        last_pulse = current_pulse;
    }
}
```

In [Part 5: Communication Protocols](article-embedded-c-basics-5.html), we will explore how Interrupts and Timers work together to move data across serial buses like UART, SPI, and CAN.
