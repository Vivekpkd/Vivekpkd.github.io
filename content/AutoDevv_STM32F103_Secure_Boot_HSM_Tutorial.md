---
title: "Secure Boot and HSM Concepts on STM32F103C8T6"
category: "Embedded Systems"
date: "Mar 09, 2026"
tags: ["STM32", "Secure Boot", "HSM", "Embedded Systems", "Cybersecurity"]
type: "Tutorial"
excerpt: "Learn how to implement a practical software-based Secure Boot architecture on the STM32F103C8T6 and understand how it relates to an automotive HSM."
---


# Secure Boot and HSM Concepts on STM32F103C8T6

> **AutoDevv Tutorial**
>
> Learn how to implement a practical software-based Secure Boot architecture on the STM32F103C8T6 and understand how it relates to an automotive HSM.

---

## 1. Introduction

The **STM32F103C8T6** is a popular ARM Cortex-M3 microcontroller and is widely used for embedded-system learning and prototyping.

Although the STM32F103C8T6 does **not** contain a dedicated Hardware Security Module (HSM), it can still be used to learn and demonstrate important security concepts such as:

- Secure Boot
- Firmware integrity verification
- Firmware authenticity verification
- SHA-256 hashing
- Digital signatures
- Secure firmware update
- Anti-rollback concepts
- Flash read protection
- Debug protection
- Software security services

This tutorial builds a conceptual architecture that can later be mapped to more advanced automotive MCUs containing dedicated security hardware.

---

## 2. Important Terminology

Before implementing anything, it is important to distinguish between **Secure Boot** and an **HSM**.

### Secure Boot

Secure Boot is a startup mechanism that verifies whether the firmware is trusted before allowing it to execute.

A simplified flow is:

```text
MCU Reset
    |
    v
Secure Bootloader
    |
    v
Read Firmware Metadata
    |
    v
Calculate Firmware Hash
    |
    v
Verify Digital Signature
    |
    +---- Valid ----> Start Application
    |
    +---- Invalid --> Reject / Recovery
```

### HSM

An HSM is a hardware security subsystem that provides protected security functions such as:

- Cryptographic operations
- Secure key storage
- Key management
- Random number generation
- Secure boot support
- Secure firmware update
- Hardware isolation

The STM32F103C8T6 does **not** have a dedicated HSM subsystem.

Therefore, in this tutorial, we are implementing a **software security architecture**, not a true hardware HSM.

---

## 3. STM32F103C8T6 Security Capabilities

The STM32F103C8T6 is based on an ARM Cortex-M3 core.

It provides several protection mechanisms that can be useful when building a security prototype.

Examples include:

- Flash read-out protection
- Flash write protection
- Option bytes
- Debug/access protection mechanisms
- Software cryptography

However, these mechanisms should not be confused with the security architecture of modern automotive MCUs.

A dedicated automotive security subsystem can provide stronger hardware isolation and protected key storage.

---

## 4. Proposed Secure Boot Architecture

For our prototype, the Flash memory can be logically divided into several regions.

```text
STM32F103 Flash
+------------------------------+ 0x08000000
|                              |
|       Secure Bootloader      |
|                              |
+------------------------------+
|                              |
|       Firmware Metadata      |
|                              |
+------------------------------+
|                              |
|       Application            |
|                              |
+------------------------------+
|                              |
|       Reserved / Security    |
|       Data                   |
|                              |
+------------------------------+
```

A conceptual memory map could be:

| Region | Example Address | Purpose |
|---|---:|---|
| Bootloader | `0x08000000` | Secure startup and verification |
| Metadata | After bootloader | Firmware version, size, hash/signature |
| Application | Application region | Main firmware |
| Reserved | Remaining area | Security/configuration data |

> **Note:** The exact addresses and sizes must be calculated from the actual linker script, bootloader size, application size and STM32F103 flash variant.

---

## 5. Bootloader Responsibilities

The bootloader is the first software component executed after reset.

Its responsibilities can include:

