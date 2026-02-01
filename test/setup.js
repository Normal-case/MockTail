/**
 * Vitest 테스트 환경 설정
 * 모든 테스트 파일이 실행되기 전에 이 파일이 실행됩니다.
 */
import { vi } from "vitest";

// Chrome Extension API 모킹
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      remove: vi.fn(),
      clear: vi.fn(),
    },
    onChanged: {
      addListener: vi.fn(),
    },
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
    },
    onInstalled: {
      addListener: vi.fn(),
    },
    id: "test-extension-id",
  },
  action: {
    setBadgeText: vi.fn(),
    setBadgeBackgroundColor: vi.fn(),
  },
  tabs: {
    onUpdated: {
      addListener: vi.fn(),
    },
  },
};

// 콘솔 경고/에러 출력 제어 (선택사항)
// 테스트 중 불필요한 콘솔 출력을 줄이고 싶다면 주석 해제
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn()
// };
