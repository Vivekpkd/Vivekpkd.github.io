# AutoDevV — Cruise Control Simulator

An interactive automotive control-systems learning module: a 3D vehicle, a
PID cruise controller, a longitudinal vehicle model, a live speed graph, and an
AUTOSAR-style CAN/ECU signal view.

## Run it

```bash
cd "pages/tools/Virtual Cruise Control/app"
npm install
npm run dev
```

Then open **http://localhost:3000**.

| Script              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Vite dev server on port 3000 (HMR on 3000) |
| `npm run build`     | Production build into `dist/`               |
| `npm run typecheck` | `tsc --noEmit`                             |

> **Port note:** `vite.config.js` pins the server *and* HMR to port 3000. Passing
> a different `--port` makes module requests fall back to the SPA shell and the
> 3D component silently fails to load. Use the config's port.

## Shipping it inside the Autodevv site

This folder is the site page; `app/` is the Vite source behind it.

```text
pages/tools/Virtual Cruise Control/
├── index.html      published page  (loads ./assets/app.js)
├── assets/         build output    (committed - tracked by the site repo)
│   └── app.js      single classic bundle (React + Three.js + Tailwind styles)
└── app/            Vite source     (node_modules + dist are git-ignored)
```

- The build writes *outside* `app/` (`build.outDir: "../assets"`) because
  `app/.gitignore` ignores `dist/`, so anything built there would never reach
  GitHub Pages. Output file names are fixed (`app.js`), so `index.html` never
  needs editing after a rebuild.
- `app.js` is emitted as an **IIFE classic script**, not an ES module. Module
  scripts are CORS-blocked on `file://`, which left the page stuck on its
  "Loading…" fallback when the file was opened from disk. A classic `<script>`
  boots from disk *and* over http(s). Consequences: `inlineDynamicImports`
  inlines everything (no code-splitting — the bundle is ~1.1 MB / ~300 kB gzip)
  and Tailwind styles are injected by the bundle, so there is no `.css` file.
- Rebuild and publish:

```bash
cd "pages/tools/Virtual Cruise Control/app"
npm run build
git add "../../../pages/tools/Virtual Cruise Control/assets"
```

- **Home link:** the header logo and the `⌂ HOME` button point at
  `../../../index.html` (the site home). A matching link sits in the shell's
  loading fallback and `<noscript>`, so visitors can always get back even if the
  bundle fails to boot.
- **In-app help:** the header's `❔ HELP` button opens a right-hand drawer
  (`src/components/HelpPanel.tsx`) with a quick start, button reference, cruise
  states, road scenarios, fault injection, top-bar buttons and troubleshooting.
  It closes with ✕, *Got it*, `Esc` or a backdrop click, and locks page scroll
  while open.
- **Entry points on the site home** (both `index.html` and `pages/home/index.html`):
  an *Explore Topics* card, plus a featured *Latest Articles* card tagged
  `data-featured-card`. `js/app.js` rebuilds that grid with `innerHTML = ''`, so it
  re-inserts any `[data-featured-card]` node first — keep that attribute if you
  add more hand-authored cards.

## Project layout

```text
app/
├── index.html                 page entry (Vite module entry, not opened directly)
├── vite.config.js             react + tailwind plugins, port 3000
├── tsconfig.json
└── src/
    ├── main.tsx               React entry point
    ├── index.css              Tailwind + slider/scrollbar styling
    ├── App.tsx                simulation, PID, HMI, graph, CAN panel
    ├── hooks/
    └── components/
        └── Scene3D.tsx       Three.js scene (car, road, scenery)
```

## How it works

```text
                 ┌──────────────────────┐
                 │  Cruise Control HMI  │  ON / SET / RES / CANCEL, speed +/-
                 └──────────┬───────────┘
                            ▼
                 ┌──────────────────────┐
                 │  Cruise SWC          │  state machine + target manager
                 │  PID Controller      │
                 └──────────┬───────────┘
                            │ throttle / brake
                            ▼
                 ┌──────────────────────┐
                 │  Vehicle Model       │  drag, rolling resistance, gradient
                 └──────────┬───────────┘
                            │ vehicle speed
              ┌─────────────┴─────────────┐
              ▼                           ▼
      ┌───────────────┐          ┌──────────────────┐
      │ Speed sensor  │          │ Three.js scene   │
      │  / CAN signal │          │  (car + road)    │
      └───────────────┘          └──────────────────┘
```