1. Initialize minimum hardware
2. Locate application firmware
3. Read firmware metadata
4. Validate firmware size
5. Calculate firmware hash
6. Verify the firmware signature
7. Check firmware version
8. Decide whether the firmware can execute
9. Jump to the application
10. Enter recovery mode if verification fails

Conceptually:

```text
                 RESET
                   |
                   v
             Bootloader Start
                   |
                   v
          Check Application
                   |
                   v
          Validate Metadata
                   |
                   v
          Calculate SHA-256
                   |
                   v
        Verify Digital Signature
                   |
             +-----+-----+
             |           |
           VALID       INVALID
             |           |
             v           v
       Check Version   Recovery
             |
             v
        Start Application
```

---

## 6. Firmware Metadata

The bootloader should not blindly execute whatever is present in the application region.

A metadata structure can be placed before the application.

Example:

```c
typedef struct
{
    uint32_t magic;
    uint32_t firmware_version;
    uint32_t firmware_size;

    uint8_t firmware_hash[32];

    uint8_t signature[64];

    uint32_t reserved;

} FirmwareMetadata;
```

For example:

```text
Magic
Firmware Version
Firmware Size
SHA-256 Hash
Digital Signature
Reserved
```

The `magic` value can be used to determine whether valid firmware metadata exists.

Example:

```c
#define FIRMWARE_MAGIC 0x41554456U
```

The value itself is arbitrary and should be defined according to the project's requirements.

---

## 7. Firmware Integrity

The first security check is **integrity**.

The bootloader calculates a hash of the application.

For example:

```text
Application
     |
     v
 SHA-256
     |
     v
32-byte hash
```

SHA-256 produces:

```text
256 bits
=
32 bytes
```

Example:

```text
Application Binary
        |
        v
SHA-256()
        |
        v
A3 7F 91 2B ... 32 bytes
```

The calculated hash can be compared with the expected hash stored in the firmware metadata.

```c
if (memcmp(calculated_hash,
           metadata->firmware_hash,
           32) != 0)
{
    /* Firmware modified */
    EnterRecoveryMode();
}
```

However, **hash comparison alone does not provide authenticity** if an attacker can modify both the firmware and stored hash.

That is why digital signatures are important.

---

## 8. Firmware Authenticity

To verify that firmware was generated by an authorized entity, a digital signature can be used.

The basic concept is:

```text
                Firmware
                   |
                   v
                SHA-256
                   |
                   v
                Hash
                   |
                   v
          Private Key Signing
                   |
                   v
              Signature
```

The bootloader then uses the corresponding public key:

```text
Firmware
   |
   v
SHA-256
   |
   v
Calculated Hash
   |
   +--------------------+
                        |
Stored Signature -------+
                        |
                        v
               Public Key Verify
                        |
                 +------+------+
                 |             |
               VALID         INVALID
                 |             |
                 v             v
             Boot App       Reject
```

A common choice for embedded systems is **ECDSA**, although the exact algorithm should be selected based on security requirements, available libraries and MCU resource constraints.

---

## 9. Why SHA-256 Alone Is Not Secure Boot

Consider this situation:

```text
Original:

Application
     |
     v
SHA-256
     |
     v
Hash A
```

An attacker modifies the application:

```text
Modified Application
     |
     v
SHA-256
     |
     v
Hash B
```

If the attacker can also replace the stored hash with Hash B, a simple hash comparison will succeed.

Therefore:

```text
Hash != Authentication
```

A digital signature provides authenticity.

The private signing key should remain outside the MCU, typically within the firmware signing infrastructure.

The MCU contains or has access to the corresponding public verification key.

---

## 10. Secure Boot Key Concept

A simplified key architecture is:

```text
                 Firmware Developer
                        |
                        |
                 Private Signing Key
                        |
                        v
                 Sign Firmware
                        |
                        v
                 Firmware Package
                        |
                        v
                 STM32 Bootloader
                        |
                        |
                  Public Key
                        |
                        v
                Verify Signature
```

The most important rule is:

> **Never embed the private signing key in the firmware.**

The private key is used to sign firmware and should be protected outside the target MCU.

