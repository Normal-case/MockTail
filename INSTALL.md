# 🍹 Mocktail 설치 가이드

## 📦 설치 방법

### 방법 1: 개발자 모드로 설치 (권장)

1. **아이콘 생성하기**
   ```bash
   cd ~/workspace/mocktail
   open icons/generate-icons.html
   ```
   - 브라우저에서 HTML 파일이 열립니다
   - 각 아이콘 아래의 "다운로드" 링크를 클릭하여 PNG 파일을 저장합니다
   - `icon16.png`, `icon48.png`, `icon128.png`를 `icons/` 폴더에 저장합니다

2. **Chrome 확장 프로그램 페이지 열기**
   - Chrome 브라우저를 엽니다
   - 주소창에 `chrome://extensions/` 를 입력합니다
   - 또는 메뉴 → 도구 더보기 → 확장 프로그램

3. **개발자 모드 활성화**
   - 우측 상단의 **개발자 모드** 토글을 켭니다

4. **확장 프로그램 로드**
   - **압축해제된 확장 프로그램을 로드합니다** 버튼을 클릭합니다
   - `~/workspace/mocktail` 폴더를 선택합니다

5. **설치 완료!**
   - 🍹 Mocktail 아이콘이 툴바에 나타납니다
   - 아이콘을 클릭하여 확장 프로그램을 시작하세요

### 방법 2: 패키징하여 설치

확장 프로그램을 `.crx` 파일로 패키징할 수도 있습니다:

1. `chrome://extensions/` 페이지에서 **확장 프로그램 패키징** 클릭
2. 확장 프로그램 루트 디렉터리 선택: `~/workspace/mocktail`
3. **확장 프로그램 패키징** 버튼 클릭
4. 생성된 `.crx` 파일을 Chrome으로 드래그 앤 드롭

## ✅ 설치 확인

1. Mocktail 아이콘을 클릭합니다
2. 팝업이 열리고 "🍹 Mocktail" 제목이 보이면 성공!

## 🔧 문제 해결

### 아이콘이 표시되지 않는 경우

아이콘 PNG 파일이 없어서 발생할 수 있습니다:

```bash
cd ~/workspace/mocktail
open icons/generate-icons.html
```

각 아이콘을 다운로드하여 `icons/` 폴더에 저장하세요.

### "Manifest file is missing or unreadable" 오류

- `manifest.json` 파일이 존재하는지 확인하세요
- JSON 문법 오류가 없는지 확인하세요

### Content Script가 동작하지 않는 경우

1. 확장 프로그램을 다시 로드합니다 (🔄 버튼)
2. 테스트할 웹 페이지를 새로고침합니다
3. 개발자 도구 (F12) → Console에서 에러 확인

### Background Service Worker 오류

1. `chrome://extensions/` 페이지에서
2. Mocktail의 **서비스 워커** 링크를 클릭
3. 에러 메시지를 확인하고 디버깅합니다

## 📝 다음 단계

설치가 완료되었다면 [README.md](README.md)의 사용 방법을 참고하여 첫 번째 규칙을 만들어보세요!

## 🆘 도움이 필요하신가요?

[GitHub Issues](https://github.com/yourusername/mocktail/issues)에 문의해주세요.


