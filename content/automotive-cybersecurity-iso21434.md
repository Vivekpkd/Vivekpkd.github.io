---
title: "Automotive Cybersecurity (ISO 21434)"
date: "Jan 24, 2026"
excerpt: "With cars becoming connected computers, security is the new safety."
---
# Automotive Cybersecurity

Hackers can now remotely stop a Jeep on a highway. This reality birthed ISO 21434.

![Automotive Dashboard](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## Threat Modeling (TARA)
Before writing code, we analyze threats.
- **Spoofing**: Fake CAN messages.
- **Tampering**: Altering firmware.
- **Repudiation**: Denying actions.

## SecOC (Secure Onboard Communication)
Standard CAN frames are unencrypted. SecOC adds a MAC (Message Authentication Code) to every frame. Even if a hacker injects a message, the ECU rejects it because they lack the private key to generate the correct MAC.
