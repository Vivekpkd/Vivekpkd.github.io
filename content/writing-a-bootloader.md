---
title: "Writing a Custom Bootloader"
date: "Jan 17, 2026"
excerpt: "How to update firmware in the field. Dual-bank updates and memory jumping."
---
# Writing a Bootloader

A bootloader is the first code to run. It decides whether to stay and update firmware or jump to the main Application.

![Embedded Circuit](images/embedded-circuit.png)

<!-- ad-placeholder -->

## The Jump Mechanism
To jump to the application, we must:
1.  Set the Main Stack Pointer (MSP) to the application's stack.
2.  Set the Program Counter (PC) to the application's Reset Handler.

```c
void JumpToApp(uint32_t appAddress) {
    uint32_t jumpAddress = *(__IO uint32_t*) (appAddress + 4);
    pFunction Jump = (pFunction) jumpAddress;
    
    __set_MSP(*(__IO uint32_t*) appAddress);
    Jump();
}
```