The bootloader only needs the public verification key.

---

## 11. Secure Firmware Update

Secure Boot can be extended into a secure firmware-update mechanism.

A simplified update process is:

```text
New Firmware
     |
     v
Generate SHA-256
     |
     v
Sign Firmware
     |
     v
Create Firmware Package
     |
     v
Transfer to ECU
     |
     v
Bootloader / Update Manager
     |
     v
Verify Signature
     |
     v
Verify Version
     |
     v
Write Application
     |
     v
Verify Written Image
     |
     v
Activate Firmware
```

The firmware should only become executable after successful verification.

---

## 12. Anti-Rollback Protection

Suppose the ECU currently runs:

```text
Firmware Version = 5
```

An attacker attempts to install:

```text
Firmware Version = 2
```

Even if Version 2 has a valid signature, the system may want to reject it.

Therefore:

```text
Incoming Version >= Minimum Allowed Version
```

Conceptually:

```c
if (metadata.firmware_version < minimum_allowed_version)
{
    RejectFirmware();
}
```

A production implementation needs a secure method of storing and updating the minimum accepted version.

On a basic STM32F103 prototype, this can be demonstrated conceptually, but it does not provide the same rollback protection as a dedicated secure-storage architecture.

---

## 13. Recovery Mode

The bootloader should have a recovery path.

For example:

```text
                 Bootloader
                     |
              Verify Firmware
                     |
             +-------+-------+
             |               |
           VALID           INVALID
             |               |
             v               v
       Start Application   Recovery
                              |
                              v
                     Receive New Firmware
                              |
                              v
                       Verify Signature
                              |
                              v
                       Install Firmware
```

Recovery could use:

- UART
- CAN
- USB
- SPI
- Another communication interface

For an automotive-style project, CAN/UDS can later be used as the firmware update transport.

---

## 14. Flash Read-Out Protection

The STM32F103 provides Flash protection mechanisms through option bytes.

One important mechanism is **Read-Out Protection (RDP)**.

The purpose is to make unauthorized external reading of Flash more difficult.

Conceptually:

```text
Debugger / Programmer
        |
        v
   Access Flash
        |
        v
   RDP Enabled?
     /     \
   YES      NO
   |         |
Protected   Access
```

RDP should be considered one layer of the overall security architecture.

It does not replace Secure Boot.

---

## 15. Secure Boot vs RDP

These mechanisms solve different problems.

| Mechanism | Purpose |
|---|---|
| Secure Boot | Prevent unauthorized firmware from executing |
| SHA-256 | Detect firmware modification |
| Digital Signature | Verify firmware authenticity |
| RDP | Restrict external Flash read access |
| Write Protection | Protect selected Flash areas from modification |
| Anti-Rollback | Prevent installation of older firmware |
| Secure Update | Ensure only authorized firmware is installed |

A robust security architecture uses multiple mechanisms together.

---

## 16. Software Security Module

Since the STM32F103 does not have a dedicated HSM, we can create a software security layer.

Example architecture:

```text
+--------------------------------------+
|              Application             |
+--------------------------------------+
|         Security Service API         |
+--------------------------------------+
|                                      |
|  Crypto      Key       Secure Boot   |
|  Service    Manager      Manager     |
|                                      |
+--------------------------------------+
|             HAL / Drivers            |
+--------------------------------------+
|              STM32F103               |
+--------------------------------------+
```

Possible APIs:

```c
Security_Init();

Security_HashCalculate();

Security_VerifySignature();

Security_GetFirmwareVersion();

Security_CheckFirmware();

Security_StartSecureUpdate();
```

This architecture is useful for learning how a dedicated security subsystem can be integrated into an embedded software architecture.

---

## 17. Example Secure Boot API

A conceptual API could look like:

```c
typedef enum
{
    SEC_SUCCESS = 0,
    SEC_INVALID_METADATA,
    SEC_INVALID_HASH,
    SEC_INVALID_SIGNATURE,
    SEC_INVALID_VERSION,
    SEC_INVALID_FIRMWARE
} SecurityStatus;

SecurityStatus SecureBoot_VerifyApplication(void);
```

