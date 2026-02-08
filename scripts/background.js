// Mocktail Background Service Worker
console.log("🍹 Mocktail Background Service Worker started");

// Initialize default settings on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("Mocktail installed!");

  // Initialize default settings
  chrome.storage.local.set({
    enabled: true,
    interceptRules: [],
    logs: [],
  });
});

// Receive messages from Content Script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Message received:", request);

  if (request.type === "GET_RULES") {
    // Get intercept rules
    chrome.storage.local.get(["interceptRules", "enabled"], (result) => {
      sendResponse({
        rules: result.interceptRules || [],
        enabled: result.enabled !== false,
      });
    });
    return true; // Required for async response
  }

  if (request.type === "LOG_INTERCEPT") {
    // Save intercept log
    chrome.storage.local.get(["logs"], (result) => {
      const logs = result.logs || [];
      logs.unshift({
        ...request.data,
        timestamp: Date.now(),
      });

      // Keep max 100 entries
      if (logs.length > 100) {
        logs.pop();
      }

      chrome.storage.local.set({ logs });
    });
  }

  if (request.type === "BADGE_UPDATE") {
    // Update badge
    chrome.action.setBadgeText({
      text: request.count > 0 ? request.count.toString() : "",
      tabId: sender.tab.id,
    });
    chrome.action.setBadgeBackgroundColor({
      color: "#FF6B6B",
    });
  }
});

// Reset badge when tab is updated
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "loading") {
    chrome.action.setBadgeText({ text: "", tabId });
  }
});
