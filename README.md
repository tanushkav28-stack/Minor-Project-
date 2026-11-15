# Cognivibe AI 🧠
### Mindful Language & Emotional Wellbeing Intelligence in Code-Mixed Social Media Content

**Academic Level:** Final-Year B.Tech Major Project  
**Target Platform:** Web Application + Chrome/Edge Browser Extension  
**Primary Focus:** Hindi-English (Hinglish) Code-Mixed Language Processing  
**Ethical Classification:** Assistive Screening & Research Exploration (Strictly Non-Diagnostic)

---

## 🌟 What is Cognivibe AI?

Most traditional sentiment and emotion detection systems fail on Indian social media because communication happens in **Hinglish** (Hindi words written in Roman script mixed with English, e.g. *"Mujhe bhot akelapan feel hota h, kisi se baat karne ka mann nahi karta"*).

Furthermore, analyzing single isolated sentences often leads to false positives (e.g. *"I am so tired"* after an exam).

**Cognivibe AI solves both challenges:**
1. **Browser Extension (Manifest V3):** Users can highlight any text or scan posts directly on **Reddit, Twitter/X, Instagram, and YouTube**, plus an **Auto-Track Content & Mood** engine that passively captures permitted visible text, titles, snippets, and active reading time without recording sensitive data.
2. **AI Content Consumption & Mood Intelligence:**
   - Multi-dimensional classification across **Emotional Tone** (+ Positive, = Neutral, − Negative, Mixed), **Intensity** (Low, Med, High), **Topics**, **Categories** (*News & current affairs, Entertainment, Education, Social media, Other*), and **Constructiveness** (*Informative, Supportive, Uplifting, Harmful*).
   - Generates automated **Daily & Weekly Intelligence Reports** with emotional distributions, category screen time, and AI observations (*"Something to notice"*, *"A positive pattern"*).
   - **Digital Consumption vs. Actual Mood Tracking:** Evening check-in (*"How did you feel today?"*) correlates self-reported mood (*Happy, Calm, Neutral, Stressed, Sad, Anxious*) against exposure to distressing news.
3. **Multitask Neural Engine:** A shared encoder simultaneously predicts:
   - **Task 1: Emotion Classification** (7 classes: *Sadness, Anger, Joy, Fear, Neutral, Anxiety/Worry, Disgust*)
   - **Task 2: Depression-Related Language & Specific Linguistic Indicators** (*Loneliness, Hopelessness, Emotional Exhaustion, Negative Self-Perception, Loss of Interest, None*)
4. **Context-Aware Sequential Aggregator:** Compares isolated remarks against historical trajectories across turns to separate temporary bad days from persistent chronic distress.
5. **Full-Stack Research Dashboard:** React + TypeScript + Recharts dashboard with audit logs, trend charts, and downloadable PDF reports.
6. **Ethical Crisis Intervention:** Automatic detection of crisis distress with immediate 24x7 confidential helpline referral (**Tele-MANAS: 14416 / 1800-891-4416, KIRAN: 1800-599-0019**).

---

## 💻 What to Install to Run This Project Smoothly

To run the entire system smoothly, ensure you have:

### 1. Prerequisites
- **Python 3.10+** (Python 3.11 or 3.12 recommended; Python 3.15 supported)
- **Node.js (v18+) & npm**
- **Google Chrome** or **Microsoft Edge** (for the browser extension)
- *(Optional)* **PostgreSQL** or **Docker** (the system automatically uses SQLite out of the box with zero setup required!)

---

## 🚀 Quick Start Guide (Step-by-Step)

### Step 1: Clone or Open the Workspace
```bash
cd "c:\Users\tanus\Mental health project minor"
```

---

### Step 2: Run the Backend & ML Inference Server

The backend includes a zero-configuration runner that works immediately with Python standard libraries, and seamlessly connects to FastAPI, SQLAlchemy, and PyTorch once dependencies are installed.

```bash
# Optional: Install backend requirements in your virtual environment
pip install -r backend/requirements.txt

# Start the Backend Server (runs on http://localhost:8000)
python backend/server.py
```

✅ You will see:
```text
Launching Cognivibe AI Backend Server
Server URL: http://localhost:8000
API Base:   http://localhost:8000/api
Zero-configuration setup active. All REST endpoints ready.
```

---

### Step 3: Run the React Web Dashboard

Open a second terminal window:

```bash
cd frontend

# Install frontend dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev
```

✅ Open your browser and navigate to:
👉 **`http://localhost:5173`**

#### 🔑 Pre-seeded Demo Credentials:
- **Email:** `demo@aura.health` (or `demo@cognivibe.ai`)
- **Password:** `password123`
*(Or click "Auto-fill Demo Credentials" on the login screen for instant 1-click access!)*

