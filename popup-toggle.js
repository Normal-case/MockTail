/**
 * Popup Toggle Script
 * 간단한 ON/OFF 토글만 처리
 */

const enableToggle = document.getElementById("enableToggle");
const statusDiv = document.getElementById("status");

// 초기 상태 로드
chrome.storage.local.get(["enabled"], (result) => {
  const enabled = result.enabled !== false; // 기본값 true
  enableToggle.checked = enabled;
  updateStatus(enabled);
});

// 토글 변경 이벤트
enableToggle.addEventListener("change", (e) => {
  const enabled = e.target.checked;
  chrome.storage.local.set({ enabled }, () => {
    updateStatus(enabled);
    console.log(`🍹 Mocktail ${enabled ? "활성화" : "비활성화"}됨`);
  });
});

// 상태 표시 업데이트
function updateStatus(enabled) {
  if (enabled) {
    statusDiv.textContent = "✓ 활성화됨";
    statusDiv.className = "status active";
  } else {
    statusDiv.textContent = "비활성화됨";
    statusDiv.className = "status inactive";
  }
}
