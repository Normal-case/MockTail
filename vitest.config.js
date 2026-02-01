import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // DOM 환경 (브라우저 API 시뮬레이션)
    environment: "happy-dom",

    // 전역 변수로 describe, test, expect 사용 가능
    globals: true,

    // 각 테스트 파일 실행 전에 실행될 설정 파일
    setupFiles: "./test/setup.js",

    // 커버리지 설정
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      exclude: [
        "test/**",
        "**/*.config.js",
        "**/node_modules/**",
        "devtools.js",
        "popup-toggle.js",
      ],
      // 커버리지 목표 (선택사항)
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },

    // 테스트 타임아웃 (밀리초)
    testTimeout: 10000,
  },
});