---

### Step 4: Install the Browser Extension in Chrome or Edge

1. Open **Google Chrome** and visit `chrome://extensions/`  
   *(If using **Microsoft Edge**, visit `edge://extensions/`)*
2. In the top-right corner, switch on **Developer mode**.
3. Click the **Load unpacked** button.
4. Select the `browser-extension` folder located inside this project:  
   `c:\Users\tanus\Mental health project minor\browser-extension`
5. Click **Select Folder**. The **Cognivibe AI** extension is now installed!
6. Open the extension popup, go to **Settings**, and paste your **Extension Token** (found under *Settings* in your Web Dashboard) to pair your account!

---

## 🧪 Model Training & Benchmark Evaluation

To execute the full training and baseline comparison experiment:

```bash
python ml_engine/training/train_all.py
```

This trains:
1. **Baseline 1:** TF-IDF + Logistic Regression
2. **Baseline 2:** TF-IDF + Support Vector Machine (Linear SVM)
3. **Proposed:** Multitask Shared Representation Architecture
4. **Context Evaluation:** Single-post isolated vs Multi-turn trajectory

### 📊 Benchmark Results

| Model Architecture | Task 1 Emotion Accuracy | Task 1 Macro-F1 | Task 2 Depression Accuracy | Task 2 Macro-F1 | Context-Aware Gain |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **TF-IDF + Logistic Regression** | 64.2% | 0.582 | 71.5% | 0.694 | Baseline |
| **TF-IDF + Linear SVM** | 67.8% | 0.621 | 75.2% | 0.741 | Baseline |
| **Multitask Shared Architecture (Proposed)** | **78.4%** | **0.725** | **88.9%** | **0.888** | **+14.2% trajectory accuracy** |

*Evaluation conducted using strict user-stratified train/test splits with zero cross-user data leakage.*

---

## 📁 Repository Structure

```text
Cognivibe-AI/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST endpoints (auth, analysis, dashboard, reports, extension, users)
│   │   ├── core/                # JWT and PBKDF2 cryptography security
│   │   ├── database/            # SQLite / PostgreSQL session and models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── services/            # PDF and HTML report generation
│   │   └── main.py              # FastAPI application
│   ├── server.py                # Dual runner (FastAPI / Multi-threaded HTTP)
│   ├── requirements.txt         # Python package requirements
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Footer
│   │   ├── pages/               # Landing, Login, Register, Dashboard, Analysis, History, Reports, Settings
│   │   ├── context/             # AuthContext
│   │   ├── services/            # API client
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
│
├── browser-extension/
│   ├── manifest.json            # Manifest V3 specification
│   ├── popup/                   # Extension popup interface (HTML/CSS/JS)
│   ├── background/              # Background service worker & context menus
│   ├── content/                 # On-page text selection & floating result modal
│   └── adapters/                # Reddit, Twitter/X, Instagram, YouTube adapters
│
├── ml_engine/
│   ├── preprocessing/           # Hinglish normalizer, slang lexicon, emoji processor
│   ├── models/                  # Multitask architecture & context aggregator
│   ├── data/processed/          # Code-mixed benchmark dataset (210 annotated samples)
│   ├── training/                # Model training & benchmarking pipeline
│   ├── saved_models/            # Trained weights & vocabulary centroids
│   └── inference/               # Production predictor with uncertainty & safety checks
│
├── database/
│   ├── schema.sql               # Relational DDL schema
│   └── seed_data.py             # Demo data generator
│
├── tests/
│   └── test_backend_api.py      # Automated integration test suite
│
├── docs/
│   ├── ARCHITECTURE.md          # Architectural blueprints & KaTeX formulations
│   ├── VIVA_QA_GUIDE.md         # Final-year viva question & answer preparation
│   └── PROJECT_REPORT_OUTLINE.md# Project report & presentation slide outline
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛡️ Ethical, Legal & Clinical Safeguards

1. **Strictly Non-Diagnostic:** The system explicitly does not diagnose psychiatric conditions or prescribe medical treatments.
2. **Normalized Uncertainty:** Ambiguous posts with entropy $> 0.82$ are labeled *"Inconclusive / Uncertain"* to prevent false overconfidence.
3. **Immediate Crisis Helplines:** Any expression containing self-harm or suicidal triggers immediately surfaces the official 24x7 government helplines:
   - **Tele-MANAS:** `14416` / `1800-891-4416`
   - **KIRAN:** `1800-599-0019`
   - **Vandrevala Foundation:** `+91 9999 666 555`
4. **GDPR Right to Erasure:** Users can purge their analysis records or delete their account permanently at any time from the Settings tab.

