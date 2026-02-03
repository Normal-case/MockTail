/**
 * Router
 * Manages screen transitions
 */

export class Router {
  constructor(dependencies = {}) {
    this.views = new Map(); // Store ViewClass (not instances)
    this.currentView = null; // { name, data } information only
    this.currentViewInstance = null; // Currently active view instance
    this.history = [];
    this.container = null;
    this.dependencies = dependencies; // Dependencies needed for view creation (router, storage, etc.)
  }

  /**
   * Initialize router
   */
  init(containerId = "app") {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }
  }

  /**
   * Register view (register class, not instance)
   */
  register(name, ViewClass) {
    this.views.set(name, ViewClass);
  }

  /**
   * Navigate to screen
   */
  async navigate(viewName, data = null) {
    const ViewClass = this.views.get(viewName);
    if (!ViewClass) {
      console.error(`View "${viewName}" not found`);
      return;
    }

    // Unmount current view and clean up instance
    if (this.currentViewInstance) {
      if (this.currentViewInstance.unmount) {
        this.currentViewInstance.unmount();
      }
      this.currentViewInstance = null; // Remove reference for GC
    }

    // Add to history
    if (this.currentView) {
      this.history.push(this.currentView);
    }

    // Create new view instance and mount
    this.currentView = { name: viewName, data };
    this.currentViewInstance = new ViewClass(this, this.dependencies.storage);
    await this.currentViewInstance.mount(this.container, data);
  }

  /**
   * Go back to previous screen
   */
  async goBack() {
    if (this.history.length === 0) {
      return;
    }

    const previous = this.history.pop();

    // Unmount current view and clean up instance
    if (this.currentViewInstance) {
      if (this.currentViewInstance.unmount) {
        this.currentViewInstance.unmount();
      }
      this.currentViewInstance = null; // Remove reference for GC
    }

    // Create previous view instance and mount (don't add to history)
    this.currentView = previous;
    const ViewClass = this.views.get(previous.name);
    this.currentViewInstance = new ViewClass(this, this.dependencies.storage);
    await this.currentViewInstance.mount(this.container, previous.data);
  }

  /**
   * Get current view information
   */
  getCurrentView() {
    return this.currentView;
  }

  /**
   * Clear history
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Navigate to specific screen while clearing history
   */
  async reset(viewName, data = null) {
    this.clearHistory();
    await this.navigate(viewName, data);
  }
}
