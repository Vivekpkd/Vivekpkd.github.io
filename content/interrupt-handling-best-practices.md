---
title: "Interrupt Handling Best Practices"
date: "Jan 22, 2026"
excerpt: "How to handle ISRs without crashing your system. Keep it short, keep it safe."
---
# Interrupt Handling

An Interrupt Service Routine (ISR) pauses the main CPU task to handle an event (e.g., button press, timer, CAN message).

![Embedded Circuit](images/embedded-circuit.png)

<!-- ad-placeholder -->

## Golden Rules
1.  **Keep it Short**: Do the bare minimum (clear flag, copy data) and exit. Complex logic belongs in the main loop.
2.  **No Blocking Code**: Never use `delay()`, `printf()`, or wait for mutexes inside an ISR.
3.  **Atomic Access**: If sharing data with `main()`, ensure access is atomic or disable interrupts briefly while reading.

```c
// Bad ISR
void EXTI0_IRQHandler(void) {
    printf("Button Pressed!"); // TOO SLOW!
    delay(100); // SYSTEM FREEZE!
}

// Good ISR
void EXTI0_IRQHandler(void) {
    flag = 1; // Fast
}
```
