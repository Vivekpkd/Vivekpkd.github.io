---
title: "MISRA C: Writing Safe Code"
date: "Jan 25, 2026"
excerpt: "The Motor Industry Software Reliability Association guidelines are not just for cars."
---
# MISRA C Compliance

C is a powerful language, but it allows you to shoot yourself in the foot. MISRA C is a set of guidelines to prevent undefined behavior.

![Automotive Dashboard](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## Common Violations

### Rule 12.2: Shift Count
Shifting by more than the width of the type is undefined.
```c
uint8_t x = 5;
uint8_t y = x << 10; // Violation! Result is undefined.
```

### Rule 13.2: Side Effects
Don't rely on order of evaluation.
```c
x = i++ + i++; // VIOLATION. Which i incs first?
```

## Why it matters?
In a pacemaker or a brake controller, undefined behavior means death. MISRA ensures your code does exactly what the standard guarantees.
