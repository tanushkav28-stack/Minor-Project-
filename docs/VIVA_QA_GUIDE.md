# Cognivibe AI (MannSetu AI) - Final Year B.Tech Viva Preparation Guide

This guide prepares you for common and challenging technical questions asked by external examiners, project coordinators, and industry evaluators.

---

### Q1: Why did you choose code-mixed Hindi-English (Hinglish) instead of standard English?
**Answer:**
Over 60% of social media interactions among Indian youth occur in Romanized Hinglish (e.g., *"Mujhe bhot akelapan feel hota h, future bilkul dark lagta hai"*). Standard English sentiment analysis models (e.g., VADER, standard BERT) fail completely because:
1. Hindi words written in Roman alphabet are treated as out-of-vocabulary (OOV) tokens.
2. Informal phonetic variations (*bhot*, *bohot*, *bht*) break standard dictionary lookups.
3. Code-mixing itself carries psychological nuance and emotional intensity that pure translation erases.

---

### Q2: What is Multitask Learning (MTL) and why is it superior to training two separate models?
**Answer:**
Multitask learning trains a single shared encoder to optimize two related objectives:
1. Emotion Classification (Sadness, Anger, Joy, Fear, Neutral, Anxiety, Disgust)
2. Depression-Related Language Classification (Hopelessness, Loneliness, Exhaustion, Worthlessness, Anhedonia)

**Advantages:**
- **Shared Representation:** Features learned for identifying *"Sadness"* reinforce signals for *"Loneliness"* or *"Hopelessness"*.
- **Parameter Efficiency & Lower Latency:** A single shared encoder processes the text once, rather than running two separate models on every browser request.
- **Regularization:** Joint training prevents overfitting to idiosyncratic noise in a single task dataset.

---

### Q3: How does your system prevent false positives from temporary bad days?
**Answer:**
Through the **Context-Aware Sequential Aggregator**. If a user says *"India lost the match, so sad"*, an isolated model might flag *"Sadness"*. However, Cognivibe tracks the user's historical trajectory over multiple turns:
- If positive/neutral utterances dominate previous history (persistence ratio $\le 0.33$), the system marks it as **"Isolated Situational Sadness"**.
- It only flags chronic risk when negative language markers (*hopelessness*, *worthlessness*, *anhedonia*) persist across $\ge 55\%$ of consecutive posts over time.

---

### Q4: How is Model Uncertainty calculated?
**Answer:**
We use **Normalized Shannon Entropy**:
$$H_{\text{norm}}(P) = -\frac{\sum_{i=1}^N p_i \log_2(p_i)}{\log_2(N)}$$
If the model assigns nearly equal probability to multiple classes (e.g., Joy: 25%, Neutral: 28%, Sadness: 24%), the entropy score approaches 1.0. When entropy exceeds 0.82 or top confidence is under 35%, Cognivibe flags the prediction as **"Inconclusive / Uncertain"** rather than giving false diagnostic certainty.

---

### Q5: How does the Browser Extension work without violating user privacy?
**Answer:**
1. **User Authorization:** The extension only analyzes content explicitly selected by the user or visible posts on supported social networks when the user clicks *"Analyze Post"*.
2. **Zero Passive Surveillance:** The extension does not log keystrokes, does not read private direct messages (DMs), and does not record background web traffic.
3. **Data Retention Controls:** Users can choose 7-day, 30-day, or Zero-Retention modes in their dashboard settings, with instant one-click account and data erasure.

---

### Q6: What are the ethical safeguards for self-harm and crisis situations?
**Answer:**
1. **Non-Diagnostic Disclaimer:** The UI prominently states that Cognivibe AI is an assistive research screening tool, not a clinical diagnostic instrument.
2. **Crisis Triggers:** Explicit self-harm or suicidal expressions bypass automated scores and immediately trigger a high-visibility Crisis Resource Card displaying verified 24x7 confidential helplines:
   - **Tele-MANAS:** 14416 / 1800-891-4416 (Govt of India, Toll-Free)
   - **KIRAN Helpline:** 1800-599-0019
   - **Vandrevala Foundation:** +91 9999 666 555

