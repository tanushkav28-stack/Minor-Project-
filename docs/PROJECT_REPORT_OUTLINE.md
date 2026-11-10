# Cognivibe AI (MannSetu AI) - Final Project Report & PPT Outline
### Major Project Academic Submission Guide

---

## 1. Project Report Chapters Structure

### Chapter 1: Introduction
- 1.1 Background & Motivation (Mental health expression trends in Indian youth)
- 1.2 Problem Statement (Limitations of monolingual English NLP models on Romanized Hinglish)
- 1.3 Objectives & Scope
- 1.4 Ethical & Regulatory Boundaries (Non-diagnostic screening tool)

### Chapter 2: Literature Review
- 2.1 Sentiment Analysis in Low-Resource & Code-Mixed Languages
- 2.2 Mental Health Detection in Social Media Texts
- 2.3 Multitask Learning Architectures in NLP
- 2.4 Research Gaps Identified

### Chapter 3: System Methodology & Architecture
- 3.1 Overall System Architecture (Browser Extension + FastAPI + Multitask Engine + React Dashboard)
- 3.2 Preprocessing Pipeline for Code-Mixed Hinglish:
  - Slang & phonetic standardization
  - Subword character n-gram modeling
  - Emoji emotional context retention
- 3.3 Multitask Model Architecture (Shared Representation Encoder + 2 Task Heads)
- 3.4 Uncertainty Calibration via Shannon Entropy
- 3.5 Context-Aware Sequential Aggregation

### Chapter 4: Experimental Setup & Results
- 4.1 Dataset Composition & Stratified Split
- 4.2 Baseline Models (TF-IDF + Logistic Regression, TF-IDF + SVM)
- 4.3 Proposed Model Evaluation (Accuracy, Precision, Recall, Macro-F1, Confusion Matrix)
- 4.4 Context-Aware vs Isolated Single-Post Comparison Results
- 4.5 Error Analysis & Limitations

### Chapter 5: Full-Stack Implementation
- 5.1 Chrome/Edge Manifest V3 Browser Extension Design & Platform Adapters
- 5.2 FastAPI REST Backend Architecture
- 5.3 PostgreSQL / Relational Database Schema Design
- 5.4 React Web Dashboard & Analytics Visualizations
- 5.5 PDF Report Generation Service

### Chapter 6: Conclusion & Future Scope
- 6.1 Summary of Contributions
- 6.2 Limitations
- 6.3 Future Directions (Acoustic multimodal signals, regional scripts)

---

## 2. Final Year Project Presentation (PPT) Slide Outline

- **Slide 1:** Title, Project Name (*Cognivibe AI / MannSetu AI*), Team Members & Supervisor.
- **Slide 2:** Motivation & Problem Statement (Hinglish expressions and OOV failure in standard models).
- **Slide 3:** Proposed Solution (Full-Stack Browser Extension + Multitask NLP Engine).
- **Slide 4:** System Architecture Diagram.
- **Slide 5:** Code-Mixed Preprocessing & Slang Normalization.
- **Slide 6:** Multitask Learning Formulation ($\mathcal{L}_{\text{total}} = \lambda_1 \mathcal{L}_{\text{emo}} + \lambda_2 \mathcal{L}_{\text{dep}}$).
- **Slide 7:** Context-Aware Sequential Trajectory Analysis.
- **Slide 8:** Experimental Benchmark Results & Comparison Table.
- **Slide 9:** Chrome Extension Demo Screenshots (Reddit, Twitter, Instagram).
- **Slide 10:** Web Dashboard & Analytics Screenshots.
- **Slide 11:** Privacy, Ethical Safeguards & Crisis Intervention.
- **Slide 12:** Conclusion & Future Scope.

