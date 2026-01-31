---
title: "Automotive Bootloader"
date: "Jan 17, 2026"
excerpt: "How to update firmware in the field. Dual-bank updates and memory jumping."
---

🚗💡 Ever flashed an ECU… but wondered what actually happens inside?
Many of us have done ECU flashing hundreds of times,
but few stop to think — what’s running inside 

That’s where the Automotive Bootloader comes in —
the hidden software that makes ECU updates possible and safe.

🔹 Flash Bootloader (FBL)
The FBL is like the ECU’s “update manager.”
It decides whether to start the application or go into programming mode.
It’s what allows secure software updates via CAN, FlexRay, or Ethernet.

🔹 Inside the FBL:
There are two main parts —
1️⃣ Primary Bootloader (PBL)
 • Runs first after reset.
 • Stored in protected flash.
 • Checks if the app is valid and secure.
 • Loads the next stage if reprogramming is needed.
2️⃣ Secondary Bootloader (SBL)
 • Handles UDS flashing services like 0x10, 0x27, 0x34, 0x36, and 0x37.
 • Receives the new software, verifies it, and activates the update.


⚙️ Why two stages?
✅ Safer – even if flashing fails, ECU can recover
✅ Secure – signatures and CRCs verified before boot
✅ Flexible – easier to update logic later
✅ ISO 26262 & UDS compliant

💬 So next time you flash an ECU, remember —
you’re not just loading code; you’re running a two-stage secure boot process that keeps the vehicle safe and updatable.

<!-- ad-placeholder -->

```c
void JumpToApp(uint32_t appAddress) {
    uint32_t jumpAddress = *(__IO uint32_t*) (appAddress + 4);
    pFunction Jump = (pFunction) jumpAddress;
    
    __set_MSP(*(__IO uint32_t*) appAddress);
    Jump();
}
```
