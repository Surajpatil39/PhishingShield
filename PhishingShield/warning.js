document.addEventListener("DOMContentLoaded", async () => {
  const title = document.getElementById("warningTitle");
  const riskValue = document.getElementById("riskValue");
  const verdictValue = document.getElementById("verdictValue");
  const urlValue = document.getElementById("urlValue");
  const reasonList = document.getElementById("reasonList");
  const continueBtn = document.getElementById("continueBtn");
  const goBackBtn = document.getElementById("goBackBtn");

  function setNoDataState() {
    title.textContent = "No warning data found";
    riskValue.textContent = "--%";
    verdictValue.textContent = "--";
    urlValue.textContent = "Original URL not available.";
    reasonList.innerHTML = "<li>No phishing analysis data was found for this blocked page.</li>";
  }

  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_CURRENT_WARNING"
    });

    const warning = response?.warning;
    const result = warning?.result;

    if (!result) {
      setNoDataState();
      return;
    }

    const risk = typeof result.risk === "number" ? result.risk : 0;
    const verdict = result.verdict || "Unknown";
    const originalUrl = warning.originalUrl || result.url || "URL unavailable";
    const reasons = Array.isArray(result.reasons) ? result.reasons : [];

    riskValue.textContent = `${risk}%`;
    verdictValue.textContent = verdict;
    urlValue.textContent = originalUrl;

    if (risk >= 75) {
      title.textContent = "Critical phishing risk detected";
    } else if (risk >= 55) {
      title.textContent = "Suspicious page detected";
    } else {
      title.textContent = "Caution: this page may be unsafe";
    }

    reasonList.innerHTML = "";

    if (reasons.length === 0) {
      const li = document.createElement("li");
      li.textContent = "The URL matched suspicious phishing-like patterns.";
      reasonList.appendChild(li);
    } else {
      reasons.forEach((reason) => {
        const li = document.createElement("li");
        li.textContent = reason;
        reasonList.appendChild(li);
      });
    }
  } catch (error) {
    console.error("Failed to load warning data:", error);
    setNoDataState();
  }

  continueBtn.addEventListener("click", async () => {
    continueBtn.disabled = true;
    continueBtn.textContent = "Opening...";
    try {
      await chrome.runtime.sendMessage({ type: "CONTINUE_TO_RISKY" });
      window.close();
    } catch (error) {
      console.error("Continue failed:", error);
      continueBtn.disabled = false;
      continueBtn.textContent = "Continue Anyway";
    }
  });

  goBackBtn.addEventListener("click", async () => {
    goBackBtn.disabled = true;
    goBackBtn.textContent = "Going back...";
    try {
      await chrome.runtime.sendMessage({ type: "GO_BACK_SAFE" });
      window.close();
    } catch (error) {
      console.error("Go back failed:", error);
      goBackBtn.disabled = false;
      goBackBtn.textContent = "Go Back to Safety";
    }
  });
});