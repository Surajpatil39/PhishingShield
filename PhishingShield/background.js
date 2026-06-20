const STORE_KEYS = {
  TAB_RESULTS: "tabResults",
  CURRENT_WARNING: "currentWarning",
  ALLOW_ONCE: "allowOnce",
  STATS: "stats",
  HISTORY: "history"
};

const THRESHOLDS = {
  CAUTION: 10,
  WARNING: 25,
  CRITICAL: 50
};

chrome.runtime.onInstalled.addListener(async () => {
  await initializeStorage();
});

chrome.runtime.onStartup?.addListener(async () => {
  await initializeStorage();
});

async function initializeStorage() {
  const data = await chrome.storage.local.get([
    STORE_KEYS.TAB_RESULTS,
    STORE_KEYS.CURRENT_WARNING,
    STORE_KEYS.ALLOW_ONCE,
    STORE_KEYS.STATS,
    STORE_KEYS.HISTORY
  ]);

  await chrome.storage.local.set({
    [STORE_KEYS.TAB_RESULTS]: data[STORE_KEYS.TAB_RESULTS] || {},
    [STORE_KEYS.CURRENT_WARNING]: data[STORE_KEYS.CURRENT_WARNING] || null,
    [STORE_KEYS.ALLOW_ONCE]: data[STORE_KEYS.ALLOW_ONCE] || {},
    [STORE_KEYS.STATS]: data[STORE_KEYS.STATS] || {
      totalScans: 0,
      riskyScans: 0,
      aiScans: 0
    },
    [STORE_KEYS.HISTORY]: data[STORE_KEYS.HISTORY] || []
  });
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    if (!changeInfo.url && changeInfo.status !== "complete") return;

    const url = changeInfo.url || tab?.url;

    if (!shouldAnalyzeUrl(url)) {
      await clearBadge(tabId);
      await removeTabResult(tabId);
      sendTabResult(tabId, null);
      return;
    }

    await autoScanTab(tabId, url, true);
  } catch (error) {
    console.error("Auto scan onUpdated failed:", error);
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab) return;

    const url = tab.url || "";

    if (!shouldAnalyzeUrl(url)) {
      await clearBadge(tabId);
      await removeTabResult(tabId);
      sendTabResult(tabId, null);
      return;
    }

    await autoScanTab(tabId, url, false);
  } catch (error) {
    console.error("Auto scan onActivated failed:", error);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  try {
    if (windowId === chrome.windows.WINDOW_ID_NONE) return;

    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (!tab?.id) return;

    if (!shouldAnalyzeUrl(tab.url || "")) {
      await clearBadge(tab.id);
      await removeTabResult(tab.id);
      sendTabResult(tab.id, null);
      return;
    }

    await autoScanTab(tab.id, tab.url, false);
  } catch (error) {
    console.error("Window focus scan failed:", error);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await removeTabResult(tabId);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "GET_TAB_RESULT") {
    chrome.storage.local.get([STORE_KEYS.TAB_RESULTS]).then((data) => {
      const tabResults = data[STORE_KEYS.TAB_RESULTS] || {};
      sendResponse({
        ok: true,
        result: tabResults[message.tabId] || null
      });
    }).catch(() => {
      sendResponse({ ok: false, result: null });
    });
    return true;
  }

  if (message?.type === "GET_ACTIVE_TAB_RESULT") {
    chrome.tabs.query({ active: true, currentWindow: true }).then(async ([tab]) => {
      if (!tab?.id) {
        sendResponse({ ok: false, result: null });
        return;
      }

      const url = tab.url || "";

      if (!shouldAnalyzeUrl(url)) {
        await clearBadge(tab.id);
        await removeTabResult(tab.id);
        sendResponse({
          ok: true,
          tabId: tab.id,
          tabUrl: url,
          result: null
        });
        return;
      }

      const data = await chrome.storage.local.get([STORE_KEYS.TAB_RESULTS]);
      const tabResults = data[STORE_KEYS.TAB_RESULTS] || {};
      let result = tabResults[tab.id] || null;

      if (!result || result.url !== url) {
        result = analyzeUrl(url);
        tabResults[tab.id] = result;
        await chrome.storage.local.set({ [STORE_KEYS.TAB_RESULTS]: tabResults });
        await updateBadge(tab.id, result);
      }

      sendResponse({
        ok: true,
        tabId: tab.id,
        tabUrl: url,
        result
      });
    }).catch((error) => {
      console.error("GET_ACTIVE_TAB_RESULT failed:", error);
      sendResponse({ ok: false, result: null });
    });

    return true;
  }

  if (message?.type === "MANUAL_SCAN") {
    try {
      const normalized = normalizeBrowserInput(message.url);
      const result = analyzeUrl(normalized.analyzableUrl);

      chrome.storage.local.get([
        STORE_KEYS.STATS,
        STORE_KEYS.HISTORY
      ]).then(async (data) => {
        await updateStatsAndHistory(result, data);
        sendResponse({
          ok: true,
          result,
          normalizedInput: normalized.displayUrl
        });
      }).catch((error) => {
        console.error("MANUAL_SCAN storage error:", error);
        sendResponse({ ok: false, result: null });
      });
    } catch (error) {
      console.error("MANUAL_SCAN failed:", error);
      sendResponse({ ok: false, result: null });
    }

    return true;
  }

  if (message?.type === "GET_STATS") {
    chrome.storage.local.get([STORE_KEYS.STATS]).then((data) => {
      sendResponse({
        ok: true,
        stats: data[STORE_KEYS.STATS] || {
          totalScans: 0,
          riskyScans: 0,
          aiScans: 0
        }
      });
    }).catch(() => {
      sendResponse({
        ok: true,
        stats: {
          totalScans: 0,
          riskyScans: 0,
          aiScans: 0
        }
      });
    });
    return true;
  }

  if (message?.type === "GET_HISTORY") {
    chrome.storage.local.get([STORE_KEYS.HISTORY]).then((data) => {
      sendResponse({
        ok: true,
        history: data[STORE_KEYS.HISTORY] || []
      });
    }).catch(() => {
      sendResponse({ ok: true, history: [] });
    });
    return true;
  }

  if (message?.type === "CLEAR_HISTORY") {
    chrome.storage.local.set({ [STORE_KEYS.HISTORY]: [] }).then(() => {
      sendResponse({ ok: true });
    }).catch(() => {
      sendResponse({ ok: false });
    });
    return true;
  }

  if (message?.type === "GET_CURRENT_WARNING") {
    chrome.storage.local.get([STORE_KEYS.CURRENT_WARNING]).then((data) => {
      sendResponse({
        ok: true,
        warning: data[STORE_KEYS.CURRENT_WARNING] || null
      });
    }).catch(() => {
      sendResponse({ ok: true, warning: null });
    });
    return true;
  }

  if (message?.type === "CONTINUE_TO_RISKY") {
    chrome.storage.local.get([
      STORE_KEYS.CURRENT_WARNING,
      STORE_KEYS.ALLOW_ONCE
    ]).then(async (data) => {
      const warning = data[STORE_KEYS.CURRENT_WARNING];
      const allowOnce = data[STORE_KEYS.ALLOW_ONCE] || {};

      if (warning?.tabId !== undefined && warning?.originalUrl) {
        allowOnce[warning.tabId] = warning.originalUrl;

        await chrome.storage.local.set({
          [STORE_KEYS.ALLOW_ONCE]: allowOnce,
          [STORE_KEYS.CURRENT_WARNING]: null
        });

        await chrome.tabs.update(warning.tabId, {
          url: warning.originalUrl
        });
      }

      sendResponse({ ok: true });
    }).catch(() => {
      sendResponse({ ok: false });
    });
    return true;
  }

  if (message?.type === "GO_BACK_SAFE") {
    chrome.storage.local.get([STORE_KEYS.CURRENT_WARNING]).then(async (data) => {
      const warning = data[STORE_KEYS.CURRENT_WARNING];

      if (warning?.tabId !== undefined) {
        await chrome.storage.local.set({
          [STORE_KEYS.CURRENT_WARNING]: null
        });

        try {
          await chrome.tabs.goBack(warning.tabId);
        } catch (error) {
          await chrome.tabs.update(warning.tabId, {
            url: "https://www.google.com"
          });
        }
      }

      sendResponse({ ok: true });
    }).catch(() => {
      sendResponse({ ok: false });
    });
    return true;
  }
});