### Control loop

A fixed **20 Hz** plant step (`SIM_DT = 0.05 s`) runs on a ref, decoupled from
React. Each step:

1. Applies the scenario's road gradient.
2. Runs the state machine (`OFF` / `STANDBY` / `ACTIVE` / `OVERRIDE`).
3. Computes the PID output.
4. Integrates the vehicle dynamics.
5. Pushes a chart sample every 4th step (5 Hz) and re-renders React every 4th
   step (5 Hz), so the physics loop never waits on rendering.

### PID gains

| Gain | Value | Unit                   | Role                                       |
| ---- | ----- | ---------------------- | ------------------------------------------ |
| Kp   | 800   | N per (km/h) error     | responds to the current speed error        |
| Ki   | 50    | N per (km/h·s)         | removes steady-state error (e.g. a hill)   |
| Kd   | 30    | N per (km/h/s)         | damps overshoot                            |

The integral term is clamped to `I_LIMIT = 50 km/h·s` (anti-windup).

### Vehicle model

Longitudinal dynamics only — no lateral or yaw behaviour.

```text
F_net = F_throttle − F_brake − F_drag − F_rolling − F_grade
a     = F_net / m
```

| Parameter          | Value    |
| ------------------ | -------- |
| Mass               | 1500 kg  |
| Drag coefficient   | 0.3      |
| Frontal area       | 2.2 m²   |
| Air density        | 1.225 kg/m³ |
| Rolling resistance | 0.015    |
| Max engine force   | 4000 N   |
| Max retard force   | 1200 N   |
| Max brake force    | 6000 N   |

The actuator is **bidirectional**: a positive PID output opens the throttle, a
negative output is engine braking (retarder), escalating to the service brake
only if the retarder cannot hold speed on a steep descent.


## Controls

| Control             | Behaviour                                                       |
| ------------------- | --------------------------------------------------------------- |
| **ON** / **OFF**    | Arm / disarm the system                                          |
| **SET**             | Latch the current road speed as target (requires > 5 km/h)      |
| **RES**             | Resume the speed stored before CANCEL or pedal override          |
| **CANCEL**          | Drop out of ACTIVE but keep the stored speed for RES             |
| **− / +**           | Adjust set speed in 5 km/h steps (30–180 km/h)                    |
| **Manual throttle** | Accelerator pedal; suspends cruise and latches the current speed |

### Scenarios

`Flat` · `Uphill` (+5%) · `Downhill` (−4%) · `Mixed` (sinusoidal, ±6%)

### Fault injection

| Fault      | Effect                                                                                                    |
| ---------- | --------------------------------------------------------------------------------------------------------- |
| **Sensor** | `VehicleSpeed` corrupted with bias + noise; the controller regulates to a false speed, so the real car drifts away from target |
| **Actuator** | Throttle welded at 30%; the controller's output is ignored                                                 |

### CAN signals displayed

`VehicleSpeed` · `CruiseSetSpeed` · `CruiseState` · `ThrottlePos` ·
`BrakePedalPos` · `RoadGradient` · `EngineRPM` · `Odometer` ·
`WheelSpeedFault` · `ThrottleActFault`

### Engineering view

Toggle with the **🔧 ENGINEERING VIEW** button to reveal the AUTOSAR layering
(SWC → RTE → BSW), the signal-flow table, and the state machine.

## Changes made

Two files were modified: `src/App.tsx` and `src/components/Scene3D.tsx`
(767 insertions, 611 deletions). Four real defects were fixed.

### 1. The live graph never worked

The simulation loop appended data points with `actual: 0, target: 0,
throttle: 0`, and a *separate* `useEffect` patched only the **last** element of
the history array. Every older point kept its zero placeholder, so the chart
drew a flat line along zero with a single spike at the right edge.

**Fix:** each sample is now written with its real values at the moment it is
taken, inside the loop that produces it.

### 2. The 3D world never moved

