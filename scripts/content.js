// Mocktail Fetch Interceptor
console.log('🍹 Mocktail Content Script 로드됨');

(function() {
  'use strict';
  
  let interceptCount = 0;
  let mocktailEnabled = true;
  let interceptRules = [];
  
  // 설정 로드
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({ type: 'GET_RULES' }, (response) => {
        if (response) {
          mocktailEnabled = response.enabled;
          interceptRules = response.rules;
          console.log('🍹 Mocktail 설정 로드:', { enabled: mocktailEnabled, rulesCount: interceptRules.length });
        }
      });
    }
  }
  
  // 초기 설정 로드
  loadSettings();
  
  // 설정 변경 감지
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.enabled) {
        mocktailEnabled = changes.enabled.newValue;
      }
      if (changes.interceptRules) {
        interceptRules = changes.interceptRules.newValue;
      }
    });
  }
  
  // URL이 규칙과 매칭되는지 확인
  function matchesRule(url, rule) {
    if (!rule.enabled) return false;
    
    try {
      if (rule.matchType === 'exact') {
        return url === rule.urlPattern;
      } else if (rule.matchType === 'contains') {
        return url.includes(rule.urlPattern);
      } else if (rule.matchType === 'regex') {
        const regex = new RegExp(rule.urlPattern);
        return regex.test(url);
      } else if (rule.matchType === 'startsWith') {
        return url.startsWith(rule.urlPattern);
      }
    } catch (e) {
      console.error('규칙 매칭 오류:', e);
    }
    return false;
  }
  
  // 데이터 변환 적용
  function applyTransformation(data, rule) {
    try {
      if (rule.actionType === 'replace') {
        // 전체 응답 교체
        return typeof rule.mockData === 'string' 
          ? JSON.parse(rule.mockData) 
          : rule.mockData;
      } else if (rule.actionType === 'merge') {
        // 데이터 병합
        const mockData = typeof rule.mockData === 'string'
          ? JSON.parse(rule.mockData)
          : rule.mockData;
        return { ...data, ...mockData };
      } else if (rule.actionType === 'modify') {
        // 특정 필드 수정
        const modified = { ...data };
        if (rule.modifications) {
          rule.modifications.forEach(mod => {
            if (mod.path) {
              // 중첩된 경로 지원 (예: "user.name")
              const keys = mod.path.split('.');
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
      console.error('데이터 변환 오류:', e);
      return data;
    }
    return data;
  }
  
  // 로그 전송
  function logIntercept(url, ruleName, originalData, modifiedData) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'LOG_INTERCEPT',
        data: {
          url,
          ruleName,
          originalData: JSON.stringify(originalData).substring(0, 500), // 처음 500자만
          modifiedData: JSON.stringify(modifiedData).substring(0, 500)
        }
      });
    }
  }
  
  // 배지 업데이트
  function updateBadge() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'BADGE_UPDATE',
        count: interceptCount
      });
    }
  }
  
  // ========== Fetch 오버라이드 ==========
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    const [resource, config] = args;
    const url = typeof resource === 'string' ? resource : resource.url;
    
    // 실제 요청 수행
    const response = await originalFetch(...args);
    
    // Mocktail이 비활성화되어 있으면 원본 반환
    if (!mocktailEnabled) {
      return response;
    }
    
    // 매칭되는 규칙 찾기
    const matchedRule = interceptRules.find(rule => matchesRule(url, rule));
    
    if (matchedRule) {
      console.log('🍹 Mocktail 가로채기:', url);
      console.log('📋 규칙:', matchedRule.name);
      
      try {
        // 응답 복제
        const clonedResponse = response.clone();
        
        // Content-Type 확인
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // JSON 응답 처리
          const originalData = await clonedResponse.json();
          console.log('📦 원본 데이터:', originalData);
          
          // 데이터 변환
          const modifiedData = applyTransformation(originalData, matchedRule);
          console.log('✨ 수정된 데이터:', modifiedData);
          
          // 로그 기록
          logIntercept(url, matchedRule.name, originalData, modifiedData);
          
          // 카운트 증가 및 배지 업데이트
          interceptCount++;
          updateBadge();
          
          // 새로운 Response 생성
          return new Response(JSON.stringify(modifiedData), {
            status: matchedRule.statusCode || response.status,
            statusText: response.statusText,
            headers: response.headers
          });
        } else {
          // 텍스트 응답 처리
          const text = await clonedResponse.text();
          
          if (matchedRule.actionType === 'replace' && matchedRule.mockData) {
            const modifiedText = typeof matchedRule.mockData === 'string'
              ? matchedRule.mockData
              : JSON.stringify(matchedRule.mockData);
            
            interceptCount++;
            updateBadge();
            
            return new Response(modifiedText, {
              status: matchedRule.statusCode || response.status,
              statusText: response.statusText,
              headers: response.headers
            });
          }
        }
      } catch (e) {
        console.error('🍹 Mocktail 오류:', e);
        return response;
      }
    }
    
    return response;
  };
  
  // ========== XMLHttpRequest 오버라이드 ==========
  const XHR = XMLHttpRequest.prototype;
  const originalOpen = XHR.open;
  const originalSend = XHR.send;
  
  XHR.open = function(method, url, async, user, pass) {
    this._mocktail_url = url;
    this._mocktail_method = method;
    return originalOpen.apply(this, arguments);
  };
  
  XHR.send = function(data) {
    if (mocktailEnabled) {
      const url = this._mocktail_url;
      const matchedRule = interceptRules.find(rule => matchesRule(url, rule));
      
      if (matchedRule) {
        this.addEventListener('load', function() {
          console.log('🍹 Mocktail XHR 가로채기:', url);
          
          try {
            const contentType = this.getResponseHeader('content-type');
            
            if (contentType && contentType.includes('application/json')) {
              const originalData = JSON.parse(this.responseText);
              const modifiedData = applyTransformation(originalData, matchedRule);
              
              console.log('✨ XHR 수정됨:', modifiedData);
              
              // responseText 오버라이드
              Object.defineProperty(this, 'responseText', {
                writable: true,
                value: JSON.stringify(modifiedData)
              });
              
              Object.defineProperty(this, 'response', {
                writable: true,
                value: JSON.stringify(modifiedData)
              });
              
              interceptCount++;
              updateBadge();
              logIntercept(url, matchedRule.name, originalData, modifiedData);
            }
          } catch (e) {
            console.error('🍹 XHR Mocktail 오류:', e);
          }
        });
      }
    }
    
    return originalSend.apply(this, arguments);
  };
  
  console.log('🍹 Mocktail 인터셉터 활성화 완료!');
})();


