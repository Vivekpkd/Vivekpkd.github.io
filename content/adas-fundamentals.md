---
title: "ADAS Fundamentals: How Cars See"
date: "Jan 18, 2026"
excerpt: "Introduction to Advanced Driver Assistance Systems: Radar, Lidar, and Camera Fusion."
---
# ADAS Fundamentals: Architecture of the Modern Vehicle

Advanced Driver Assistance Systems (ADAS) represent the bridge between traditional driving and full autonomy. At its core, ADAS is about safety and precision.

> [!NOTE]
> ADAS systems must operate in real-time with zero-latency tolerance for safety-critical decisions.

![Automotive Dashboard Sensor View](images/automotive-dashboard.png)

<!-- ad-placeholder -->

## The Multi-Layered Sensor Suite

Modern ADAS rely on "Sensor Fusion"—the practice of combining data from multiple sources to create a unified view of the environment.

### 1. Radar (Radio Detection and Ranging)
Radar is the backbone of **Adaptive Cruise Control (ACC)**. It uses radio waves to determine the range, angle, and velocity of objects.
- **Strength**: Unaffected by weather conditions like fog, rain, or snow.
- **Weakness**: Poor at object classification (e.g., distinguishing a person from a pole).

### 2. Lidar (Light Detection and Ranging)
Lidar pulses laser light to create a precise **3D Point Cloud**.
- **Strength**: Incredible spatial accuracy and depth perception.
- **Weakness**: High cost and performance degradation in heavy rain or dust.

### 3. Cameras (Computer Vision)
High-resolution CMOS sensors act as the "eyes" of the vehicle.
- **Strength**: Best for object recognition, traffic light detection, and lane marking.
- **Weakness**: Struggles in low light or direct sun glare.

---

## The Perception Pipeline: Sense to Act

Every ADAS decision follows a deterministic feedback loop:

1.  **Sense**: Raw data acquisition from the sensor suite.
2.  **Perceive**: Object detection, tracking, and environmental mapping using AI/ML.
3.  **Plan**: Path planning and risk assessment (e.g., "Will that pedestrian cross?").
4.  **Act**: Command execution via the CAN bus (Electronic Braking, Power Steering).

Professional ADAS engineers must ensure that this entire loop completes in less than **100ms** to ensure vehicle safety.
