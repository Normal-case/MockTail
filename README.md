# 🍹 Mocktail

**API 응답을 가로채고 수정하는 개발자를 위한 크롬 확장 프로그램**

Mocktail은 개발자가 실제 API를 호출하지 않고도 원하는 응답을 만들어낼 수 있는 강력한 도구입니다. Fetch API와 XMLHttpRequest를 가로채서 응답 데이터를 자유롭게 수정할 수 있습니다.

## ✨ 주요 기능

- 🎯 **URL 패턴 매칭**: 정확한 일치, 포함, 시작, 정규식 등 다양한 매칭 방식 지원
- 🔄 **응답 수정**: 전체 교체, 병합, 필드별 수정 등 유연한 변환 옵션
- 📊 **실시간 로깅**: 가로챈 모든 요청을 실시간으로 모니터링
- 💾 **규칙 관리**: 규칙 추가, 편집, 삭제, 활성화/비활성화
- 📤 **내보내기/가져오기**: 규칙을 JSON 파일로 저장하고 공유
- 🎨 **직관적인 UI**: 아름답고 사용하기 쉬운 인터페이스

## 🚀 설치 방법

### 개발자 모드로 설치

1. 이 저장소를 클론하거나 다운로드합니다
```bash
git clone https://github.com/yourusername/mocktail.git
cd mocktail
```

2. Chrome 브라우저를 열고 `chrome://extensions/` 로 이동합니다

3. 우측 상단의 **개발자 모드**를 활성화합니다

4. **압축해제된 확장 프로그램을 로드합니다** 버튼을 클릭합니다

5. `mocktail` 폴더를 선택합니다

6. 🍹 Mocktail 아이콘이 툴바에 나타나면 설치 완료!

## 📖 사용 방법

### 1. 새 규칙 추가하기

1. Mocktail 아이콘을 클릭하여 팝업을 엽니다
2. **새 규칙 추가** 버튼을 클릭합니다
3. 규칙 정보를 입력합니다:
   - **규칙 이름**: 식별하기 쉬운 이름
   - **URL 패턴**: 가로챌 URL (예: `https://api.example.com/users`)
   - **매칭 방식**: 포함, 정확히, 시작, 정규식 중 선택
   - **액션 타입**: 전체 교체, 병합, 필드 수정 중 선택
   - **Mock 데이터**: JSON 형식의 응답 데이터
4. **저장** 버튼을 클릭합니다

### 2. 규칙 예시

#### 사용자 목록 API Mock

```json
{
  "name": "Mock User API",
  "urlPattern": "https://api.example.com/users",
  "matchType": "contains",
  "actionType": "replace",
  "mockData": {
    "users": [
      {
        "id": 1,
        "name": "홍길동",
        "email": "hong@example.com"
      },
      {
        "id": 2,
        "name": "김철수",
        "email": "kim@example.com"
      }
    ],
    "total": 2
  }
}
```

#### 로그인 API 성공 응답

```json
{
  "name": "Force Login Success",
  "urlPattern": "/api/auth/login",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 200,
  "mockData": {
    "success": true,
    "token": "mock-jwt-token-12345",
    "user": {
      "id": 1,
      "name": "테스트 유저",
      "role": "admin"
    }
  }
}
```

#### 응답에 필드 추가 (병합)

```json
{
  "name": "Add Debug Info",
  "urlPattern": "api.example.com",
  "matchType": "contains",
  "actionType": "merge",
  "mockData": {
    "debug": true,
    "mockedAt": "2024-01-01T00:00:00Z",
    "interceptedBy": "Mocktail"
  }
}
```

### 3. 규칙 관리

- **활성화/비활성화**: ✅/⭕ 아이콘을 클릭하여 규칙을 켜고 끕니다
- **편집**: ✏️ 아이콘을 클릭하여 규칙을 수정합니다
- **삭제**: 🗑️ 아이콘을 클릭하여 규칙을 제거합니다

### 4. 로그 확인

- **로그 탭**으로 이동하여 가로챈 요청을 실시간으로 확인합니다
- URL, 적용된 규칙, 시간 등의 정보를 볼 수 있습니다

### 5. 설정

- **알림 표시**: 요청을 가로챌 때 알림을 표시합니다
- **자동 새로고침**: 규칙 변경 시 페이지를 자동으로 새로고침합니다
- **규칙 내보내기/가져오기**: 규칙을 JSON 파일로 저장하고 불러옵니다

## 🎯 사용 사례

### 프론트엔드 개발
- 백엔드 API가 준비되지 않았을 때 가짜 데이터로 개발
- 다양한 응답 시나리오 테스트 (성공, 실패, 에러 등)

### QA 테스팅
- 특정 에러 상황 재현
- 엣지 케이스 테스트

### 디버깅
- API 응답 분석
- 네트워크 요청 모니터링

### 데모/프레젠테이션
- 안정적인 데모 환경 구성
- 원하는 데이터로 시연

## 🛠️ 기술 스택

- **Manifest V3**: 최신 크롬 확장 프로그램 표준
- **Fetch Interception**: 네이티브 fetch API 오버라이드
- **Chrome Storage API**: 규칙 및 설정 저장
- **Service Worker**: 백그라운드 처리

## 📁 프로젝트 구조

```
mocktail/
├── manifest.json           # 확장 프로그램 설정
├── popup.html             # 팝업 UI
├── scripts/
│   ├── background.js      # Service Worker
│   ├── content.js         # Fetch Interceptor
│   └── popup.js           # 팝업 로직
├── styles/
│   └── popup.css          # 스타일시트
├── icons/
│   ├── icon.svg           # SVG 아이콘
│   ├── icon16.png         # 16x16 아이콘
│   ├── icon48.png         # 48x48 아이콘
│   └── icon128.png        # 128x128 아이콘
└── README.md              # 이 파일
```

## 🔒 보안 및 프라이버시

- Mocktail은 사용자가 설정한 규칙에 따라서만 동작합니다
- 수집되는 데이터는 모두 로컬 스토리지에만 저장됩니다
- 외부 서버로 데이터를 전송하지 않습니다
- 오픈 소스로 코드를 투명하게 공개합니다

## ⚠️ 주의사항

- 이 확장 프로그램은 **개발 및 테스트 목적**으로만 사용하세요
- 프로덕션 환경에서는 사용하지 마세요
- 민감한 데이터를 다룰 때는 주의하세요
- 규칙이 활성화된 상태로 실제 서비스를 이용하지 마세요

## 🤝 기여하기

버그 리포트, 기능 제안, Pull Request 모두 환영합니다!

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포하실 수 있습니다.

## 📧 문의

문제가 있거나 질문이 있으시면 [Issue](https://github.com/yourusername/mocktail/issues)를 등록해주세요.

---

**Made with 💜 by developers, for developers**

🍹 Cheers to better development!