async function autoScanTab(tabId, url, allowRedirect) {
  const data = await chrome.storage.local.get([
    STORE_KEYS.ALLOW_ONCE,
    STORE_KEYS.TAB_RESULTS,
    STORE_KEYS.STATS,
    STORE_KEYS.HISTORY
  ]);

  const allowOnce = data[STORE_KEYS.ALLOW_ONCE] || {};

  if (allowOnce[tabId] === url) {
    delete allowOnce[tabId];
    await chrome.storage.local.set({ [STORE_KEYS.ALLOW_ONCE]: allowOnce });
    return;
  }

  const result = analyzeUrl(url);
  const tabResults = data[STORE_KEYS.TAB_RESULTS] || {};
  const previous = tabResults[tabId];

  const isSame =
    previous &&
    previous.url === result.url &&
    previous.risk === result.risk &&
    previous.verdict === result.verdict;

  tabResults[tabId] = result;
  await chrome.storage.local.set({ [STORE_KEYS.TAB_RESULTS]: tabResults });

  await updateBadge(tabId, result);
  sendTabResult(tabId, result);

  if (!isSame) {
    await updateStatsAndHistory(result, data);
  }

  if (allowRedirect && result.risk >= THRESHOLDS.CRITICAL) {
    await chrome.storage.local.set({
      [STORE_KEYS.CURRENT_WARNING]: {
        tabId,
        originalUrl: url,
        result
      }
    });

    await chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("warning.html")
    });
  }
}

