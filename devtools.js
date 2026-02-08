/**
 * Mocktail DevTools
 * Creates the DevTools Panel
 */

chrome.devtools.panels.create(
  "Mocktail", // Panel name
  "icons/icon.svg", // Icon path (optional)
  "panel.html", // Panel HTML
  function (panel) {
    console.log("🍹 Mocktail DevTools Panel created");
  }
);
