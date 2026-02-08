/**
 * Mocktail Panel
 * Chrome Extension DevTools Panel main entry point
 */

import { Router } from "./core/router.js";
import { Storage } from "./core/storage.js";
import { ProjectListView } from "./views/project-list/project-list.js";
import { ProjectDetailView } from "./views/project-detail/project-detail.js";
import { ApiFormView } from "./views/api-form/api-form.js";

// Global instances
const storage = new Storage();
const router = new Router({ storage }); // Dependency injection

/**
 * Initialize app
 */
async function init() {
  try {
    // Initialize router
    router.init("app");

    // Register views (classes only, instances created on navigate)
    router.register("project-list", ProjectListView);
    router.register("project-detail", ProjectDetailView);
    router.register("api-form", ApiFormView);

    // Start with project list screen (shows empty state if no projects)
    await router.navigate("project-list");
  } catch (error) {
    console.error("App initialization error:", error);
    document.getElementById("app").innerHTML = `
            <div style="padding: 20px; text-align: center; color: #d32f2f;">
                <p>Failed to start the app.</p>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">${error.message}</p>
            </div>
        `;
  }
}

// Initialize after DOM load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
