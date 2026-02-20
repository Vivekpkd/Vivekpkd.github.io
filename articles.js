const articlesData = [
    {
        "title": "AUTOSAR Masterclass: Part 2 - ASW & VFB",
        "date": "Feb 09, 2026",
        "excerpt": "Software Components (SWCs), Ports, and the Virtual Functional Bus. Learn how AUTOSAR enables hardware-independent software design.",
        "link": "article-autosar-masterclass-2.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "ASW",
            "VFB",
            "SWC",
            "Ports"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 5 - Stability Stacks (Mem & Diag)",
        "date": "Feb 09, 2026",
        "excerpt": "How cars remember settings and detect faults. Explore the Memory Stack (NvM) and the Diagnostic Stack (DCM/DEM) in the BSW.",
        "link": "article-autosar-masterclass-5.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "NvM",
            "Diagnostics",
            "DEM",
            "DCM"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 1 - The Foundation",
        "date": "Feb 09, 2026",
        "excerpt": "What is AUTOSAR? Why does the automotive industry depend on it? Learn the philosophy and the massive layered architecture behind modern vehicles.",
        "link": "article-autosar.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "Architecture",
            "Automotive",
            "BSW",
            "RTE"
        ]
    },
    {
        "title": "Automotive Bootloader",
        "date": "Jan 17, 2026",
        "excerpt": "How to update firmware in the field. Dual-bank updates and memory jumping.",
        "link": "article-automotive-bootloader.html",
        "category": "General",
        "tags": []
    },
    {
        "title": "Embedded C Masterclass: Part 3 - Timing & GPIO",
        "date": "Feb 08, 2026",
        "excerpt": "Making the CPU interact with real time. Master the GPIO driver lifecycle and precision hardware timing.",
        "link": "article-embedded-c-basics-3.html",
        "category": "Embedded Systems",
        "tags": [
            "Timing",
            "GPIO",
            "Drivers",
            "Real-time"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 4 - Data in Motion (COM Stack)",
        "date": "Feb 09, 2026",
        "excerpt": "Deep dive into the AUTOSAR Communication Stack. Learn how signals travel from your application to the CAN/Ethernet bus through the PduR and COM modules.",
        "link": "article-autosar-masterclass-4.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "COM Stack",
            "CAN",
            "PduR",
            "Networking"
        ]
    },
    {
        "title": "Embedded C Masterclass: Part 6 - Systems & Automotive",
        "date": "Feb 08, 2026",
        "excerpt": "The big picture. Master software architecture, layered driver design, and automotive industry standards like UDS and AUTOSAR.",
        "link": "article-embedded-c-basics-6.html",
        "category": "Embedded Systems",
        "tags": [
            "Architecture",
            "Diagnostics",
            "UDS",
            "HAL",
            "MCAL",
            "AUTOSAR",
            "ADC"
        ]
    },
    {
        "title": "FEE (Flash EEPROM Emulation)",
        "date": "Jan 17, 2026",
        "excerpt": "what is fee module in autosar and why it is required.",
        "link": "article-fee-autosar.html",
        "category": "General",
        "tags": []
    },
    {
        "title": "Embedded C Masterclass: Part 2 - Pointers & Memory Mapping",
        "date": "Feb 08, 2026",
        "excerpt": "The bridge to the hardware. Learn how pointers unlock direct access to high-speed registers and physical memory.",
        "link": "article-embedded-c-basics-2.html",
        "category": "Embedded Systems",
        "tags": [
            "Pointers",
            "Memory Mapping",
            "Registers",
            "Volatile"
        ]
    },
    {
        "title": "Embedded C Masterclass: Part 4 - Interrupts & Timers",
        "date": "Feb 08, 2026",
        "excerpt": "Master the nervous system of the MCU. Learn how Interrupts and hardware Timers enable ultra-responsive event handling.",
        "link": "article-embedded-c-basics-4.html",
        "category": "Embedded Systems",
        "tags": [
            "Interrupts",
            "NVIC",
            "Timers",
            "PWM",
            "Event-driven"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 1 - The Foundation",
        "date": "Feb 09, 2026",
        "excerpt": "What is AUTOSAR? Why does the automotive industry depend on it? Learn the philosophy and the massive layered architecture behind modern vehicles.",
        "link": "article-autosar-masterclass-1.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "Architecture",
            "Automotive",
            "BSW",
            "RTE"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 3 - The Glue (RTE)",
        "date": "Feb 09, 2026",
        "excerpt": "Master the Runtime Environment (RTE). The vital middleware that transforms virtual connections into real C code and handles task scheduling.",
        "link": "article-autosar-masterclass-3.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "RTE",
            "Middleware",
            "Code Generation",
            "Scheduling"
        ]
    },
    {
        "title": "Hardware Security Module (HSM)",
        "date": "Feb 01, 2026",
        "excerpt": "Introduction to Hardware Security Modules in Automotive ECUs. Secure key storage and cryptographic acceleration.",
        "link": "article-hardware-security-module-hsm.html",
        "category": "Automotive Security",
        "tags": [
            "HSM",
            "Security",
            "SHE",
            "EVITA"
        ]
    },
    {
        "title": "Embedded C Masterclass: Part 5 - Communication Protocols",
        "date": "Feb 08, 2026",
        "excerpt": "Exhaustive guide to UART, SPI, I2C, and CAN. Master the physical and logical layers of industrial communication.",
        "link": "article-embedded-c-basics-5.html",
        "category": "Embedded Systems",
        "tags": [
            "UART",
            "SPI",
            "I2C",
            "CAN Bus",
            "Protocols",
            "Communication"
        ]
    },
    {
        "title": "Embedded C Masterclass: Part 1 - Kernels & Bitwise Logic",
        "date": "Feb 08, 2026",
        "excerpt": "Mastering the foundation. A deep dive into standard integer types, storage classes, and the art of bitwise manipulation.",
        "link": "article-embedded-c-basics-1.html",
        "category": "Embedded Systems",
        "tags": [
            "C Programming",
            "Bitwise",
            "Optimization",
            "Embedded Systems"
        ]
    },
    {
        "title": "AUTOSAR Masterclass: Part 6 - From Config to Code",
        "date": "Feb 09, 2026",
        "excerpt": "The final piece. Learn the AUTOSAR Methodology, the role of ARXML files, and how professional tools translate configurations into binary code.",
        "link": "article-autosar-masterclass-6.html",
        "category": "AUTOSAR",
        "tags": [
            "AUTOSAR",
            "Methodology",
            "ARXML",
            "Tooling",
            "Workflow"
        ]
    }
];