`animate()` only called `renderer.render()`. The motion logic lived in a
`useEffect` with **no dependency array**, so `clock.getDelta()` returned a
near-zero `dt` and the road, trees, and posts barely shifted.

**Fix:** a real `requestAnimationFrame` loop advances a distance `offset` by the
actual vehicle speed, wrapping scenery as it passes the camera. `dt` is clamped
to 0.1 s so a backgrounded tab doesn't jump the world on return. Geometry and
materials are now disposed on unmount.

### 3. Steady-state error on downgrades

Found by a standalone harness that replays the plant and asserts convergence.
Holding 80 km/h on a −4% grade settled at **82.43 km/h** — a 2.43 km/h error.

**Cause:** the throttle output was clamped to `≥ 0`, so the controller had no
engine-braking authority. It could only slow the car through a separate 2 km/h
brake deadband, and the loop parked just outside it.

**Fix:** the actuator is bidirectional (see *Vehicle model*). The same case now
settles at **80.01 km/h**.

### 4. Cruise state machine was incomplete

`RES` restored `targetSpeed`, which `CANCEL` and the speed +/− buttons also
mutated, so RES returned to whatever was last displayed rather than the last
*latched* speed. Accelerator override did not latch anything.

**Fix:** added a separate `storedSpeed`. `SET` and the ± buttons latch it,
`CANCEL` preserves it, and touching the accelerator stores the current speed so
`RES` returns there — matching real ECU behaviour.


### Also improved

- **Fixed-step decoupling** — the plant runs on a ref at 20 Hz; React re-renders
  at 5 Hz. Previously the interval was recreated on every `scenario` change,
  which wiped the odometer and the graph.
- **Brake lights** respond to the commanded brake level via a new `braking`
  prop (the old comment claimed this, but nothing drove it).
- **Sensor fault** now models a real corrupted signal (85% scale + 12 km/h bias
  + ±9 km/h noise) instead of pure random noise, so the failure is legible on
  the graph.
- Removed an unused `ReferenceLine` import, an unused `trimMat`, and an unused
  `Mover` interface.

## Verification performed

Checked against the exact files that ship:

- `tsc --noEmit` clean under `strict`, `noUnusedLocals`, `noUnusedParameters`
- `vite build` succeeds (~1.11 MB, ~299 kB gzip, one classic bundle)
- Boots both from disk (`file://`) and over http(s) — verified in headless Chrome:
  the React UI replaces the loading fallback, a live `<canvas>` mounts, and the
  console is error-free on the tool page and on both site home pages
- 16-check headless DOM smoke test with **0 React errors**, driving the real UI:
  `ON`→`STANDBY`, manual throttle, `SET` latching, cruise holding speed within
  0.4 km/h, a real curved speed trace, integral recovery on a 5% grade, no
  downgrade error, CAN panel, engineering view, and both fault injections

Plant-only convergence checks (target vs. settled mean over the final 20 s):

| Scenario      | Target | Settled | Band      |
| ------------- | ------ | ------- | --------- |
| Flat          | 80     | 80.00   | 0.01      |
| Flat          | 120    | 120.01  | 0.01      |
| Uphill +5%    | 80     | 80.00   | 0.00      |
| Downhill −4%  | 80     | 80.01   | 0.01      |
| Steep +8%     | 60     | 60.00   | 0.00      |
| Step 100 → 60 | 60     | 59.78   | brake used |

## Known limitations

- **The 3D scene has not been visually judged.** It does mount and render (a
  `<canvas>` appears in headless Chrome with no console errors), but the car,
  scrolling road, scenery and gradient pitch still need an eyeball check.
- Longitudinal dynamics only — no lateral, yaw, or tyre model.
- Road gradient follows the scenario clock, not a distance-based road profile.
- The engine is a single constant-force source; there is no torque curve,
  gearbox, or shift behaviour.
- The bundle is ~1.11 MB (~299 kB gzipped), mostly Three.js, and ships as one
  classic (IIFE) file so the page also boots from `file://`. Switching back to
  `format: "es"` restores code-splitting, at the cost of requiring a web server
  (GitHub Pages qualifies; double-clicking the file does not).

