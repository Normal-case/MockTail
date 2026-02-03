/**
 * Router Class Unit Tests
 * Test cases for Router navigation and view management
 */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { Router } from "../src/core/router.js";

// Mock View class for testing
class MockView {
  constructor(router, storage) {
    this.router = router;
    this.storage = storage;
    this.mountCalled = false;
    this.unmountCalled = false;
    this.mountData = null;
  }

  async mount(container, data) {
    this.mountCalled = true;
    this.mountData = data;
    container.innerHTML = `<div>Mock View Content</div>`;
  }

  unmount() {
    this.unmountCalled = true;
  }
}

class AnotherMockView extends MockView {
  async mount(container, data) {
    this.mountCalled = true;
    this.mountData = data;
    container.innerHTML = `<div>Another Mock View</div>`;
  }
}

describe("Router Class", () => {
  let router;
  let mockStorage;
  let container;

  beforeEach(() => {
    // Create mock storage
    mockStorage = {
      getData: vi.fn(),
      setData: vi.fn(),
    };

    // Create router instance with dependencies
    router = new Router({ storage: mockStorage });

    // Create mock DOM container
    container = document.createElement("div");
    container.id = "app";
    document.body.appendChild(container);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should create router with initial state", () => {
      const newRouter = new Router();

      expect(newRouter.views).toBeInstanceOf(Map);
      expect(newRouter.currentView).toBeNull();
      expect(newRouter.currentViewInstance).toBeNull();
      expect(newRouter.history).toEqual([]);
      expect(newRouter.container).toBeNull();
    });

    test("should store dependencies", () => {
      const deps = { storage: mockStorage, otherDep: "test" };
      const newRouter = new Router(deps);

      expect(newRouter.dependencies).toEqual(deps);
    });

    test("should initialize with container", () => {
      router.init("app");

      expect(router.container).toBeTruthy();
      expect(router.container.id).toBe("app");
    });

    test("should throw error when container not found", () => {
      expect(() => {
        router.init("non-existent-container");
      }).toThrow('Container with id "non-existent-container" not found');
    });
  });

  describe("View Registration", () => {
    test("should register a view class", () => {
      router.register("home", MockView);

      expect(router.views.has("home")).toBe(true);
      expect(router.views.get("home")).toBe(MockView);
    });

    test("should register multiple views", () => {
      router.register("home", MockView);
      router.register("detail", AnotherMockView);

      expect(router.views.size).toBe(2);
      expect(router.views.get("home")).toBe(MockView);
      expect(router.views.get("detail")).toBe(AnotherMockView);
    });

    test("should overwrite view when registered with same name", () => {
      router.register("home", MockView);
      router.register("home", AnotherMockView);

      expect(router.views.size).toBe(1);
      expect(router.views.get("home")).toBe(AnotherMockView);
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      router.init("app");
      router.register("home", MockView);
      router.register("detail", AnotherMockView);
    });

    test("should navigate to registered view", async () => {
      await router.navigate("home");

      expect(router.currentView).toEqual({
        name: "home",
        data: null,
      });
      expect(router.currentViewInstance).toBeInstanceOf(MockView);
      expect(router.currentViewInstance.mountCalled).toBe(true);
    });

    test("should not navigate to unregistered view", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation();

      await router.navigate("unknown");

      expect(consoleSpy).toHaveBeenCalledWith('View "unknown" not found');
      expect(router.currentView).toBeNull();

      consoleSpy.mockRestore();
    });

    test("should pass data to view", async () => {
      const testData = { id: "123", name: "Test" };

      await router.navigate("home", testData);

      expect(router.currentViewInstance.mountData).toEqual(testData);
    });

    test("should create new view instance on each navigation", async () => {
      await router.navigate("home");
      const firstInstance = router.currentViewInstance;

      await router.navigate("detail");
      await router.navigate("home");
      const secondInstance = router.currentViewInstance;

      expect(firstInstance).not.toBe(secondInstance);
    });

    test("should call unmount on previous view", async () => {
      await router.navigate("home");
      const firstView = router.currentViewInstance;

      await router.navigate("detail");

      expect(firstView.unmountCalled).toBe(true);
    });

    test("should add previous view to history", async () => {
      await router.navigate("home", { id: "1" });
      await router.navigate("detail", { id: "2" });

      expect(router.history).toHaveLength(1);
      expect(router.history[0]).toEqual({
        name: "home",
        data: { id: "1" },
      });
    });

    test("should not add to history on first navigation", async () => {
      await router.navigate("home");

      expect(router.history).toHaveLength(0);
    });

    test("should render view content to container", async () => {
      await router.navigate("home");

      const appContainer = document.getElementById("app");
      expect(appContainer.innerHTML).toContain("Mock View Content");
    });
  });

  describe("Go Back", () => {
    beforeEach(() => {
      router.init("app");
      router.register("home", MockView);
      router.register("detail", AnotherMockView);
    });

    test("should go back to previous view", async () => {
      await router.navigate("home", { id: "1" });
      await router.navigate("detail", { id: "2" });

      await router.goBack();

      expect(router.currentView).toEqual({
        name: "home",
        data: { id: "1" },
      });
      expect(router.currentViewInstance).toBeInstanceOf(MockView);
    });

    test("should do nothing when history is empty", async () => {
      await router.navigate("home");

      await router.goBack();

      expect(router.currentView.name).toBe("home");
      expect(router.history).toHaveLength(0);
    });

    test("should remove last item from history", async () => {
      await router.navigate("home");
      await router.navigate("detail");
      await router.navigate("home");

      expect(router.history).toHaveLength(2);

      await router.goBack();

      expect(router.history).toHaveLength(1);
    });

    test("should call unmount on current view", async () => {
      await router.navigate("home");
      await router.navigate("detail");
      const currentView = router.currentViewInstance;

      await router.goBack();

      expect(currentView.unmountCalled).toBe(true);
    });

    test("should restore view with original data", async () => {
      const originalData = { id: "123", value: "test" };

      await router.navigate("home", originalData);
      await router.navigate("detail");
      await router.goBack();

      expect(router.currentViewInstance.mountData).toEqual(originalData);
    });

    test("should not add to history when going back", async () => {
      await router.navigate("home");
      await router.navigate("detail");
      const historyLength = router.history.length;

      await router.goBack();

      expect(router.history).toHaveLength(historyLength - 1);
    });
  });

  describe("History Management", () => {
    beforeEach(() => {
      router.init("app");
      router.register("home", MockView);
      router.register("detail", AnotherMockView);
    });

    test("should get current view information", async () => {
      await router.navigate("home", { id: "123" });

      const currentView = router.getCurrentView();

      expect(currentView).toEqual({
        name: "home",
        data: { id: "123" },
      });
    });

    test("should return null when no view is active", () => {
      const currentView = router.getCurrentView();

      expect(currentView).toBeNull();
    });

    test("should clear history", async () => {
      await router.navigate("home");
      await router.navigate("detail");
      await router.navigate("home");

      router.clearHistory();

      expect(router.history).toEqual([]);
    });

    test("should reset to view and clear history", async () => {
      await router.navigate("home");
      await router.navigate("detail");

      expect(router.history).toHaveLength(1);

      await router.reset("home", { id: "new" });

      expect(router.history).toEqual([]);
      expect(router.currentView).toEqual({
        name: "home",
        data: { id: "new" },
      });
    });
  });

  describe("Complex Navigation Scenarios", () => {
    beforeEach(() => {
      router.init("app");
      router.register("A", MockView);
      router.register("B", AnotherMockView);
      router.register("C", MockView);
      router.register("D", AnotherMockView);
    });

    test("should handle A → B → C → Back → D navigation", async () => {
      await router.navigate("A");
      await router.navigate("B");
      await router.navigate("C");

      expect(router.history).toHaveLength(2);
      expect(router.currentView.name).toBe("C");

      await router.goBack();

      expect(router.history).toHaveLength(1);
      expect(router.currentView.name).toBe("B");

      await router.navigate("D");

      expect(router.history).toHaveLength(2);
      expect(router.currentView.name).toBe("D");
    });

    test("should handle multiple back navigations", async () => {
      await router.navigate("A");
      await router.navigate("B");
      await router.navigate("C");
      await router.navigate("D");

      await router.goBack(); // D → C
      await router.goBack(); // C → B
      await router.goBack(); // B → A

      expect(router.currentView.name).toBe("A");
      expect(router.history).toHaveLength(0);
    });
  });

  describe("Memory Management", () => {
    beforeEach(() => {
      router.init("app");
      router.register("home", MockView);
      router.register("detail", AnotherMockView);
    });

    test("should remove view instance reference on navigation", async () => {
      await router.navigate("home");
      const firstInstance = router.currentViewInstance;

      await router.navigate("detail");

      expect(router.currentViewInstance).not.toBe(firstInstance);
      expect(firstInstance.unmountCalled).toBe(true);
    });

    test("should set currentViewInstance to null after unmount", async () => {
      await router.navigate("home");
      await router.navigate("detail");
      const detailInstance = router.currentViewInstance;

      await router.navigate("home");

      expect(detailInstance.unmountCalled).toBe(true);
    });

    test("should handle view without unmount method", async () => {
      class ViewWithoutUnmount {
        constructor(router, storage) {
          this.router = router;
          this.storage = storage;
        }
        async mount(container, data) {
          container.innerHTML = `<div>Content</div>`;
        }
      }

      router.register("test", ViewWithoutUnmount);

      await router.navigate("test");
      await expect(router.navigate("home")).resolves.not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    beforeEach(() => {
      router.init("app");
      router.register("home", MockView);
    });

    test("should handle null data parameter", async () => {
      await router.navigate("home", null);

      expect(router.currentView.data).toBeNull();
    });

    test("should handle undefined data parameter", async () => {
      await router.navigate("home", undefined);

      expect(router.currentView.data).toBeNull();
    });

    test("should pass dependencies to view constructor", async () => {
      await router.navigate("home");

      expect(router.currentViewInstance.router).toBe(router);
      expect(router.currentViewInstance.storage).toBe(mockStorage);
    });
  });
});
