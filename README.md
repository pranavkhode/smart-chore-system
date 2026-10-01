# 🏠 Smart Chore Roster
### *Fair Chore Management System for Flatmates*

[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwindcss)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An intelligent, modern web application designed for 4 flatmates (**Soham**, **Pranay**, **Pranav**, and **Himanshu**) to distribute household chores fairly, eliminate roommate arguments, automatically balance workload by difficulty, and rotate duties weekly without consecutive chore repeats.

---

## 🌟 Key Features

- **Default Flatmates Setup**: Preconfigured with Soham, Pranay, Pranav, and Himanshu.
- **Default Chores Catalog**:
  - 🧹 **Cleaning** — Difficulty 3 (Medium)
  - 🍽️ **Washing Dishes** — Difficulty 2 (Low)
  - 🗑️ **Garbage** — Difficulty 1 (Easy)
  - 🍳 **Cooking** — Difficulty 4 (Hard)
- **Workload-Balanced Fair Assignment**:
  - Assigns chores by difficulty level (1 = Easy to 5 = Very Hard).
  - Enforces the **Consecutive-Week Anti-Repeat Rule** (guarantees nobody gets the same chore two weeks in a row).
  - Handles uneven counts (more chores than flatmates, fewer chores with rest weeks).
- **Dynamic Leave Handling**:
  - Mark any flatmate **"On Leave"** with 1 click.
  - Chores are automatically redistributed among remaining active flatmates without manual recalculation.
- **Single-Click "NEXT WEEK"**:
  - Automatically archives the previous week to the **History Audit Log**.
  - Generates the next week's fair chore rotation with celebratory confetti.
- **Chore Completion Tracking**:
  - Interactive "Mark Done" / "Mark Pending" toggles.
  - Updates progress bars, completion counts, and flatmate stats immediately.
- **Non-Judgmental Statistics**:
  - Displays objective, factual metrics (completed chores, difficulty points contributed, completion rates) without subjective "best/worst" ranking.
- **Assignment History**:
  - Retains a complete log of past weekly rotations for accountability.
- **Built-in 7-Point Test Suite**:
  - Automated test runner verifying all 7 test cases specified in the project requirements.
- **Persistent Data**:
  - Saved in browser `localStorage` — persists across refreshes and restarts.

---

## 🚀 Quick Start Guide

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/smart-chore-roster.git
cd smart-chore-roster
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 4. Build for production
```bash
npm run build
npm run preview
```

---

## 🧪 Verification & Automated Test Suite

The system includes automated verification checks for all required test scenarios:

| Test ID | Test Scenario | Verified Behavior | Status |
| :--- | :--- | :--- | :---: |
| **Test 1** | 4 flatmates + 4 chores | 1 chore per flatmate, workload evenly balanced | ✅ Passed |
| **Test 2** | 4 flatmates + 6 chores | Multi-chore distribution, max 2 chores/person | ✅ Passed |
| **Test 3** | 4 flatmates + 2 chores | 2 flatmates get chores, 2 get a rest rotation | ✅ Passed |
| **Test 4** | 1 flatmate on leave | 0 chores assigned to on-leave person, 4 distributed to 3 active | ✅ Passed |
| **Test 5** | 3 flatmates on leave | All 4 chores safely assigned to the lone available flatmate | ✅ Passed |
| **Test 6** | All flatmates on leave | Safe edge-case handled with clear warning, no crashes | ✅ Passed |
| **Test 7** | Week 1 → Week 2 Rotation | Verified **0 repeated chores** in consecutive weeks | ✅ Passed |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, JavaScript (ES Modules)
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Animation**: Canvas-Confetti
- **Storage**: Browser `localStorage` with auto-recovery
- **Tooling**: Vite 8

---

## 📄 License
This project is open-source and available under the MIT License.
