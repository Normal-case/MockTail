/**
 * View Class Unit Tests
 * Test cases for base View class functionality
 */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { View } from "../src/core/view.js";

// Concrete View implementation for testing
class TestView extends View {
  async render(data) {
    return `
      <div>
        <h1 id="title">Test View</h1>
        <button id="test-button">Click Me</button>
        <input id="test-input" type="text" />
        <div id="content">${data?.message || "Default Content"}</div>
      </div>
    `;
  }

  attachEvents(data) {
    this.addEventListener("test-button", "click", () => {
      console.log("Button clicked");
    });

    this.addEventListener("test-input", "input", () => {
      console.log("Input changed");
    });
  }
}

// View without attachEvents implementation
class MinimalView extends View {
  async render(data) {
    return `<div>Minimal View</div>`;
  }
}

describe("View Class", () => {
  let view;
  let mockRouter;
  let mockStorage;
  let container;

  beforeEach(() => {
    // Create mocks
    mockRouter = {
      navigate: vi.fn(),
      goBack: vi.fn(),
    };

    mockStorage = {
      getData: vi.fn(),
      setData: vi.fn(),
    };

    // Create view instance
    view = new TestView(mockRouter, mockStorage);

    // Create mock DOM container
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    test("should store router and storage references", () => {
      expect(view.router).toBe(mockRouter);
      expect(view.storage).toBe(mockStorage);
    });

    test("should initialize with null container", () => {
      expect(view.container).toBeNull();
    });

    test("should initialize handlers as empty Map", () => {
      expect(view.handlers).toBeInstanceOf(Map);
      expect(view.handlers.size).toBe(0);
    });
  });

  describe("Mount and Render", () => {
    test("should mount view to container", async () => {
      await view.mount(container);

      expect(view.container).toBe(container);
      expect(container.innerHTML).toContain("Test View");
    });

    test("should call render method on mount", async () => {
      const renderSpy = vi.spyOn(view, "render");

      await view.mount(container);

      expect(renderSpy).toHaveBeenCalledWith(undefined);
    });

    test("should call attachEvents after render", async () => {
      const attachEventsSpy = vi.spyOn(view, "attachEvents");

      await view.mount(container);

      expect(attachEventsSpy).toHaveBeenCalledWith(undefined);
    });

    test("should pass data to render and attachEvents", async () => {
      const testData = { message: "Hello World" };
      const renderSpy = vi.spyOn(view, "render");
      const attachEventsSpy = vi.spyOn(view, "attachEvents");

      await view.mount(container, testData);

      expect(renderSpy).toHaveBeenCalledWith(testData);
      expect(attachEventsSpy).toHaveBeenCalledWith(testData);
      expect(container.innerHTML).toContain("Hello World");
    });

    test("should render HTML to container", async () => {
      await view.mount(container);

      expect(container.querySelector("#title")).toBeTruthy();
      expect(container.querySelector("#test-button")).toBeTruthy();
      expect(container.querySelector("#test-input")).toBeTruthy();
      expect(container.querySelector("#content")).toBeTruthy();
    });

    test("should handle async render", async () => {
      class AsyncView extends View {
        async render(data) {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return `<div>Async Content</div>`;
        }
      }

      const asyncView = new AsyncView(mockRouter, mockStorage);
      await asyncView.mount(container);

      expect(container.innerHTML).toContain("Async Content");
    });
  });

  describe("Unmount and Cleanup", () => {
    test("should remove all event listeners on unmount", async () => {
      await view.mount(container);
      const button = document.getElementById("test-button");
      const removeEventListenerSpy = vi.spyOn(button, "removeEventListener");

      view.unmount();

      expect(removeEventListenerSpy).toHaveBeenCalled();
    });

    test("should clear handlers map on unmount", async () => {
      await view.mount(container);

      expect(view.handlers.size).toBeGreaterThan(0);

      view.unmount();

      expect(view.handlers.size).toBe(0);
    });

    test("should remove container reference on unmount", async () => {
      await view.mount(container);

      view.unmount();

      expect(view.container).toBeNull();
    });

    test("should handle unmount without mount", () => {
      expect(() => {
        view.unmount();
      }).not.toThrow();

      expect(view.container).toBeNull();
      expect(view.handlers.size).toBe(0);
    });

    test("should handle multiple unmount calls", async () => {
      await view.mount(container);

      view.unmount();
      view.unmount();

      expect(view.container).toBeNull();
      expect(view.handlers.size).toBe(0);
    });
  });

  describe("Event Management", () => {
    test("should add event listener to element", async () => {
      await view.mount(container);
      const button = document.getElementById("test-button");

      expect(view.handlers.has("test-button-click")).toBe(true);
    });

    test("should register multiple event listeners", async () => {
      await view.mount(container);

      expect(view.handlers.size).toBeGreaterThan(1);
      expect(view.handlers.has("test-button-click")).toBe(true);
      expect(view.handlers.has("test-input-input")).toBe(true);
    });

    test("should trigger event handler when event occurs", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation();
      await view.mount(container);

      const button = document.getElementById("test-button");
      button.click();

      expect(consoleSpy).toHaveBeenCalledWith("Button clicked");

      consoleSpy.mockRestore();
    });

    test("should warn when element not found", async () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation();
      await view.mount(container);

      view.addEventListener("non-existent", "click", () => {});

      expect(consoleSpy).toHaveBeenCalledWith(
        'Element with id "non-existent" not found',
      );

      consoleSpy.mockRestore();
    });

    test("should store handler information", async () => {
      await view.mount(container);

      const handler = view.handlers.get("test-button-click");

      expect(handler).toBeDefined();
      expect(handler.element).toBeInstanceOf(HTMLElement);
      expect(handler.event).toBe("click");
      expect(handler.handler).toBeInstanceOf(Function);
    });

    test("should support multiple events on same element", async () => {
      class MultiEventView extends View {
        async render() {
          return `<button id="btn">Button</button>`;
        }

        attachEvents() {
          this.addEventListener("btn", "click", () => {});
          this.addEventListener("btn", "mouseover", () => {});
          this.addEventListener("btn", "mouseout", () => {});
        }
      }

      const multiView = new MultiEventView(mockRouter, mockStorage);
      await multiView.mount(container);

      expect(multiView.handlers.size).toBe(3);
      expect(multiView.handlers.has("btn-click")).toBe(true);
      expect(multiView.handlers.has("btn-mouseover")).toBe(true);
      expect(multiView.handlers.has("btn-mouseout")).toBe(true);
    });

    test("should not trigger events after unmount", async () => {
      let clickCount = 0;
      const customHandler = () => {
        clickCount++;
      };

      class CustomView extends View {
        async render() {
          return `<button id="custom-button">Click</button>`;
        }

        attachEvents() {
          this.addEventListener("custom-button", "click", customHandler);
        }
      }

      const customView = new CustomView(mockRouter, mockStorage);
      await customView.mount(container);

      const button = document.getElementById("custom-button");
      button.click();

      expect(clickCount).toBe(1);

      customView.unmount();
      button.click();

      expect(clickCount).toBe(1); // Should still be 1, not 2
    });
  });

  describe("Abstract Methods", () => {
    test("should throw error when render not implemented", async () => {
      class IncompleteView extends View {}

      const incompleteView = new IncompleteView(mockRouter, mockStorage);

      await expect(incompleteView.mount(container)).rejects.toThrow(
        "render() must be implemented by subclass",
      );
    });

    test("should not throw when attachEvents not implemented", async () => {
      const minimalView = new MinimalView(mockRouter, mockStorage);

      await expect(minimalView.mount(container)).resolves.not.toThrow();
    });
  });

  describe("Integration with Subclass", () => {
    test("should complete full lifecycle: mount → render → attachEvents → unmount", async () => {
      const renderSpy = vi.spyOn(view, "render");
      const attachEventsSpy = vi.spyOn(view, "attachEvents");

      // Mount
      await view.mount(container);
      expect(view.container).toBe(container);
      expect(renderSpy).toHaveBeenCalled();
      expect(attachEventsSpy).toHaveBeenCalled();
      expect(view.handlers.size).toBeGreaterThan(0);

      // Unmount
      view.unmount();
      expect(view.container).toBeNull();
      expect(view.handlers.size).toBe(0);
    });

    test("should allow remount after unmount", async () => {
      await view.mount(container);
      view.unmount();

      await view.mount(container);

      expect(view.container).toBe(container);
      expect(container.innerHTML).toContain("Test View");
    });

    test("should use router in subclass", async () => {
      class RouterUsingView extends View {
        async render() {
          return `<button id="nav-btn">Navigate</button>`;
        }

        attachEvents() {
          this.addEventListener("nav-btn", "click", () => {
            this.router.navigate("home");
          });
        }
      }

      const routerView = new RouterUsingView(mockRouter, mockStorage);
      await routerView.mount(container);

      const button = document.getElementById("nav-btn");
      button.click();

      expect(mockRouter.navigate).toHaveBeenCalledWith("home");
    });

    test("should use storage in subclass", async () => {
      class StorageUsingView extends View {
        async render() {
          return `<button id="save-btn">Save</button>`;
        }

        attachEvents() {
          this.addEventListener("save-btn", "click", async () => {
            await this.storage.setData({ test: "data" });
          });
        }
      }

      const storageView = new StorageUsingView(mockRouter, mockStorage);
      await storageView.mount(container);

      const button = document.getElementById("save-btn");
      button.click();

      expect(mockStorage.setData).toHaveBeenCalledWith({ test: "data" });
    });
  });

  describe("Memory Leak Prevention", () => {
    test("should not leak event listeners on repeated mount/unmount", async () => {
      const iterations = 10;

      for (let i = 0; i < iterations; i++) {
        await view.mount(container);
        view.unmount();
      }

      expect(view.handlers.size).toBe(0);
      expect(view.container).toBeNull();
    });

    test("should clean up all references", async () => {
      await view.mount(container);
      const handlersCount = view.handlers.size;

      view.unmount();

      expect(view.handlers.size).toBe(0);
      expect(view.container).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    test("should handle null data", async () => {
      await view.mount(container, null);

      expect(container.innerHTML).toContain("Default Content");
    });

    test("should handle undefined data", async () => {
      await view.mount(container, undefined);

      expect(container.innerHTML).toContain("Default Content");
    });

    test("should handle element removal from DOM", async () => {
      await view.mount(container);
      const button = document.getElementById("test-button");

      // Remove element from DOM
      button.remove();

      // Should not throw error on unmount
      expect(() => {
        view.unmount();
      }).not.toThrow();
    });

    test("should handle missing handler data gracefully", async () => {
      await view.mount(container);

      // Manually corrupt handler data
      view.handlers.set("corrupted", {
        element: null,
        event: "click",
        handler: null,
      });

      expect(() => {
        view.unmount();
      }).not.toThrow();
    });
  });
});
