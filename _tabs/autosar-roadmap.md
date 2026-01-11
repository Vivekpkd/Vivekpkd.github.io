---
title: AUTOSAR Roadmap
icon: fas fa-road
order: 2
layout: page
permalink: /autosar-roadmap/
---

# 🚗 AUTOSAR Learning Path (Classic)

This page presents a **step-by-step roadmap for learning AUTOSAR Classic** — from basics to advanced topics.

---

## 🟢 LEVEL 1: AUTOSAR Fundamentals (Beginner) 
1. What is AUTOSAR? Why Automotive Industry Uses It
2. AUTOSAR Architecture Overview (Layered Architecture)
3. AUTOSAR Terminologies Explained (ECU, SWC, BSW, RTE)
4. AUTOSAR Classic Platform – High Level Overview
5. Benefits & Drawbacks of AUTOSAR
6. AUTOSAR Versions & Releases (4.x overview)
7. AUTOSAR Compliance & Conformance
8. AUTOSAR Use Cases in Real ECUs

    <a href="/posts/what-is-autosar/" style="font-size:20px; font-weight:bold;">
  Explore AUTOSAR Fundamentals here
        </a>



---

## 🟡 LEVEL 2: AUTOSAR Classic – Core Concepts (Intermediate)

### Software Components (SWC)
10. What is a Software Component (SWC)?
11. Application SWC vs Service SWC vs ECU Abstraction SWC
12. Ports & Interfaces (Sender-Receiver vs Client-Server)
13. Runnable Entities & Events
14. Data Types in AUTOSAR
15. Internal Behavior of SWC
16. AUTOSAR XML (ARXML) Basics
17. SWC Design Flow (OEM → Tier-1 → Supplier)

### Runtime Environment (RTE)
18. What is RTE in AUTOSAR?
19. RTE Generation Process
20. RTE APIs Explained
21. Communication via RTE (Inter & Intra ECU)
22. RTE vs Direct Function Calls
23. RTE Memory Mapping Basics

---

## 🟡 LEVEL 3: AUTOSAR Classic – BSW Deep Dive

### Basic Software (BSW Overview)
24. What is Basic Software (BSW)?
25. AUTOSAR BSW Layered Architecture
26. BSW Modules Classification

### Microcontroller Abstraction Layer (MCAL)
27. What is MCAL?
28. MCAL Drivers Overview
29. DIO Driver Explained
30. ADC Driver Explained
31. PWM Driver Explained
32. GPT & ICU Drivers
33. SPI / I2C / UART Drivers
34. Port Driver & Pin Configuration
35. MCAL Configuration Workflow

### ECU Abstraction Layer
36. ECU Abstraction Layer Explained
37. IO Hardware Abstraction
38. Memory Abstraction
39. Sensor & Actuator Abstraction

### Services Layer
40. OS (AUTOSAR OS) Basics
41. Task, ISR, Alarm, Counter Explained
42. Schedule Tables
43. OS Application & Memory Protection
44. Watchdog Manager (WdgM)
45. ECU State Manager (EcuM)
46. BSW Mode Manager (BswM)
47. NVRAM Manager (NvM)
48. Diagnostic Event Manager (Dem)
49. Diagnostic Communication Manager (Dcm)
50. Communication Manager (ComM)
51. Network Management (NM)
52. CAN Interface (CanIf)
53. CAN State Manager (CanSM)
54. LIN / FlexRay Overview

---

## 🔵 LEVEL 4: Communication Stack (Advanced)
55. AUTOSAR CAN Stack – End-to-End Flow
56. COM Module Explained
57. PDU Router (PduR)
58. CAN Transport Protocol (CanTp)
59. UDS Diagnostics Flow in AUTOSAR
60. Diagnostic Services (0x10, 0x11, 0x22, 0x2E)
61. DTC Lifecycle & DEM Internals
62. Signal vs PDU vs Frame Mapping
63. Gateway ECU Communication
64. End-to-End Protection (E2E)

---

## 🔵 LEVEL 5: Memory, Boot & Flash (Advanced)
65. Memory Stack Overview
66. Flash Driver (Fls)
67. EEPROM Driver (Eep)
68. Memory Interface (MemIf)
69. Fee / Ea Modules
70. NvM Block Management
71. Bootloader Basics
72. Flashing ECUs via UDS
73. Secure Flashing Overview

---

## 🔴 LEVEL 6: Safety & Security (Expert)
74. Functional Safety & ISO 26262 Overview
75. AUTOSAR Safety Concept
76. Watchdog Mechanism in AUTOSAR
77. Memory Protection & OS Protection
78. End-to-End Communication Protection
79. Secure Onboard Communication (SecOC)
80. Cryptography Stack (Crypto, CryIf)
81. Secure Boot Basics
82. HSM (Hardware Security Module) Overview

---

## 🔴 LEVEL 7: Timing, Performance & Optimization
83. Timing Analysis in AUTOSAR
84. Runnable Scheduling & OS Mapping
85. Stack & Heap Usage Optimization
86. RTE Performance Optimization
87. BSW Timing Constraints
88. Startup Time Optimization
89. Worst Case Execution Time (WCET)

---

## 🔴 LEVEL 8: Toolchain & Industry Practice (Professional)
90. AUTOSAR Development Workflow (OEM → Tier-1)
91. Vector vs EB vs ETAS Toolchain Comparison
92. DaVinci Configurator Workflow
93. DaVinci Developer Deep Dive
94. EB Tresos Basics
95. ARXML Merge & Conflict Handling
96. Integration Issues & Debugging
97. CANoe & CANalyzer with AUTOSAR
98. Debugging AUTOSAR ECUs
99. Common AUTOSAR Interview Questions

---

## 🧩 BONUS: Real-World & Practical Topics
100. AUTOSAR vs Bare-Metal Embedded C
101. AUTOSAR vs FreeRTOS
102. Typical AUTOSAR Project Folder Structure
103. How OEM Requirements Become SWCs
104. Common AUTOSAR Myths
105. AUTOSAR Career Roadmap
106. Sample AUTOSAR Project Explanation
107. Phase-wise ECU Development Example
108. AUTOSAR Interview Experience (India)
109. AUTOSAR Troubleshooting Cheat Sheet

---

**Tip:** Click on any topic in your future posts to see a detailed tutorial.  
This page is your **AUTOSAR roadmap from beginner → advanced Classic level**.
