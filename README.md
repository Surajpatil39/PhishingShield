<div align="center">

# 🛡️ PhishingShield

### AI-Powered Real-Time Phishing URL Detection Chrome Extension

PhishingShield is a privacy-focused Chrome extension that detects suspicious and phishing URLs in real time using a **hybrid approach of heuristic URL analysis and Deep Learning**.

[![Platform](https://img.shields.io/badge/Platform-Google%20Chrome-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://www.google.com/chrome/)
[![Deep Learning](https://img.shields.io/badge/Deep%20Learning-TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Deployment](https://img.shields.io/badge/Deployment-TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

</div>

---

## 📌 Overview

Phishing attacks use fake websites and misleading links to steal passwords, banking details, OTPs, and other sensitive information. Many users cannot easily identify whether a URL is genuine or malicious.

**PhishingShield** provides an intelligent, browser-based solution. It automatically examines URLs as users browse the web, assigns a phishing-risk score, displays a color-coded warning badge, and shows a warning page for highly suspicious websites.

The project runs fully inside the browser. URLs do not need to be sent to an external server, which improves both privacy and response time.

---

## ✨ Key Features

- 🔍 **Real-time URL scanning** when a tab is opened, updated, or activated
- 🧠 **Deep Learning prediction** using a TensorFlow.js neural network
- ⚡ **Hybrid risk analysis** combining model prediction with heuristic URL checks
- 🎯 **Risk percentage** that indicates how suspicious a URL appears
- 🟢🟡🔴 **Color-coded browser badge** for safe, suspicious, and high-risk URLs
- 🚨 **Warning page** for URLs that cross the critical-risk threshold
- ✍️ **Manual URL scanner** for checking any link before opening it
- 📊 **Scan history and statistics** stored locally in the browser
- 🔒 **Privacy-first design** — URL analysis happens locally without a cloud backend
- 🌐 **Offline-friendly inference** after the extension and model are loaded

---

## 🧩 How It Works

PhishingShield follows a hybrid client-side detection workflow:

```text
User Opens / Visits a Website
            │
            ▼
Chrome Extension Detects Current Tab URL
            │
            ▼
URL Feature Extraction
(length, dots, hyphens, special characters, IP usage, etc.)
            │
            ├──────────────────────────────┐
            ▼                              ▼
Heuristic URL Analysis              Deep Learning Model
(rule-based checks)                 (TensorFlow.js)
            │                              │
            └──────────────┬───────────────┘
                           ▼
                  Final Risk Calculation
                           │
                           ▼
       Badge Update + Popup Result + Warning Page
```

The system first extracts numerical URL features. These features are passed to the trained neural network, which predicts the probability that the URL is phishing. The result is combined with heuristic indicators to calculate the final risk percentage.

---

## 🧠 Deep Learning Model

The project uses a **Feedforward Dense Neural Network** for binary classification:

- **Input:** URL-related numerical features
- **Output:** Probability that a URL is phishing
- **Classes:**
  - `0` → Legitimate / Safe URL
  - `1` → Phishing / Malicious URL
- **Hidden activation:** ReLU
- **Output activation:** Sigmoid
- **Optimizer:** Adam
- **Deployment:** TensorFlow.js for in-browser prediction

### Why a Dense Neural Network?

A Dense Neural Network is suitable because the model receives structured numerical URL features rather than images or long text sequences. It can learn non-linear relationships between multiple URL properties efficiently while remaining lightweight enough for real-time Chrome extension use.

> Example: A URL containing excessive hyphens, many subdomains, suspicious keywords, an IP address, and an unusually long path may receive a higher phishing probability.

---

## 🏗️ System Architecture

PhishingShield consists of three main layers:

| Layer | Components | Responsibility |
|---|---|---|
| **User Interface** | `popup.html`, `popup.js`, `style.css` | Displays live risk details, manual scanner, history, and statistics |
| **Detection Engine** | `background.js` | Watches browser tabs, extracts features, performs risk analysis, and updates badges |
| **Warning Interface** | `warning.html`, `warning.js`, `warning.css` | Warns users before they continue to a highly suspicious website |
| **AI Model** | `model.json`, `.bin` weight files | Stores and runs the trained TensorFlow.js neural network |

---

## 📂 Project Structure

```text
PhishingShield/
│
├── manifest.json              # Chrome Extension Manifest V3 configuration
├── background.js              # Background service worker and automatic URL scanning
│
├── popup.html                 # Extension popup user interface
├── popup.js                   # Popup logic, manual scan, and result display
├── style.css                  # Popup styling
│
├── warning.html               # Critical-risk warning page
├── warning.js                 # Warning-page behavior
├── warning.css                # Warning-page styling
│
├── model/
│   ├── model.json             # TensorFlow.js model architecture and metadata
│   └── group1-shard1of1.bin  # Trained neural network weights
│
├── icons/                     # Extension icons
│
└── README.md                  # Project documentation
```

---

## 🛠️ Tech Stack

| Category | Technologies |
|---|---|
| **Programming Languages** | Python, JavaScript |
| **Deep Learning** | TensorFlow, Keras |
| **Browser Model Deployment** | TensorFlow.js |
| **Frontend** | HTML, CSS, JavaScript |
| **Browser Platform** | Google Chrome Extension, Manifest V3 |
| **Data Processing** | Pandas, NumPy, Scikit-learn |
| **Model Training** | Google Colab / Jupyter Notebook |
| **Development Environment** | Visual Studio Code |

---

## 🚀 Installation and Setup

### Prerequisites

- Google Chrome or a Chromium-based browser
- A copy of this repository
- Internet connection for the first load if TensorFlow.js is imported from a CDN

### Steps

1. Clone this repository:

   ```bash
   git clone https://github.com/YOUR-USERNAME/PhishingShield.git
   ```

2. Open Google Chrome and go to:

   ```text
   chrome://extensions/
   ```

3. Enable **Developer mode** from the top-right corner.

4. Click **Load unpacked**.

5. Select the downloaded `PhishingShield` project folder.

6. Pin the extension from the Chrome Extensions menu.

7. Browse a website or click the extension icon to view the current URL's risk assessment.

---

## 🎨 Risk Levels

| Risk Range | Status | Meaning |
|---|---|---|
| **0%–24%** | 🟢 Safe | The URL has few suspicious indicators |
| **25%–49%** | 🟡 Suspicious | The URL contains some unusual or risky patterns |
| **50% and above** | 🔴 High Risk | The URL has strong phishing-like characteristics |
| **Critical threshold** | 🚨 Warning Page | User is warned before continuing to a potentially dangerous page |

> **Important:** The risk score is an intelligent prediction, not an absolute guarantee. Users should avoid entering passwords, OTPs, banking details, or personal information on suspicious websites.

---

## 📸 Screenshots

Add screenshots of your extension here to make the repository more professional.

### Extension Popup

![PhishingShield Popup](assets/popup-screenshot.png)

### Phishing Warning Page

![PhishingShield Warning Page](assets/warning-screenshot.png)

> Create an `assets` folder and replace the above paths with your actual screenshot filenames.

---

## 🔐 Privacy and Security

PhishingShield is designed with privacy in mind:

- URL analysis is performed locally in the browser
- The trained model runs using TensorFlow.js
- No personal browsing data is intentionally sent to an external server
- Scan history is stored locally using Chrome storage
- Users remain in control of whether to leave or continue from a warning page

---

## ⚠️ Limitations

- The system primarily analyzes URL-based indicators and may not detect every phishing page.
- A legitimate-looking URL can still host harmful content if the website itself is compromised.
- New phishing techniques may require periodic dataset updates and model retraining.
- The extension should support—not replace—safe browsing habits and browser security protections.

---

## 🔮 Future Enhancements

- Add domain reputation and blacklist API integration
- Detect suspicious webpage content, forms, and login fields
- Use Natural Language Processing to inspect webpage text
- Add screenshot-based phishing detection using CNN models
- Add URL reputation history and user reporting
- Improve model accuracy using larger and more recent datasets
- Build a Firefox / Edge version
- Publish the extension to the Chrome Web Store
- Add an explainable-AI panel showing why a URL was marked risky

---

## 👨‍💻 Author

**Your Name**

- GitHub: [@YOUR-GITHUB-USERNAME](https://github.com/YOUR-GITHUB-USERNAME)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/YOUR-LINKEDIN-USERNAME/)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">

### 🛡️ Browse Smarter. Detect Threats Earlier. Stay Protected.

If you found this project useful, please consider giving it a ⭐ on GitHub.

</div>
