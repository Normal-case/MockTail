/**
 * Base View Class
 * Base class that all views inherit from
 */

export class View {
  constructor(router, storage) {
    this.router = router;
    this.storage = storage;
    this.container = null;
    this.handlers = new Map(); // Event handler management
  }

  /**
   * Mount the view to a container
   */
  async mount(container, data) {
    this.container = container;
    container.innerHTML = await this.render(data);
    this.attachEvents(data);
  }

  /**
   * Unmount the view and clean up resources
   */
  unmount() {
    // Remove all registered event listeners
    this.handlers.forEach(({ element, event, handler }) => {
      if (element && handler) {
        element.removeEventListener(event, handler);
      }
    });

    // Clear handler map
    this.handlers.clear();

    // Remove container reference
    this.container = null;
  }

  /**
   * Register an event listener and manage it automatically
   * @param {string} elementId - Element ID
   * @param {string} event - Event type (e.g., 'click', 'input')
   * @param {Function} handler - Event handler
   */
  addEventListener(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Element with id "${elementId}" not found`);
      return;
    }

    element.addEventListener(event, handler);

    // Store for later cleanup
    this.handlers.set(`${elementId}-${event}`, {
      element,
      event,
      handler,
    });
  }

  /**
   * Render - must be implemented by subclass
   * @param {Object} data - Data needed for rendering
   * @returns {string} HTML string
   */
  async render(data) {
    throw new Error("render() must be implemented by subclass");
  }

  /**
   * Attach event handlers - implemented by subclass
   * @param {Object} data - Data needed for event handler registration
   */
  attachEvents(data) {
    // Optionally implemented by subclass
  }
}
