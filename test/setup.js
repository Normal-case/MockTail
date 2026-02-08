/**
 * Vitest test environment setup
 * This file runs before all test files.
 */
import { vi } from "vitest";

// Chrome Extension API mocking
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

// Console warning/error output control (optional)
// Uncomment to reduce unnecessary console output during tests
// global.console = {
//   ...console,
//   warn: vi.fn(),
//   error: vi.fn()
// };