function shouldAnalyzeUrl(url) {
  if (!url || typeof url !== "string") return false;
  if (url.startsWith(chrome.runtime.getURL("warning.html"))) return false;
  return /^(http|https):/i.test(url);
}

async function removeTabResult(tabId) {
  const data = await chrome.storage.local.get([STORE_KEYS.TAB_RESULTS]);
  const tabResults = data[STORE_KEYS.TAB_RESULTS] || {};
  if (tabResults[tabId]) {
    delete tabResults[tabId];
    await chrome.storage.local.set({ [STORE_KEYS.TAB_RESULTS]: tabResults });
  }
}

function normalizeBrowserInput(input) {
  let raw = String(input || "").trim();

  if (!raw) {
    return {
      displayUrl: "",
      analyzableUrl: "https://invalid.local/"
    };
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)) {
    if (/^(http|https):/i.test(raw)) {
      try {
        const parsed = new URL(raw);
        return {
          displayUrl: parsed.toString(),
          analyzableUrl: parsed.toString()
        };
      } catch {
        return fallbackBrowserLikeUrl(raw);
      }
    }

    return {
      displayUrl: raw,
      analyzableUrl: "https://browser-input.local/" + encodeURIComponent(raw)
    };
  }

  if (raw.startsWith("//")) {
    raw = "https:" + raw;
  } else if (raw.startsWith("www.")) {
    raw = "https://" + raw;
  } else if (
    raw.includes(".") &&
    !raw.includes(" ") &&
    !raw.startsWith("/") &&
    !raw.startsWith("?")
  ) {
    raw = "https://" + raw;
  } else {
    raw = "https://search.local/query?q=" + encodeURIComponent(raw);
  }

  try {
    const parsed = new URL(raw);
    return {
      displayUrl: parsed.toString(),
      analyzableUrl: parsed.toString()
    };
  } catch {
    return fallbackBrowserLikeUrl(raw);
  }
}

function fallbackBrowserLikeUrl(value) {
  return {
    displayUrl: value,
    analyzableUrl: "https://browser-input.local/" + encodeURIComponent(value)
  };
}

