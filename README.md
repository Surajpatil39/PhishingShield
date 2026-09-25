[README (1).md](https://github.com/user-attachments/files/32667845/README.1.md)
<div align="center">

# 🛡️ PhishingShield

### AI-Powered Real-Time Phishing URL Detection Chrome Extension

PhishingShield is a privacy-focused Chrome extension that combines heuristic URL analysis with a TensorFlow.js deep learning model to identify suspicious and phishing URLs directly inside the browser.

[![Platform](https://img.shields.io/badge/Platform-Google%20Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Deep Learning](https://img.shields.io/badge/Deep%20Learning-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Deployment](https://img.shields.io/badge/Deployment-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

</div>

---

## 📌 Overview

Phishing attacks use deceptive websites and misleading links to steal passwords, OTPs, banking details, and personal information. PhishingShield provides a practical browser-based defense by automatically analyzing URLs while the user browses.

The extension uses a hybrid detection approach:

- Heuristic URL analysis for fast identification of suspicious patterns.
- A trained Dense Neural Network for phishing-probability prediction.
- TensorFlow.js for local, in-browser model inference.
- Color-coded badges and warning screens for clear user feedback.

Because analysis is performed locally, the project does not require a cloud API or remote prediction server for its core functionality.

> **Project status:** Academic deep-learning project and functional Chrome extension prototype.

---

## ✨ Key Features

- 🔍 Real-time scanning of URLs in active and updated browser tabs.
- 🧠 Deep-learning prediction using a TensorFlow.js neural network.
- ⚡ Hybrid risk analysis using heuristics and model probability.
- 🎯 Risk percentage for every analyzed URL.
- 🟢🟡🔴 Color-coded browser badge for different risk levels.
- 🚨 Warning page for URLs that cross the critical-risk threshold.
- ✍️ Manual URL scanner for checking links before opening them.
- 📊 Scan history and phishing statistics stored locally.
- 🔒 Privacy-focused client-side processing.
- 🌐 Offline-friendly inference after the extension and model are loaded.

---

## 🧩 How PhishingShield Works

```text
User opens or visits a website
            │
            ▼
Chrome extension detects the current tab URL
            │
            ▼
URL feature extraction
(length, dots, hyphens, special characters, IP usage, etc.)
            │
            ├──────────────────────────────┐
            ▼                              ▼
Heuristic URL analysis              TensorFlow.js model
(rule-based indicators)              (deep learning prediction)
            │                              │
            └──────────────┬───────────────┘
                           ▼
                  Final risk calculation
                           │
                           ▼
       Badge update, popup result, or warning page
```

The system extracts numerical features from a URL and sends them to the trained neural network. The model predicts phishing probability. The extension combines that prediction with heuristic indicators and displays the final risk level to the user.

---

## 🧠 Deep Learning Model

PhishingShield uses a **Feedforward Dense Neural Network** for binary URL classification.

- **Input:** Engineered numerical URL features.
- **Output:** Phishing probability between 0 and 1.
- **Class 0:** Legitimate URL.
- **Class 1:** Phishing URL.
- **Hidden activation:** ReLU.
- **Output activation:** Sigmoid.
- **Optimizer:** Adam.
- **Browser runtime:** TensorFlow.js.

The model is trained using Python and TensorFlow/Keras, exported to TensorFlow.js format, and then packaged with the Chrome extension. The exported model normally consists of `model.json` and one or more binary weight-shard files.

### Why a Dense Neural Network?

The model receives structured numerical URL features rather than images or long natural-language sequences. A Dense Neural Network is therefore lightweight, fast, and suitable for real-time browser inference.

For example, a URL containing excessive hyphens, many subdomains, suspicious keywords, an IP address, and an unusually long path may receive a higher phishing probability.

---

## 🏗️ System Architecture

| Layer | Main Components | Responsibility |
|---|---|---|
| User Interface | `popup.html`, `popup.js`, `style.css` | Displays live results, manual scanning, history, and statistics |
| Detection Engine | `background.js` | Monitors tabs, analyzes URLs, manages storage, and updates badges |
| Warning Interface | `warning.html`, `warning.js`, `warning.css` | Warns users before continuing to a highly suspicious website |
| AI Model | `model.json`, `.bin` weight files | Performs in-browser phishing prediction |
| Local Storage | Chrome Storage API | Stores scan results, history, counters, and extension state |

---

## 📂 Suggested Project Structure

```text
PhishingShield/
│
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Background service worker and automatic scanning
│
├── popup.html                 # Main extension popup
├── popup.js                   # Popup logic and manual URL scanning
├── style.css                  # Popup styling
│
├── warning.html               # Critical-risk warning page
├── warning.js                 # Warning-page behavior
├── warning.css                # Warning-page styling
│
├── model/
│   ├── model.json             # TensorFlow.js model architecture and metadata
│   └── *.bin                  # Trained neural-network weights
│
├── icons/                     # Extension icons
├── assets/                    # Screenshots and diagrams
└── README.md                  # Project documentation
```

> File names may differ slightly in your repository. Update this structure to match the files that you actually upload.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Programming languages | Python, JavaScript |
| Deep learning | TensorFlow, Keras |
| Browser model deployment | TensorFlow.js |
| Frontend | HTML, CSS, JavaScript |
| Browser platform | Google Chrome Extension, Manifest V3 |
| Data processing | Pandas, NumPy, Scikit-learn |
| Model training | Google Colab / Jupyter Notebook |
| Storage | Chrome Storage API |
| Development tools | Google Colab, Visual Studio Code |

---

## 🚀 Installation and Setup

### Prerequisites

- Google Chrome or another Chromium-based browser.
- A cloned or downloaded copy of this repository.
- The exported TensorFlow.js model files included in the project.

### Install the extension locally

1. Clone the repository:

   ```bash
   git clone https://github.com/Surajpatil39/PhishingShield.git
   ```

2. Open Chrome and visit:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode**.

4. Select **Load unpacked**.

5. Choose the PhishingShield project folder.

6. Pin the extension from the Chrome Extensions menu.

7. Open a website or click the extension icon to view its risk assessment.

> If your repository has a different name, replace `PhishingShield` in the clone command with the exact repository name shown on GitHub.

---

## 🎨 Risk Levels

| Risk range | Status | Meaning |
|---|---|---|
| 0%–24% | 🟢 Safe | Few suspicious indicators were detected. |
| 25%–49% | 🟡 Suspicious | Some unusual or potentially risky patterns were detected. |
| 50% and above | 🔴 High risk | Strong phishing-like characteristics were detected. |
| Critical threshold | 🚨 Warning | The extension displays a warning before the user continues. |

> Risk scores are predictions, not absolute guarantees. Users should avoid entering passwords, OTPs, banking details, or personal information on suspicious websites.

---

## 📸 Screenshots

Add screenshots from the project report or your working extension inside an `assets` folder in the repository.

Recommended files:

```text
assets/
├── popup-screenshot.png
├── warning-page.png
├── safe-result.png
├── suspicious-result.png
└── system-architecture.png
```

Then display them in this section:

### Extension Popup

![PhishingShield popup](assets/popup-screenshot.png)

### Warning Page

![PhishingShield warning page](assets/warning-page.png)

### Risk Analysis Result

![PhishingShield risk result](assets/suspicious-result.png)

> Replace these filenames with the actual screenshot names you upload. Do not keep broken image paths in the final README.

---

## 🔐 Privacy and Security

PhishingShield is designed with a client-side privacy model:

- URL analysis is performed inside the browser.
- The TensorFlow.js model runs locally after it is loaded.
- The core prediction process does not require sending URLs to a remote server.
- Scan history and counters are stored using Chrome local storage.
- The warning page gives the user an opportunity to stop before visiting a high-risk destination.

This project is an academic security prototype and should not be treated as a complete replacement for browser security systems, domain reputation services, or user awareness.

---

## ⚠️ Limitations

- The system mainly analyzes URL-based characteristics and may not detect every malicious webpage.
- A legitimate-looking URL may still host harmful or compromised content.
- Newly developed phishing techniques may require new training data and model retraining.
- Detection performance depends on feature quality, dataset quality, and threshold calibration.
- A risk percentage should be interpreted as a model estimate, not a guaranteed verdict.

---

## 🔮 Future Enhancements

- Add domain reputation and blacklist APIs as optional secondary signals.
- Detect suspicious webpage content, login forms, and password fields.
- Use NLP to inspect webpage text and brand impersonation.
- Add CNN-based screenshot analysis.
- Add LSTM or Transformer-based URL-sequence analysis.
- Improve explainability by showing which URL features affected the result.
- Add user reporting and community feedback.
- Support Firefox, Microsoft Edge, and mobile browsers.
- Continuously update datasets and retrain the model.
- Publish a production-ready version to the Chrome Web Store.

---

## 👥 Project Team

| Name | Role |
|---|---|
| Suraj Patil | Project contributor |
| Pranav Raikar | Project contributor |
| Kiran Satote | Project contributor |
| Akshwaj Rao | Project contributor |
| Priyanshu Paul | Project contributor |

**Programme:** Computer Science and Engineering  
**Course:** Deep Learning Lab  
**Academic Year:** 2025–26

---

## 📚 References

The project report reviewed research on phishing URL detection, machine learning, feature selection, deep learning, and browser-based security systems. Add the exact papers, URLs, and publication details that your team used in the final report.

Recommended documentation:

- [TensorFlow Documentation](https://www.tensorflow.org/)
- [TensorFlow.js Documentation](https://www.tensorflow.org/js)
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/develop/migrate/)
- [Pandas Documentation](https://pandas.pydata.org/docs/)
- [Scikit-learn Documentation](https://scikit-learn.org/stable/)

---

## 👨‍💻 Author

**Suraj Patil**

- GitHub: [@Surajpatil39](https://github.com/Surajpatil39)
- Repository: [PhishingShield](https://github.com/Surajpatil39/PhishingShield)

---

<div align="center">

### 🛡️ Browse Smarter. Detect Threats Earlier. Stay Protected.

If you found this project useful, consider giving the repository a ⭐.

</div>
