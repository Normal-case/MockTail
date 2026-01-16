/**
 * Mocktail DevTools
 * DevTools Panel을 생성합니다
 */

chrome.devtools.panels.create(
  "Mocktail", // 패널 이름
  "icons/icon.svg", // 아이콘 경로 (옵션)
  "panel.html", // 패널 HTML
  function (panel) {
    console.log("🍹 Mocktail DevTools Panel 생성됨");
  }
);
