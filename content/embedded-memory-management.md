---
title: "Memory Management in Embedded Systems"
date: "Jan 23, 2026"
excerpt: "Stack, Heap, .bss, and .data. Where does your variable live?"
---
# Memory Management

In desktop apps, `malloc` is your friend. In embedded, `malloc` is your enemy.

![Embedded Circuit](images/embedded-circuit.png)

<!-- ad-placeholder -->

## The Problem with Heap (Dynamic Memory)
1.  **Fragmentation**: Over time, free blocks become too small to use.
2.  **Non-deterministic**: `malloc` might take 10 cycles or 1000 cycles.

## Static Allocation
Allocate everything at compile time.
```c
// Dynamic (Bad)
uint8_t *buffer = malloc(1024);

// Static (Good)
static uint8_t buffer[1024];
```

## Stack Overflow
Not the website. The crash. If your recursion goes too deep, you overwrite variables. ALways analyze stack depth.
