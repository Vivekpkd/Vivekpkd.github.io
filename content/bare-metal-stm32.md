---
title: "Bare Metal Programming on STM32"
date: "Jan 28, 2026"
excerpt: "Getting down to the registers: Programming ARM Cortex-M without an OS or HAL."
---
# Bare Metal Programming

Before RTOS, there was Bare Metal. Direct register manipulation gives you ultimate control and zero overhead.

![Embedded Circuit](images/embedded-circuit.png)

<!-- ad-placeholder -->

## Blinking an LED (The Register Way)

Instead of `HAL_GPIO_WritePin`, we write directly to the memory address mapped to the GPIO hardware.

```c
#define RCC_AHB1ENR  (*((volatile uint32_t *)0x40023830))
#define GPIOA_MODER  (*((volatile uint32_t *)0x40020000))
#define GPIOA_ODR    (*((volatile uint32_t *)0x40020014))

void main() {
    // Enable Clock for GPIOA
    RCC_AHB1ENR |= 0x01;
    
    // Set PA5 as Output
    GPIOA_MODER |= (1 << 10);
    
    while(1) {
        GPIOA_ODR ^= (1 << 5); // Toggle LED
        delay(100000);
    }
}
```