Implementation flow:

```c
SecurityStatus SecureBoot_VerifyApplication(void)
{
    FirmwareMetadata metadata;
    uint8_t calculated_hash[32];

    ReadFirmwareMetadata(&metadata);

    if (metadata.magic != FIRMWARE_MAGIC)
    {
        return SEC_INVALID_METADATA;
    }

    CalculateSHA256(
        APPLICATION_ADDRESS,
        metadata.firmware_size,
        calculated_hash
    );

    if (memcmp(calculated_hash,
               metadata.firmware_hash,
               32) != 0)
    {
        return SEC_INVALID_HASH;
    }

    if (!VerifySignature(
            metadata.firmware_hash,
            metadata.signature))
    {
        return SEC_INVALID_SIGNATURE;
    }

    if (!CheckFirmwareVersion(
            metadata.firmware_version))
    {
        return SEC_INVALID_VERSION;
    }

    return SEC_SUCCESS;
}
```

The actual cryptographic implementation should use a properly reviewed cryptographic library rather than custom cryptographic algorithms.

---

## 18. Jumping From Bootloader to Application

After successful verification, the bootloader can transfer execution to the application.

Conceptually:

```text
Bootloader
    |
    | Verify
    v
Application Valid
    |
    v
Set Application Vector Table
    |
    v
Set Main Stack Pointer
    |
    v
Jump to Reset Handler
```

Example conceptual code:

```c
typedef void (*ApplicationEntry)(void);

void JumpToApplication(uint32_t application_address)
{
    uint32_t stack_pointer;
    uint32_t reset_handler;

    stack_pointer = *(volatile uint32_t *)application_address;
    reset_handler = *(volatile uint32_t *)(application_address + 4U);

    /* Configure MSP */

    /* Jump to reset handler */
}
```

The exact implementation must account for the STM32 startup code, interrupt vector table, clock configuration and linker configuration.

---

## 19. Linker Configuration

The bootloader and application must occupy different Flash regions.

For example:

```text
Flash
0x08000000
+---------------------------+
| Bootloader                |
|                           |
| 64 KB                     |
+---------------------------+
| Metadata                  |
+---------------------------+
| Application               |
|                           |
| Remaining Flash           |
+---------------------------+
```

The application linker script must therefore use an application-specific Flash origin rather than the default `0x08000000`.

For example:

```text
Default:

FLASH ORIGIN = 0x08000000
```

could conceptually become:

```text
Application:

FLASH ORIGIN = 0x08010000
```

The exact address depends on the bootloader size and memory layout.

---

## 20. Development Workflow

A practical development workflow can be:

```text
Step 1
Create STM32F103 project
        |
Step 2
Create Bootloader
        |
Step 3
Create Application
        |
Step 4
Separate Flash regions
        |
Step 5
Add firmware metadata
        |
Step 6
Add SHA-256
        |
Step 7
Add signature verification
        |
Step 8
Add version checking
        |
Step 9
Add recovery mechanism
        |
Step 10
Configure Flash protection
        |
Step 11
Test invalid firmware
        |
Step 12
Test modified firmware
        |
Step 13
Test rollback firmware
```

---

## 21. Test Cases

A Secure Boot implementation should be tested with positive and negative scenarios.

| Test | Firmware | Expected Result |
|---|---|---|
| 1 | Valid signed firmware | Boot application |
| 2 | Modified application | Reject |
| 3 | Invalid signature | Reject |
| 4 | Invalid metadata | Reject |
| 5 | Unsupported version | Reject |
| 6 | Older firmware | Reject if anti-rollback is enabled |
| 7 | No application | Enter recovery |
| 8 | Corrupted firmware | Reject |
| 9 | Valid firmware update | Install and boot |
| 10 | Interrupted update | Remain in recovery / previous valid image |

---

## 22. Secure Boot Test Example

Suppose we have:

```text
Firmware Version: 1.0.0
Firmware Size:    48 KB
SHA-256:          ABC123...
Signature:        Valid
```

