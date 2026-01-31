---
title: "Hardware Security Module (HSM)"
date: "Feb 01, 2026"
category: "Automotive Security"
tags: "HSM, Security, SHE, EVITA"
excerpt: "Introduction to Hardware Security Modules in Automotive ECUs. Secure key storage and cryptographic acceleration."
---

# Hardware Security Module (HSM)

In the modern automotive landscape, security is no longer an option—it is a mandatory requirement. With vehicles becoming increasingly connected and autonomous, the threat surface for cyber-attacks has expanded significantly. 

The **Hardware Security Module (HSM)** is the dedicated hardware component within an Automotive MCU (like Infineon AURIX or ST Stellar) that handles all security-critical tasks.

## Why do we need an HSM?

Traditional software-based security is vulnerable to side-channel attacks and memory dumping. The HSM provides:

- **Isolated Execution**: Cryptographic operations run in a dedicated core, isolated from the functional software (Application).
- **Secure Key Storage**: Keys are stored in protected memory that cannot be read by the main CPU.
- **Cryptographic Acceleration**: Dedicated hardware engines for AES, RSA, ECC, and SHA.
- **Secure Boot**: Ensuring that only authentic and unmodified software can run on the ECU.

## HSM Architectures: SHE vs. EVITA

Automotive HSMs generally follow specific standards depending on the required security level:

1. **SHE (Secure Hardware Extension)**: A basic standard for secure key storage and simple symmetric cryptography (AES-128).
2. **EVITA (E-safety Vehicle Intrusion Protected Applications)**:
   - **Light**: Minimal security for sensors/actuators.
   - **Medium**: Balance of performance and security for most ECUs.
   - **Full**: High-performance crypto-processors for Gateways and V2X.

---

[Body content to be updated by user]

<!-- ad-placeholder -->
