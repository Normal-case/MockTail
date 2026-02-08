// Mocktail Fetch Interceptor
console.log("🍹 Mocktail Content Script loaded");

(function () {
  "use strict";

  let interceptCount = 0;
  let mocktailEnabled = true;
  let interceptRules = [];

  // Load settings
  function loadSettings() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "GET_RULES" }, (response) => {
        if (response) {
          mocktailEnabled = response.enabled;
          interceptRules = response.rules;
          console.log("🍹 Mocktail settings loaded:", {
            enabled: mocktailEnabled,
            rulesCount: interceptRules.length,
          });
        }
      });
    }
  }

  // Initial settings load
  loadSettings();

  // Detect settings changes
  if (typeof chrome !== "undefined" && chrome.storage) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        mocktailEnabled = changes.enabled.newValue;
      }
      if (changes.interceptRules) {
        interceptRules = changes.interceptRules.newValue;
      }
    });
  }

  // Check if URL matches a rule
  function matchesRule(url, rule) {
    if (!rule.enabled) return false;

    try {
      if (rule.matchType === "exact") {
        return url === rule.urlPattern;
      } else if (rule.matchType === "contains") {
        return url.includes(rule.urlPattern);
      } else if (rule.matchType === "regex") {
        const regex = new RegExp(rule.urlPattern);
        return regex.test(url);
      } else if (rule.matchType === "startsWith") {
        return url.startsWith(rule.urlPattern);
      }
    } catch (e) {
      console.error("Rule matching error:", e);
    }
    return false;
  }

  // Apply data transformation
  function applyTransformation(data, rule) {
    try {
      if (rule.actionType === "replace") {
        // Replace entire response
        return typeof rule.mockData === "string"
          ? JSON.parse(rule.mockData)
          : rule.mockData;
      } else if (rule.actionType === "merge") {
        // Merge data
        const mockData =
          typeof rule.mockData === "string"
            ? JSON.parse(rule.mockData)
            : rule.mockData;
        return { ...data, ...mockData };
      } else if (rule.actionType === "modify") {
        // Modify specific fields
        const modified = { ...data };
        if (rule.modifications) {
          rule.modifications.forEach((mod) => {
            if (mod.path) {
              // Support nested paths (e.g. "user.name")
              const keys = mod.path.split(".");
              let current = modified;
              for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
              }
              current[keys[keys.length - 1]] = mod.value;
            }
          });
        }
        return modified;
      }
    } catch (e) {
      console.error("Data transformation error:", e);
      return data;
    }
    return data;
  }

  // Send log
  function logIntercept(url, ruleName, originalData, modifiedData) {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: "LOG_INTERCEPT",
        data: {
          url,
          ruleName,
          originalData: JSON.stringify(originalData).substring(0, 500), // First 500 chars only
          modifiedData: JSON.stringify(modifiedData).substring(0, 500),
        },
      });
    }
  }

  // Update badge
  function updateBadge() {
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: "BADGE_UPDATE",
        count: interceptCount,
      });
    }
  }

  // ========== Fetch Override ==========
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const [resource, config] = args;
    const url = typeof resource === "string" ? resource : resource.url;

    // Perform actual request
    const response = await originalFetch(...args);

    // Return original if Mocktail is disabled
    if (!mocktailEnabled) {
      return response;
    }

    // Find matching rule
    const matchedRule = interceptRules.find((rule) => matchesRule(url, rule));

    if (matchedRule) {
      console.log("🍹 Mocktail intercepted:", url);
      console.log("📋 Rule:", matchedRule.name);

      try {
        // Clone response
        const clonedResponse = response.clone();

        // Check Content-Type
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
          // Handle JSON response
          const originalData = await clonedResponse.json();
          console.log("📦 Original data:", originalData);

          // Transform data
          const modifiedData = applyTransformation(originalData, matchedRule);
          console.log("✨ Modified data:", modifiedData);

          // Log intercept
          logIntercept(url, matchedRule.name, originalData, modifiedData);

          // Increment count and update badge
          interceptCount++;
          updateBadge();

          // Create new Response
          return new Response(JSON.stringify(modifiedData), {
            status: matchedRule.statusCode || response.status,
            statusText: response.statusText,
            headers: response.headers,
          });
        } else {
          // Handle text response
          const text = await clonedResponse.text();

          if (matchedRule.actionType === "replace" && matchedRule.mockData) {
            const modifiedText =
              typeof matchedRule.mockData === "string"
                ? matchedRule.mockData
                : JSON.stringify(matchedRule.mockData);

            interceptCount++;
            updateBadge();

            return new Response(modifiedText, {
              status: matchedRule.statusCode || response.status,
              statusText: response.statusText,
              headers: response.headers,
            });
          }
        }
      } catch (e) {
        console.error("🍹 Mocktail error:", e);
        return response;
      }
    }

    return response;
  };

  // ========== XMLHttpRequest Override ==========
  const XHR = XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;

  XHR.open = function (method, url, async, user, pass) {
    this._mocktail_url = url;
    this._mocktail_method = method;
    return originalOpen.apply(this, arguments);
  };

  XHR.send = function (data) {
    if (mocktailEnabled) {
      const url = this._mocktail_url;
      const matchedRule = interceptRules.find((rule) => matchesRule(url, rule));

      if (matchedRule) {
        this.addEventListener("load", function () {
          console.log("🍹 Mocktail XHR intercepted:", url);

          try {
            const contentType = this.getResponseHeader("content-type");

            if (contentType && contentType.includes("application/json")) {
              const originalData = JSON.parse(this.responseText);
              const modifiedData = applyTransformation(
                originalData,
                matchedRule,
              );

              console.log("✨ XHR modified:", modifiedData);

              // Override responseText
              Object.defineProperty(this, "responseText", {
                writable: true,
                value: JSON.stringify(modifiedData),
              });

              Object.defineProperty(this, "response", {
                writable: true,
                value: JSON.stringify(modifiedData),
              });

              interceptCount++;
              updateBadge();
              logIntercept(url, matchedRule.name, originalData, modifiedData);
            }
          } catch (e) {
            console.error("🍹 XHR Mocktail error:", e);
          }
        });
      }
    }

    return originalSend.apply(this, arguments);
  };

  console.log("🍹 Mocktail interceptor activated!");
})();