Bootloader processing:

```text
Reset
  |
  v
Read Metadata
  |
  v
Check Magic
  |
  v
Check Size
  |
  v
Calculate SHA-256
  |
  v
Compare Hash
  |
  v
Verify Signature
  |
  v
Check Version
  |
  v
Jump to Application
```

Now suppose one byte in the application is modified.

The result becomes:

```text
Calculated Hash != Expected Hash
```

Therefore:

```text
Application Rejected
```

---

## 23. What This Prototype Demonstrates

This STM32F103 project can demonstrate the fundamental security chain:

```text
Firmware
   ↓
Integrity
   ↓
Authenticity
   ↓
Version Control
   ↓
Secure Installation
   ↓
Secure Execution
```

This is highly useful for understanding the concepts behind automotive secure boot.

---

## 24. Mapping to Automotive Security Architecture

The STM32F103 prototype can be used as a learning bridge to automotive security concepts.

| Prototype | Automotive Concept |
|---|---|
| Bootloader | Secure Bootloader |
| SHA-256 | Firmware integrity |
| ECDSA/RSA verification | Firmware authenticity |
| Metadata | Secure firmware manifest |
| Version | Anti-rollback |
| Recovery | Secure update/recovery |
| RDP | Debug/access protection |
| Software Security Manager | HSM-like software architecture |
| Secure Update | OTA / diagnostic firmware update |

However, this is an **architectural analogy**, not a claim that the STM32F103 provides the same hardware security capabilities as an automotive MCU HSM.

---

## 25. STM32F103 vs MCU With HSM

A modern automotive MCU may include a dedicated security subsystem.

Conceptually:

```text
             Automotive MCU
+--------------------------------------+
| Application CPU                      |
|                                      |
| AUTOSAR / Application                |
|                                      |
+--------------------------------------+
|              HSM                    |
|                                      |
| Secure Boot                          |
| Crypto Engine                        |
| Secure Key Storage                   |
| RNG                                  |
| Secure Services                      |
| Hardware Isolation                   |
+--------------------------------------+
| Hardware Peripherals                 |
+--------------------------------------+
```

The STM32F103 is more like:

```text
             STM32F103
+--------------------------------------+
| Application                          |
+--------------------------------------+
| Software Security Layer              |
|                                      |
| Secure Boot                          |
| Software Crypto                      |
| Firmware Verification                |
+--------------------------------------+
| Cortex-M3                            |
+--------------------------------------+
| Flash / SRAM / Peripherals           |
+--------------------------------------+
```

This difference is important when moving from a prototype to a production automotive ECU.

---

## 26. Recommended Project Structure

A simple project structure could be:

```text
STM32_SecureBoot/
│
├── Bootloader/
│   ├── Inc/
│   │   ├── secure_boot.h
│   │   ├── firmware_metadata.h
│   │   └── crypto_service.h
│   │
│   └── Src/
│       ├── secure_boot.c
│       ├── firmware_metadata.c
│       ├── crypto_service.c
│       └── boot_jump.c
│
├── Application/
│   ├── Inc/
│   └── Src/
│
├── Crypto/
│   ├── sha256/
│   └── signature/
│
├── Tools/
│   └── firmware_signer/
│
├── Linker/
│   ├── bootloader.ld
│   └── application.ld
│
└── Documentation/
    └── SecureBoot_Architecture.md
```

A separate PC-side signing tool can generate the firmware package:

```text
Application ELF/BIN
        |
        v
Calculate Hash
        |
        v
Sign Hash
        |
        v
Create Metadata
        |
        v
Secure Firmware Package
```

---

## 27. PC Firmware Signing Tool

A useful extension is to create a Python firmware signing utility.

Example:

```text
firmware_signer.exe
```

Usage could conceptually be:

```text
firmware_signer.exe \
    application.bin \
    --version 1 \
    --key private_key.pem \
    --output secure_firmware.bin
```

The tool can:

