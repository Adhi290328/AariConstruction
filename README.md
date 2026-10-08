# Aari Construction — High-Level Design (HLD) Prototype & Presentation Guide

A modern web-based High-Level Design (HLD) prototype designed for **Aari Construction** to demonstrate real-time construction stage tracking, multi-tier delivery segregation, and non-blocking customer customization management.

---

## 🚀 Quick Start (Running Locally & Vercel Ready)

### Option 1: Run Locally
The application has zero external runtime dependencies and can be launched immediately:

```bash
# Start local server
npm start
# or
node serve.js
```
Then open your browser at: **`http://localhost:3000`**

*(Alternatively, you can open [`index.html`](file:///c:/Users/adhis/AariConstruction/index.html) directly in any modern browser).*

### Option 2: Live Deployment on Vercel ☁️
This project is pre-configured for instant zero-config deployment on Vercel:
1. Push this repository to your GitHub account (`Adhi290328/AariConstruction`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import the **`AariConstruction`** repository.
4. Click **Deploy** (no build command or root directory overrides needed).
5. Share the generated `.vercel.app` URL with your evaluators, team members, or clients to demo anywhere from any phone, tablet, or laptop!

---

## 🏗️ The Core Problem & Solution

### The Challenge
Aari Construction builds everything from individual houses and villas to entire apartment complexes. Customers select different levels of completion:
- **Bare-Bones:** Structural frame, walls, rough plastering. Customer handles electrical, painting, and interior decor.
- **Semi-Finished:** Structure, concealed electrical/plumbing rough-ins, base primer paint, and balcony/bath tile cladding. Customer manages woodwork & furnishings.
- **Fully Finished & Custom:** Turnkey luxury homes with bespoke interiors, automation, and designer kitchens.

**The Bottleneck:** When one customer in an apartment block requests extensive custom interior work, traditional builders hold back deliveries across the entire building. Aari cannot afford to delay a Bare-Bones or Semi-Finished customer whose unit is already finished!

### The Digital Solution
A decoupled, multi-tier tracking system that provides:
1. **Isolated Stage Progression:** Each unit tracks its own scope independently.
2. **Early Handover Passes:** Units like Flat 101 (Bare-Bones) are marked **Ready for Handover** immediately upon plastering curing, even while Flat 104 (Custom) undergoes bespoke interior work.
3. **Floor-to-Customer Photo Proof:** Site supervisors upload on-site verification photos to prevent unnecessary physical site visits.
4. **Non-Interference Change Requests:** Customers submit customization requests through their portal with transparent cost and schedule impact analysis.

---

## 👥 6-Member Presentation Delegation (30-Minute Pitch Flow)

| Member | Presentation Role | Focus Area & Screen Demonstration |
|---|---|---|
| **Member 1** | **System Architecture & Navigation Lead** | Introduces the problem statement, solution architecture, and the top role switcher (Consultant vs. Customer). |
| **Member 2** | **Project Portfolio & Executive Dashboard Lead** | Presents executive KPI metrics (12 projects, 148 units, 36 ready for handover) and the Tier Decoupling framework. |
| **Member 3** | **Apartment Matrix & Non-Delay Segregation Lead** | Demonstrates the Unit Grid (Green Valley Block A: Flat 101 Bare-Bones vs Flat 102 Semi vs Flat 104 Custom). |
| **Member 4** | **Milestone Tracking & Dynamic ETA Lead** | Demonstrates Flat 102 deep-dive: milestones (Foundation → Structure → MEP → Painting → Cladding) and dynamic ETA. |
| **Member 5** | **Site Verification & Photo Evidence Lead** | Demonstrates site floor photo uploads (balcony cladding, electrical conduits, primer coats) with instant client sync. |
| **Member 6** | **Customer Portal & Customization Workflow Lead** | Switches to Priya's portal: verifies 80% progress, reviews photos, submits change request (`CR-1025`), and reviews delivery assurance. |

---

## ⏱️ Recommended 30-Minute Presentation Agenda

1. **00:00 – 05:00:** Problem Context & Business Dilemma (Aari Construction's customization vs. schedule delivery problem).
2. **05:00 – 10:00:** Architecture Overview (Click **📐 HLD Architecture & Team** in the top bar to show Layers 1, 2, and 3).
3. **10:00 – 18:00:** Consultant Portal Walkthrough (Dashboard, Projects, Unit Matrix, Photo Upload simulation).
4. **18:00 – 25:00:** Customer Portal Walkthrough (Switch to Priya / Vikram, review real-time photos, submit live customization request).
5. **25:00 – 30:00:** Non-Interference Delivery Guarantee, Business Impact, and Q&A.
