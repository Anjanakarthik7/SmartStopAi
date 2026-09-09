# 🚇 SmartStop AI — Namma Metro Intelligent Transit System

> **An AI-Powered Smart Passenger Monitoring, Destination Prediction & Multi-Modal Alert Transit System**  
> *Validated on the Namma Metro (BMRCL) Network · Bengaluru, India*

[![Patent Status](https://img.shields.io/badge/Patent-Complete%20Filing%20%E2%9C%94%EF%B8%8F-0B7A75?style=for-the-badge)](https://github.com/Anjanakarthik7/SmartStopAi)
[![Network](https://img.shields.io/badge/Transit-Namma%20Metro%20BMRCL-11C5BF?style=for-the-badge)](https://english.bmrc.co.in/)
[![Platform](https://img.shields.io/badge/Stack-ES6%20%7C%20CSS3%20%7C%20Web%20Audio-0F2D55?style=for-the-badge)](https://github.com/Anjanakarthik7/SmartStopAi)
[![License](https://img.shields.io/badge/Intellectual%20Property-All%20Rights%20Reserved-E8473F?style=for-the-badge)](https://github.com/Anjanakarthik7/SmartStopAi)

---

## 📌 Executive Summary

**SmartStop AI** is a next-generation urban transit platform that synchronizes **IoT edge sensor telemetry**, **Bayesian machine learning destination inference**, and **multi-modal pre-arrival alerts** (push notifications, voice text-to-speech, and haptic feedback) to transform the passenger experience, assist elderly commuters, and provide transit operators with live disembarkation demand analytics.

---

## 🌟 Core System Modules

### 1. 🧠 Bayesian AI Destination Prediction Engine (`js/ai-engine.js`)
- **Bayesian Probability Modeling**: Computes individual destination probabilities from boarding stations using historical trip patterns preserved in `localStorage`.
- **Temporal Commute Heuristics**: Dynamically weights destination candidates based on peak commute hours:
  - **Morning Peak (07:00 – 11:30)**: High pull towards commercial, tech parks, and business districts (e.g., *Whitefield*, *Indiranagar*, *MG Road*).
  - **Evening Peak (16:30 – 21:00)**: Outbound flow towards residential belts and suburban transit hubs.
- **Explainable AI (XAI)**: Generates clear, human-readable rationales explaining *why* a destination was predicted, along with alternative destination chips.
- **Continuous Learning**: Online Bayesian weights update automatically each time a passenger completes a journey.

### 2. 🚆 Bidirectional Route Progress & Live Timeline (`js/app.js`)
- **Full Line Support**: Purple Line (37 stations: *Whitefield ↔ Challaghatta*) and Green Line (32 stations: *Madavara ↔ Silk Institute*).
- **Bidirectional Navigation**: Correctly tracks stations forward (+1) or reverse (-1), resolving direction conflicts when traveling inbound or outbound.
- **Pre-Arrival Proximity Alerts**: Automatically sounds a warning chime and voice announcement 1 station prior to the target destination.
- **Auto-Simulate Journey**: Built-in 4-second station-by-station auto-progression simulation for demonstrations.

### 3. 🔊 Web Audio API Transit Synthesizer (`js/audio.js`)
- **Zero-Dependency Audio**: Procedurally generates authentic 3-tone rising metro transit chimes (C5 $\rightarrow$ E5 $\rightarrow$ G5: 523.25Hz, 659.25Hz, 783.99Hz) directly in the browser.
- **Proximity & SOS Siren Tones**: Distinct double-tone alert for approaching stations and high-intensity alternating frequency siren for emergency distress.
- **Speech Synthesis Guidance**: Multilingual-ready spoken announcements alerting passengers to doors opening and station arrivals.

### 4. 📡 IoT & Edge Sensor Telemetry (`js/sensors.js`)
- **Infrared Passenger Counter (HC-SR04)**: Real-time boarding/alighting carriage count with live sparkline telemetry graph.
- **GPS Receiver Simulation (U-Blox Neo-6M)**: Real-time latitude/longitude interpolation along the metro line with realistic satellite jitter.
- **Cloud Gateway Telemetry**: Simulates Firebase Realtime DB sync, FCM Push Gateway status, and latency indicators.
- **Hardware Inventory**: ESP32 Dual-Core (240MHz), 4G LTE edge modem, and 2.4" TFT ILI9341 SPI display specifications.

### 5. 👴 Safe Journey Accessibility & Elderly Mode (`js/elderly.js`)
- **High-Contrast Display**: One-toggle accessibility mode with enlarged touch controls, bold typography, and visual aids.
- **🚨 SOS Emergency Distress Beacon**: Instant one-click beacon broadcasting GPS coordinates to driver dashboard and triggering emergency sirens.
- **Caregiver SMS Notification Relay**: Dispatches automated milestone notifications to registered family contacts.
- **Timestamped Milestone Audit**: Live audit trail logging journey milestones from boarding to arrival.

### 6. 🖥️ Driver & Fleet Analytics Dashboard (`js/driver.js`)
- **Off-boarding Demand Histogram**: Visualizes real-time disembarkation load per station, helping drivers anticipate stop dwell times.
- **Carriage Load KPIs**: Live tracking of passengers onboard, active SOS alerts, stops served, and AI predictions generated.
- **System Event Terminal**: High-tech terminal logging telemetry events with severity levels (`normal`, `success`, `alert`, `danger`).
- **Crowd Injection Tool**: Simulates passenger crowd surges at specific stations.

---

## 📁 Repository Architecture

```
SmartStopAi/
├── index.html                   # Primary entry point (links modular CSS & JS)
├── smartstop.html               # Descriptive modular HTML entry point
├── start-server.bat             # 1-Click launcher to boot local server and open browser
├── serve.ps1                    # Native lightweight localhost HTTP server daemon
├── README.md                    # Project documentation & inventor disclosures
├── .gitignore                   # Clean Git ignore rules
│
├── archive/
│   └── two_original_1400lines_backup.html # Safely preserved original 1,400-line monolith
│
├── css/                         # Modular CSS Stylesheets (6 files)
│   ├── style.css                # Base design system, typography, navbar, toasts & buttons
│   ├── passenger.css            # Journey setup, AI prediction card, route timeline
│   ├── driver.css               # Driver dashboard, KPI metrics, off-boarding demand chart
│   ├── sensor.css               # IoT sensor telemetry, live sparkline graph, hardware specs
│   ├── elderly.css              # Safe journey accessibility mode, caregiver SMS & SOS styling
│   └── patent.css               # Patent innovation disclosure, claims list & novelty matrix
│
└── js/                          # Modular JavaScript Tools (7 files)
    ├── data.js                  # Metro station datasets (Purple & Green lines, coordinates, hubs)
    ├── ai-engine.js             # Bayesian destination inference, peak hour heuristics, learning
    ├── audio.js                 # Web Audio API transit chimes & speech synthesis announcements
    ├── sensors.js               # IoT telemetry simulation (GPS stream, IR passenger counters)
    ├── driver.js                # Driver dashboard telemetry & real-time system event logs
    ├── elderly.js               # Accessibility features, caregiver notification relays, SOS
    └── app.js                   # Application coordinator, bidirectional navigation, auto-simulation
```

---

## 🚀 How to Run

### Option 1: 1-Click Launch (Windows)
Double-click **`start-server.bat`**. It will start the server and open your default browser directly to:
👉 **`http://localhost:8080/`**

### Option 2: PowerShell Local Server
Run the native server in PowerShell:
```powershell
powershell -ExecutionPolicy Bypass -File "serve.ps1"
```
Then visit [http://localhost:8080/](http://localhost:8080/) or [http://localhost:8080/smartstop.html](http://localhost:8080/smartstop.html).

### Option 3: Direct File Opening
Open [`index.html`](index.html) or [`smartstop.html`](smartstop.html) directly in any modern browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Safari).

---

## 📋 Patent Information & Novelty Disclosure

- **Invention Title**: AI-Based Smart Passenger Monitoring & Destination Alert System
- **Filing Type**: Complete Patent Filing
- **Classifications**: 
  - **IPC**: `B61L 25/00` (Railway Traffic Control)
  - **IPC**: `G08G 1/00` (Traffic Control Systems)
  - **CPC**: `G06Q 50/40` (Transportation Business Logistics)

### Research Gap & Novelty Matrix

| Prior Art Citation | Conventional Limitation | SmartStop AI Novelty |
| :--- | :--- | :--- |
| **US20180365990A1** (PA Announcements) | Fixed broadcasts to entire carriage without individual personalization. | Real-time passenger identity inference + personalized pre-arrival alerts. |
| **US20150019124A1** (IR Counting) | Basic head-counting without destination inference or behavioral modeling. | Multi-source sensor telemetry combined with Bayesian destination prediction. |
| **CN108022425A** (Digital Signage) | Fixed hardware displays with zero passenger interactivity or safety relays. | Self-learning multi-modal alert system with caregiver relays and emergency SOS. |

---

## 👥 Inventors & Academic Institution

| Inventor | Role | Affiliation |
| :--- | :--- | :--- |
| **Shreyas KS** | Lead Inventor (UID: 12407112) | Lovely Professional University, Punjab |
| **Kothamasu Anjana Karthik** | Co-Inventor (UID: 12411006) | Lovely Professional University, Punjab |

**Institutional Partner**: School of Computer Science & Engineering, Lovely Professional University (LPU), Phagwara, Punjab, India.  
**Target Commercialization Partners**: BMRCL (Namma Metro), DMRC (Delhi Metro), IRCTC, TCS Smart City Solutions, Wipro IoT, L&T Smart World.