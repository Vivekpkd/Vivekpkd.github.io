---
title: "Implemeting State Machines in C"
date: "Jan 19, 2026"
excerpt: "Say goodbye to spaghetti code. Learn how to implement robust FSMs for embedded systems."
---
# State Machines in C

A Finite State Machine (FSM) is the backbone of most embedded systems. Whether it's a Traffic Light or a Cruise Control system.

![Automotive Dashboard](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## Switch-Case Approach
The simplest way to implement an FSM.

```c
typedef enum { IDLE, RUNNING, ERROR } State;
State currentState = IDLE;

void Run_FSM() {
    switch(currentState) {
        case IDLE:
            if(StartPressed()) currentState = RUNNING;
            break;
        case RUNNING:
            if(ErrorDetected()) currentState = ERROR;
            break;
        case ERROR:
            ResetSystem();
            currentState = IDLE;
            break;
    }
}
```