1. Read application binary
2. Calculate SHA-256
3. Generate digital signature
4. Add firmware version
5. Add firmware size
6. Create metadata
7. Generate final firmware package

The STM32 bootloader then verifies the package.

---

## 28. Security Considerations

A prototype should not automatically be considered production secure.

Important considerations include:

- Private-key protection
- Public-key integrity
- Secure key provisioning
- Debug-port protection
- Fault injection
- Glitch attacks
- Side-channel attacks
- Secure storage
- Firmware rollback
- Update interruption
- Cryptographic implementation quality
- Random-number generation
- Physical access
- Manufacturing security

A software-only implementation on STM32F103 cannot provide the same protection against advanced physical attacks as a dedicated security subsystem.

---

## 29. Learning Roadmap

If your objective is to move from STM32 security concepts toward automotive ECU security, a useful roadmap is:

```text
Level 1
STM32F103
   |
   +-- Bootloader
   +-- SHA-256
   +-- Digital Signature
   +-- Firmware Verification
   |
   v
Level 2
Secure Firmware Update
   |
   +-- Version Control
   +-- Anti-Rollback
   +-- Recovery
   |
   v
Level 3
Automotive Diagnostics
   |
   +-- UDS
   +-- 0x10
   +-- 0x27 SecurityAccess
   +-- 0x34 RequestDownload
   +-- 0x36 TransferData
   +-- 0x37 RequestTransferExit
   |
   v
Level 4
Automotive Secure Boot
   |
   +-- Secure Boot Chain
   +-- Key Management
   +-- Secure Update
   +-- Authentication
   |
   v
Level 5
Automotive HSM
   |
   +-- Hardware Crypto
   +-- Secure Key Storage
   +-- Hardware Isolation
   +-- HSM Services
```

---

## 30. Key Takeaways

The STM32F103C8T6 can be used to learn and prototype **Secure Boot**, but it should not be described as having a dedicated HSM.

The important distinction is:

```text
STM32F103
    |
    +-- Software Secure Boot       YES
    +-- Firmware Hashing            YES
    +-- Signature Verification      YES
    +-- Secure Update               YES
    +-- Anti-Rollback Concept       YES
    +-- Flash Protection            YES
    |
    +-- Dedicated Hardware HSM      NO
```

The project is nevertheless a valuable starting point for understanding the security architecture used in more advanced automotive microcontrollers.

---

## 31. Conclusion

A Secure Boot implementation on the STM32F103C8T6 provides an excellent hands-on way to understand embedded firmware security.

The core concept is:

```text
             RESET
               |
               v
        Secure Bootloader
               |
               v
       Validate Metadata
               |
               v
        Calculate SHA-256
               |
               v
       Verify Signature
               |
               v
        Check Firmware Version
               |
          +----+----+
          |         |
        VALID     INVALID
          |         |
          v         v
    Start ECU    Recovery
    Application    Mode
```

Although the STM32F103 does not contain a dedicated HSM, the same fundamental security concepts can be explored through software.

Once these concepts are understood, the architecture can be extended toward automotive platforms with dedicated HSM/security hardware and AUTOSAR security services.

---

## AutoDevv Next Steps

Recommended follow-up tutorials:

1. **STM32F103 Secure Boot: Complete Bootloader Implementation**
2. **Implement SHA-256 on STM32**
3. **ECDSA Firmware Signature Verification**
4. **Create a Python Firmware Signing Tool**
5. **STM32 Secure Firmware Update Over UART**
6. **STM32 Secure Firmware Update Over CAN**
7. **UDS Bootloader: RequestDownload and TransferData**
8. **UDS SecurityAccess (0x27)**
9. **Secure Boot vs HSM vs SHE**
10. **Automotive HSM Architecture Explained**
11. **AUTOSAR Crypto Stack: CSM, CryIf and Crypto Driver**
12. **TRAVEO T2G HSM and Secure Boot Architecture**

---

**Author:** AutoDevv  
**Website:** AutoDevv  
**Topic:** Embedded Security / Automotive Cybersecurity  
**Target MCU:** STM32F103C8T6
