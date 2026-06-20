let currentTabId = null;
let currentTabUrl = "";
let pollTimer = null;
let manualMode = false;
let manualResult = null;

document.addEventListener("DOMContentLoaded", async () => {
  bindEvents();
  await refreshAll(true);
});

function bindEvents() {
  document.getElementById("useCurrentBtn").addEventListener("click", useCurrentTab);
  document.getElementById("scanBtn").addEventListener("click", manualScan);
  document.getElementById("clearHistoryBtn").addEventListener("click", clearHistory);

  chrome.runtime.onMessage.addListener(async (message) => {
    if (message?.type !== "TAB_RESULT_UPDATED") return;

    const active = await getActiveTabInfo();
    if (!active?.id || active.id !== message.tabId) return;

    currentTabId = active.id;
    currentTabUrl = active.url || "";

    if (!manualMode && message.result) {
      renderLiveResult(message.result);
      setStatus("Auto monitoring", getSeverity(message.result.risk));
    }

    if (!message.result) {
      renderLiveEmptyState("This tab cannot be scanned automatically.");
      setStatus("Unsupported tab", "neutral");
    }

    refreshStats();
    refreshHistory();
  });

  chrome.tabs.onActivated.addListener(async () => {
    manualMode = false;
    manualResult = null;
    await refreshAll(true);
  });

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.active) return;

    if (changeInfo.url) {
      currentTabUrl = changeInfo.url;
      manualMode = false;
      manualResult = null;
      await refreshAll(true);
      return;
    }

    if (changeInfo.status === "complete" && !manualMode) {
      await refreshCurrentResult();
    }
  });
}

async function refreshAll(resetManual) {
  const active = await getActiveTabInfo();
  if (!active?.id) return;

  currentTabId = active.id;
  currentTabUrl = active.url || "";

  if (resetManual) {
    manualMode = false;
    manualResult = null;
  }

  if (manualMode && manualResult) {
    renderManualResult(manualResult);
  } else {
    resetManualCard();
  }

  await refreshCurrentResult();
  await refreshStats();
  await refreshHistory();

  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    const activeNow = await getActiveTabInfo();
    if (!activeNow?.id) return;

    if (activeNow.id !== currentTabId || (activeNow.url || "") !== currentTabUrl) {
      currentTabId = activeNow.id;
      currentTabUrl = activeNow.url || "";
      manualMode = false;
      manualResult = null;
      resetManualCard();
      await refreshCurrentResult();
      await refreshStats();
      await refreshHistory();
      return;
    }

    if (!manualMode) {
      await refreshCurrentResult();
    }
  }, 900);
}

async function getActiveTabInfo() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function refreshCurrentResult() {
  const response = await chrome.runtime.sendMessage({ type: "GET_ACTIVE_TAB_RESULT" });
  if (!response?.ok) return;

  currentTabId = response.tabId ?? currentTabId;
  currentTabUrl = response.tabUrl || currentTabUrl;

  if (response.result) {
    renderLiveResult(response.result);
    setStatus("Auto monitoring", getSeverity(response.result.risk));
  } else {
    renderLiveEmptyState("This tab cannot be scanned automatically.");
    setStatus("Unsupported tab", "neutral");
  }
}

async function refreshStats() {
  const response = await chrome.runtime.sendMessage({ type: "GET_STATS" });
  const stats = response?.stats || {};
  document.getElementById("totalScans").textContent = stats.totalScans || 0;
  document.getElementById("riskyScans").textContent = stats.riskyScans || 0;
  document.getElementById("aiScans").textContent = stats.aiScans || 0;
}

async function refreshHistory() {
  const response = await chrome.runtime.sendMessage({ type: "GET_HISTORY" });
  const history = response?.history || [];
  const list = document.getElementById("historyList");

  if (!history.length) {
    list.innerHTML = `<div class="history-item"><strong>No history yet.</strong><div>Scanned links will appear here.</div></div>`;
    return;
  }

  list.innerHTML = history.slice(0, 8).map(item => `
    <div class="history-item">
      <strong>${escapeHtml(item.domain || item.url || "Unknown")}</strong>
      <div>${escapeHtml(item.verdict)} • ${item.risk}% risk</div>
      <div>${escapeHtml(item.checkedAt || "")}</div>
    </div>
  `).join("");
}

async function useCurrentTab() {
  const active = await getActiveTabInfo();
  if (!active?.url) return;
  document.getElementById("urlInput").value = active.url;
}

