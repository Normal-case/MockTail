// Mocktail Popup Script
console.log('🍹 Mocktail Popup 로드됨');

let currentRules = [];
let editingRuleId = null;

// DOM 요소
const enableToggle = document.getElementById('enableToggle');
const statusLabel = document.getElementById('statusLabel');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const addRuleBtn = document.getElementById('addRuleBtn');
const rulesList = document.getElementById('rulesList');
const logsList = document.getElementById('logsList');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const ruleModal = document.getElementById('ruleModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const ruleForm = document.getElementById('ruleForm');
const modalTitle = document.getElementById('modalTitle');

// 초기화
init();

function init() {
  loadSettings();
  loadRules();
  loadLogs();
  setupEventListeners();
}

// 설정 로드
function loadSettings() {
  chrome.storage.local.get(['enabled', 'showNotifications', 'autoReload'], (result) => {
    enableToggle.checked = result.enabled !== false;
    statusLabel.textContent = result.enabled !== false ? '활성화' : '비활성화';
    
    document.getElementById('showNotifications').checked = result.showNotifications || false;
    document.getElementById('autoReload').checked = result.autoReload || false;
  });
}

// 규칙 로드
function loadRules() {
  chrome.storage.local.get(['interceptRules'], (result) => {
    currentRules = result.interceptRules || [];
    renderRules();
  });
}

// 로그 로드
function loadLogs() {
  chrome.storage.local.get(['logs'], (result) => {
    const logs = result.logs || [];
    renderLogs(logs);
  });
}

// 규칙 렌더링
function renderRules() {
  if (currentRules.length === 0) {
    rulesList.innerHTML = `
      <div class="empty-state">
        <p>규칙이 없습니다</p>
        <p class="empty-hint">새 규칙을 추가해보세요!</p>
      </div>
    `;
    return;
  }

  rulesList.innerHTML = currentRules.map((rule, index) => `
    <div class="rule-card">
      <div class="rule-header">
        <div class="rule-name">${escapeHtml(rule.name)}</div>
        <div class="rule-actions">
          <button class="icon-btn" onclick="toggleRule(${index})" title="${rule.enabled ? '비활성화' : '활성화'}">
            ${rule.enabled ? '✅' : '⭕'}
          </button>
          <button class="icon-btn" onclick="editRule(${index})" title="편집">✏️</button>
          <button class="icon-btn" onclick="deleteRule(${index})" title="삭제">🗑️</button>
        </div>
      </div>
      <div class="rule-url">${escapeHtml(rule.urlPattern)}</div>
      <div class="rule-tags">
        <span class="tag ${rule.enabled ? 'tag-enabled' : 'tag-disabled'}">
          ${rule.enabled ? '활성화' : '비활성화'}
        </span>
        <span class="tag tag-type">${getActionTypeText(rule.actionType)}</span>
        <span class="tag tag-type">${getMatchTypeText(rule.matchType)}</span>
      </div>
    </div>
  `).join('');
}

// 로그 렌더링
function renderLogs(logs) {
  if (logs.length === 0) {
    logsList.innerHTML = `
      <div class="empty-state">
        <p>로그가 없습니다</p>
      </div>
    `;
    return;
  }

  logsList.innerHTML = logs.map(log => `
    <div class="log-item">
      <div class="log-time">${formatTime(log.timestamp)}</div>
      <div class="log-url">${escapeHtml(log.url)}</div>
      <div class="log-rule">규칙: ${escapeHtml(log.ruleName)}</div>
    </div>
  `).join('');
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 토글 스위치
  enableToggle.addEventListener('change', (e) => {
    const enabled = e.target.checked;
    chrome.storage.local.set({ enabled });
    statusLabel.textContent = enabled ? '활성화' : '비활성화';
  });

  // 탭 전환
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      switchTab(tabName);
    });
  });

  // 규칙 추가 버튼
  addRuleBtn.addEventListener('click', openAddRuleModal);

  // 모달 닫기
  closeModal.addEventListener('click', closeRuleModal);
  cancelBtn.addEventListener('click', closeRuleModal);

  // 모달 외부 클릭
  ruleModal.addEventListener('click', (e) => {
    if (e.target === ruleModal) {
      closeRuleModal();
    }
  });

  // 폼 제출
  ruleForm.addEventListener('submit', saveRule);

  // 로그 지우기
  clearLogsBtn.addEventListener('click', clearLogs);

  // 설정 변경
  document.getElementById('showNotifications').addEventListener('change', (e) => {
    chrome.storage.local.set({ showNotifications: e.target.checked });
  });

  document.getElementById('autoReload').addEventListener('change', (e) => {
    chrome.storage.local.set({ autoReload: e.target.checked });
  });

  // 내보내기/가져오기
  document.getElementById('exportBtn').addEventListener('click', exportRules);
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', importRules);
}

