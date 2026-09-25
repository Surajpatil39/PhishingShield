[PHISHING README FILE.md](https://github.com/user-attachments/files/32668014/PHISHING.README.FILE.md)
<div align="center">

# 🛡️ PhishingShield

### Real-time phishing URL detection inside Chrome

PhishingShield is a Chrome extension that checks whether a URL looks suspicious while you browse. It uses a mix of simple URL checks and a small deep-learning model that runs directly in the browser with TensorFlow.js.

[![Platform](https://img.shields.io/badge/Platform-Google%20Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Deep Learning](https://img.shields.io/badge/Deep%20Learning-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Deployment](https://img.shields.io/badge/Deployment-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)

</div>

---

## What this does

Phishing sites try to steal passwords, OTPs, and card details by looking like real websites. PhishingShield tries to catch them early by:

- Watching the current tab URL.
- Extracting simple features from the URL (length, dots, hyphens, suspicious words, IP usage, etc.).
- Running a trained neural network to estimate phishing probability.
- Showing a risk percentage and a colored badge.
- Opening a warning page if the risk is very high.

All of this happens inside Chrome. The model runs locally using TensorFlow.js, so URLs are not sent to an external server for prediction.

---

## Features

- Real-time URL scanning when a tab opens or updates.
- Manual URL scanner in the popup.
- Risk percentage for each URL.
- Color-coded badge:
  - 🟢 Low risk
  - 🟡 Medium risk
  - 🔴 High risk
- Warning page for critical-risk URLs.
- Scan history and basic stats stored locally.
- Works offline after the extension and model are loaded.

---

## How it works (in simple terms)

1. You visit a website.
2. The extension reads the URL.
3. It converts the URL into numbers (features).
4. These numbers go into the trained neural network.
5. The model outputs a phishing probability.
6. The extension combines this with simple rule checks and shows a final risk score.
7. If the risk is high, it shows a warning before you continue.

---

## Model details

- Type: Feedforward Dense Neural Network.
- Task: Binary classification (legitimate vs phishing URL).
- Input: Around 87 numeric URL features.
- Hidden layers: Dense + ReLU.
- Output: Sigmoid (probability of phishing).
- Optimizer: Adam.
- Training: Python + TensorFlow/Keras (in Google Colab).
- Deployment: Converted to TensorFlow.js (`model.json` + `.bin` weights) and bundled with the extension.

I chose a Dense network because the input is already a fixed-size numeric feature vector. It is fast enough to run in the browser without noticeable lag.

---

## System structure

- `manifest.json` – Chrome extension config (Manifest V3).
- `background.js` – Watches tabs, extracts features, runs model, updates badge and storage.
- `popup.html` / `popup.js` / `style.css` – Main UI: live result, manual scan, history, stats.
- `warning.html` / `warning.js` / `warning.css` – Full-page warning for critical-risk URLs.
- `model/` – TensorFlow.js model files (`model.json`, weight shards).
- Local storage – Chrome Storage API for history and counters.

---

## Tech stack

- Python, TensorFlow, Keras – model training.
- TensorFlow.js – in-browser inference.
- HTML, CSS, JavaScript – extension UI and logic.
- Google Colab – training environment.
- VS Code – extension development.

---

## How to run it

1. Clone or download this repo:

   ```bash
   git clone https://github.com/Surajpatil39/PhishingShield.git
   ```

2. Open Chrome and go to:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode**.
4. Click **Load unpacked** and select the project folder.
5. Pin the extension.
6. Open any website and click the extension icon to see the risk score.

---

## Risk levels

- **0–24%** – Safe / low risk.
- **25–49%** – Suspicious / medium risk.
- **50%+** – High risk.
- **Critical threshold** – Warning page is shown.

These numbers are based on how I tuned the heuristic scoring and model output during testing.

---

## Screenshots

### Popup UI

![Popup UI](assets/popup-ui.png)

### Warning page

![Warning page](assets/warning-page.png)

### System overview

![System overview](assets/system-overview.png)

### Use case diagram

![Use case diagram](assets/use-case-diagram.png)

### Sequence diagram

![Sequence diagram](assets/sequence-diagram.png)

> Put these images in an `assets` folder in your repo and match the filenames. You can export them from the project report or take fresh screenshots from the running extension.

---

## Privacy note

- The core prediction runs locally in the browser.
- No URLs are intentionally sent to an external server for classification.
- Scan results and history are stored using Chrome local storage.

This is an academic project and should not be treated as a complete replacement for browser security features or domain-reputation services.

---

## Limitations

- Mainly URL-based detection; page content is not deeply analyzed.
- May miss some advanced or very new phishing techniques.
- Risk score is a model estimate, not a guaranteed label.
- Performance depends on the quality of features and training data.

---

## Possible improvements

- Add page-content analysis (forms, brand names, text).
- Use sequence models (LSTM/Transformer) for URL patterns.
- Integrate domain reputation or blacklist APIs as an extra layer.
- Better explainability: show which features increased the risk.
- Support for other browsers and mobile.
- Regular dataset updates and retraining.

---

## References

- TensorFlow and TensorFlow.js documentation.
- Chrome Extensions (Manifest V3) documentation.
- Research papers on phishing URL detection using ML/DL (see project report for full list).

---

## Author

**Suraj Patil**  
GitHub: [@Surajpatil39](https://github.com/Surajpatil39)  
Repo: [PhishingShield](https://github.com/Surajpatil39/PhishingShield)

---

<div align="center">

If this helped you understand browser-based phishing detection, a ⭐ would be nice.

</div>