async function manualScan() {
  const input = document.getElementById("urlInput").value.trim();
  if (!input) return;

  const response = await chrome.runtime.sendMessage({
    type: "MANUAL_SCAN",
    url: input
  });

  if (!response?.ok || !response.result) return;

  manualMode = true;
  manualResult = response.result;
  renderManualResult(response.result);
  await refreshStats();
  await refreshHistory();
}

async function clearHistory() {
  await chrome.runtime.sendMessage({ type: "CLEAR_HISTORY" });
  await refreshHistory();
  await refreshStats();
}

function resetManualCard() {
  document.getElementById("riskScore").textContent = "0%";
  document.getElementById("resultBadge").className = "badge neutral";
  document.getElementById("resultBadge").textContent = "Waiting";
  document.getElementById("resultTitle").textContent = "Ready to scan";
  document.getElementById("checkedUrl").textContent = "Paste a link and press Scan Now.";
  document.getElementById("domainBox").textContent = "Domain: —";
  document.getElementById("riskLevelText").textContent = "Low";
  document.getElementById("riskLevelText").className = "reason-level neutral-text";
  document.getElementById("reasonsList").innerHTML = "<li>No scan performed yet.</li>";
  setRing("scoreRing", 0, "#3b82f6");
}

function renderManualResult(result) {
  const severity = getSeverity(result.risk);
  document.getElementById("riskScore").textContent = `${result.risk}%`;
  document.getElementById("resultBadge").className = `badge ${badgeClass(severity)}`;
  document.getElementById("resultBadge").textContent = result.verdict;
  document.getElementById("resultTitle").textContent = getHeadline(result);
  document.getElementById("checkedUrl").textContent = result.url;
  document.getElementById("domainBox").textContent = `Domain: ${result.domain || "Unknown"}`;
  document.getElementById("riskLevelText").textContent = result.verdict;
  document.getElementById("riskLevelText").className = `reason-level ${textClass(severity)}`;
  document.getElementById("reasonsList").innerHTML = (result.reasons || [])
    .map(reason => `<li>${escapeHtml(reason)}</li>`)
    .join("");
  setRing("scoreRing", result.risk, ringColor(severity));
}

function renderLiveResult(result) {
  const severity = getSeverity(result.risk);
  const reasons = (result.reasons || [])
    .slice(0, 3)
    .map(reason => `<li>${escapeHtml(reason)}</li>`)
    .join("");

  document.getElementById("liveResult").innerHTML = `
    <div class="live-score-layout section-gap">
      <div id="liveScoreRing" class="score-ring">
        <div class="score-inner">
          <span>${result.risk}%</span>
          <small>Risk</small>
        </div>
      </div>
      <div class="score-copy">
        <div class="badge ${badgeClass(severity)}">${escapeHtml(result.verdict)}</div>
        <h3 class="section-gap">${escapeHtml(result.domain || "Unknown Domain")}</h3>
        <p class="subtext">${escapeHtml(result.url)}</p>
      </div>
    </div>
    <ul class="reasons section-gap">
      ${reasons || "<li>No major phishing indicators found in the URL.</li>"}
    </ul>
  `;

  setRing("liveScoreRing", result.risk, ringColor(severity));
}

function renderLiveEmptyState(message) {
  document.getElementById("liveResult").innerHTML = `
    <div class="domain-box section-gap">${escapeHtml(message)}</div>
  `;
}

function setStatus(text, severity) {
  const pill = document.getElementById("statusPill");
  pill.textContent = text;
  pill.className = `pill ${badgeClass(severity)}`;
}

function getSeverity(risk) {
  if (risk >= 50) return "risk";
  if (risk >= 25) return "warn";
  if (risk >= 10) return "caution";
  return "safe";
}

function badgeClass(severity) {
  if (severity === "risk") return "risk";
  if (severity === "warn") return "warn";
  if (severity === "caution") return "neutral";
  return "safe";
}

function textClass(severity) {
  if (severity === "risk") return "risk-text";
  if (severity === "warn") return "warn-text";
  if (severity === "caution") return "neutral-text";
  return "safe-text";
}

function ringColor(severity) {
  if (severity === "risk") return "#ef4444";
  if (severity === "warn") return "#f59e0b";
  if (severity === "caution") return "#3b82f6";
  return "#22c55e";
}

function setRing(id, risk, color) {
  const ring = document.getElementById(id);
  if (!ring) return;
  const deg = Math.max(0, Math.min(100, risk)) * 3.6;
  ring.style.background = `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.08) ${deg}deg)`;
}

function getHeadline(result) {
  if (result.risk >= 50) return "High chance of phishing";
  if (result.risk >= 25) return "This link looks suspicious";
  if (result.risk >= 10) return "Use caution before opening";
  return "Looks mostly safe";
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}