// 탭 전환
function switchTab(tabName) {
  tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  tabContents.forEach(content => {
    content.classList.toggle('active', content.id === `${tabName}-tab`);
  });

  // 로그 탭으로 전환할 때 로그 새로고침
  if (tabName === 'logs') {
    loadLogs();
  }
}

// 규칙 추가 모달 열기
function openAddRuleModal() {
  editingRuleId = null;
  modalTitle.textContent = '새 규칙 추가';
  ruleForm.reset();
  document.getElementById('ruleEnabled').checked = true;
  ruleModal.classList.add('active');
}

// 규칙 편집 모달 열기
function editRule(index) {
  editingRuleId = index;
  const rule = currentRules[index];
  
  modalTitle.textContent = '규칙 편집';
  document.getElementById('ruleName').value = rule.name;
  document.getElementById('urlPattern').value = rule.urlPattern;
  document.getElementById('matchType').value = rule.matchType || 'contains';
  document.getElementById('actionType').value = rule.actionType || 'replace';
  document.getElementById('mockData').value = typeof rule.mockData === 'string' 
    ? rule.mockData 
    : JSON.stringify(rule.mockData, null, 2);
  document.getElementById('statusCode').value = rule.statusCode || '';
  document.getElementById('ruleEnabled').checked = rule.enabled !== false;
  
  ruleModal.classList.add('active');
}

// 모달 닫기
function closeRuleModal() {
  ruleModal.classList.remove('active');
  editingRuleId = null;
  ruleForm.reset();
}

// 규칙 저장
function saveRule(e) {
  e.preventDefault();

  const name = document.getElementById('ruleName').value.trim();
  const urlPattern = document.getElementById('urlPattern').value.trim();
  const matchType = document.getElementById('matchType').value;
  const actionType = document.getElementById('actionType').value;
  const mockDataStr = document.getElementById('mockData').value.trim();
  const statusCode = document.getElementById('statusCode').value;
  const enabled = document.getElementById('ruleEnabled').checked;

  // JSON 유효성 검사
  let mockData;
  try {
    mockData = JSON.parse(mockDataStr);
  } catch (e) {
    alert('Mock 데이터가 올바른 JSON 형식이 아닙니다.');
    return;
  }

  const rule = {
    id: editingRuleId !== null ? currentRules[editingRuleId].id : Date.now(),
    name,
    urlPattern,
    matchType,
    actionType,
    mockData,
    statusCode: statusCode ? parseInt(statusCode) : null,
    enabled
  };

  if (editingRuleId !== null) {
    // 편집
    currentRules[editingRuleId] = rule;
  } else {
    // 추가
    currentRules.push(rule);
  }

  // 저장
  chrome.storage.local.set({ interceptRules: currentRules }, () => {
    renderRules();
    closeRuleModal();
    
    // 자동 새로고침 설정 확인
    chrome.storage.local.get(['autoReload'], (result) => {
      if (result.autoReload) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.reload(tabs[0].id);
          }
        });
      }
    });
  });
}

// 규칙 토글
function toggleRule(index) {
  currentRules[index].enabled = !currentRules[index].enabled;
  chrome.storage.local.set({ interceptRules: currentRules }, renderRules);
}

// 규칙 삭제
function deleteRule(index) {
  if (confirm('이 규칙을 삭제하시겠습니까?')) {
    currentRules.splice(index, 1);
    chrome.storage.local.set({ interceptRules: currentRules }, renderRules);
  }
}

// 로그 지우기
function clearLogs() {
  chrome.storage.local.set({ logs: [] }, () => {
    renderLogs([]);
  });
}

// 규칙 내보내기
function exportRules() {
  const data = JSON.stringify(currentRules, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mocktail-rules-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 규칙 가져오기
function importRules(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const rules = JSON.parse(event.target.result);
      if (!Array.isArray(rules)) {
        throw new Error('올바른 형식이 아닙니다.');
      }
      
      currentRules = rules;
      chrome.storage.local.set({ interceptRules: currentRules }, () => {
        renderRules();
        alert('규칙을 가져왔습니다!');
      });
    } catch (error) {
      alert('파일을 읽는데 실패했습니다: ' + error.message);
    }
  };
  reader.readAsText(file);
}

// 유틸리티 함수
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getActionTypeText(type) {
  const types = {
    replace: '전체 교체',
    merge: '병합',
    modify: '필드 수정'
  };
  return types[type] || type;
}

function getMatchTypeText(type) {
  const types = {
    contains: '포함',
    exact: '정확히',
    startsWith: '시작',
    regex: '정규식'
  };
  return types[type] || type;
}

function formatTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ko-KR');
}

// 전역 함수로 노출 (HTML에서 onclick으로 호출하기 위해)
window.toggleRule = toggleRule;
window.editRule = editRule;
window.deleteRule = deleteRule;