function analyzeUrl(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    return buildResult(
      String(url || ""),
      "unparsed-input",
      12,
      ["Input could not be parsed as a standard web URL, so a limited heuristic scan was applied."],
      false
    );
  }

  const domain = parsed.hostname.toLowerCase();
  const full = url.toLowerCase();

  let risk = 5;
  const reasons = [];

  if (parsed.protocol === "http:") {
    risk += 18;
    reasons.push("Uses HTTP instead of HTTPS.");
  }

  if (/^\d+\.\d+\.\d+\.\d+$/.test(domain)) {
    risk += 28;
    reasons.push("Uses an IP address instead of a normal domain.");
  }

  if ((domain.match(/\./g) || []).length >= 3) {
    risk += 12;
    reasons.push("Contains too many subdomains.");
  }

  if ((domain.match(/-/g) || []).length >= 2) {
    risk += 12;
    reasons.push("Contains multiple hyphens in the domain.");
  }

  if (/bit\.ly|tinyurl|rb\.gy|cutt\.ly|is\.gd|t\.co/.test(domain)) {
    risk += 28;
    reasons.push("Uses a URL shortener.");
  }

  if (/xn--/.test(domain)) {
    risk += 25;
    reasons.push("Contains punycode or lookalike-domain pattern.");
  }

  if (full.includes("@")) {
    risk += 18;
    reasons.push("Contains @ which can hide the real destination.");
  }

  if (url.length > 90) {
    risk += 10;
    reasons.push("URL is unusually long.");
  }

  const suspiciousWords = [
    "login",
    "verify",
    "secure",
    "account",
    "bank",
    "signin",
    "password",
    "otp",
    "kyc",
    "recovery",
    "confirm",
    "update",
    "billing",
    "alert",
    "bonus",
    "reward",
    "suspended",
    "payment",
    "wallet",
    "crypto",
    "gift",
    "claim"
  ];

  let suspiciousHits = 0;

  suspiciousWords.forEach((word) => {
    if (full.includes(word)) {
      suspiciousHits += 1;
      risk += 5;
      reasons.push(`Contains suspicious keyword: ${word}`);
    }
  });

  const brandLike = /(google|youtube|paypal|amazon|microsoft|apple|facebook|instagram|netflix|github|bank)/.test(full);

  if (brandLike && !isOfficialBrand(domain)) {
    risk += 18;
    reasons.push("Uses brand-like wording on a non-official domain.");
  }

  const aiLike =
    suspiciousHits >= 3 ||
    (brandLike && ((domain.match(/-/g) || []).length >= 2)) ||
    url.length > 90;

  if (aiLike) {
    risk += 10;
    reasons.push("Pattern resembles a mass-generated phishing link.");
  }

  risk = Math.min(risk, 99);

  if (risk <= 10 && reasons.length === 0) {
    reasons.push("No major phishing indicators found in the URL.");
  }

  return buildResult(url, domain || "unknown", risk, [...new Set(reasons)], aiLike);
}

function buildResult(url, domain, risk, reasons, aiLike) {
  let verdict = "Safe";

  if (risk >= THRESHOLDS.CRITICAL) {
    verdict = "Critical Risk";
  } else if (risk >= THRESHOLDS.WARNING) {
    verdict = "Suspicious";
  } else if (risk >= THRESHOLDS.CAUTION) {
    verdict = "Caution";
  }

  return {
    url,
    domain,
    risk,
    verdict,
    reasons,
    aiLike,
    checkedAt: new Date().toLocaleString()
  };
}

function isOfficialBrand(domain) {
  const officialDomains = [
    "google.com",
    "accounts.google.com",
    "youtube.com",
    "www.youtube.com",
    "paypal.com",
    "www.paypal.com",
    "amazon.com",
    "amazon.in",
    "www.amazon.in",
    "microsoft.com",
    "login.microsoftonline.com",
    "apple.com",
    "www.apple.com",
    "facebook.com",
    "instagram.com",
    "netflix.com",
    "github.com",
    "stackoverflow.com"
  ];

  return officialDomains.some((item) => domain === item || domain.endsWith("." + item));
}

async function updateStatsAndHistory(result, data) {
  const stats = data[STORE_KEYS.STATS] || {
    totalScans: 0,
    riskyScans: 0,
    aiScans: 0
  };

  stats.totalScans += 1;

  if (result.risk >= THRESHOLDS.WARNING) {
    stats.riskyScans += 1;
  }

  if (result.aiLike) {
    stats.aiScans += 1;
  }

  const history = data[STORE_KEYS.HISTORY] || [];
  history.unshift(result);

  await chrome.storage.local.set({
    [STORE_KEYS.STATS]: stats,
    [STORE_KEYS.HISTORY]: history.slice(0, 100)
  });
}

async function updateBadge(tabId, result) {
  let text = "";
  let color = "#22c55e";

  if (result.risk >= THRESHOLDS.CRITICAL) {
    text = "!";
    color = "#ef4444";
  } else if (result.risk >= THRESHOLDS.WARNING) {
    text = "!";
    color = "#f59e0b";
  } else if (result.risk >= THRESHOLDS.CAUTION) {
    text = "!";
    color = "#3b82f6";
  }

  await chrome.action.setBadgeText({ tabId, text });
  await chrome.action.setBadgeBackgroundColor({ tabId, color });
}

async function clearBadge(tabId) {
  await chrome.action.setBadgeText({ tabId, text: "" });
}

function sendTabResult(tabId, result) {
  chrome.runtime.sendMessage({
    type: "TAB_RESULT_UPDATED",
    tabId,
    result
  }).catch(() => {});
}