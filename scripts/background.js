// Mocktail Background Service Worker
console.log('🍹 Mocktail Background Service Worker 시작');

// 확장 프로그램 설치 시 초기 설정
chrome.runtime.onInstalled.addListener(() => {
  console.log('Mocktail 설치 완료!');
  
  // 기본 설정 초기화
  chrome.storage.local.set({
    enabled: true,
    interceptRules: [],
    logs: []
  });
});

// Content Script로부터 메시지 수신
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('메시지 수신:', request);
  
  if (request.type === 'GET_RULES') {
    // 인터셉트 규칙 가져오기
    chrome.storage.local.get(['interceptRules', 'enabled'], (result) => {
      sendResponse({
        rules: result.interceptRules || [],
        enabled: result.enabled !== false
      });
    });
    return true; // 비동기 응답을 위해 필요
  }
  
  if (request.type === 'LOG_INTERCEPT') {
    // 인터셉트 로그 저장
    chrome.storage.local.get(['logs'], (result) => {
      const logs = result.logs || [];
      logs.unshift({
        ...request.data,
        timestamp: Date.now()
      });
      
      // 최대 100개까지만 저장
      if (logs.length > 100) {
        logs.pop();
      }
      
      chrome.storage.local.set({ logs });
    });
  }
  
  if (request.type === 'BADGE_UPDATE') {
    // 배지 업데이트
    chrome.action.setBadgeText({
      text: request.count > 0 ? request.count.toString() : '',
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: '#FF6B6B'
    });
  }
});

// 탭이 업데이트될 때 배지 초기화
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    chrome.action.setBadgeText({ text: '', tabId });
  }
});


