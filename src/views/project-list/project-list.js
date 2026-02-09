/**
 * Project List View
 * Screen showing the list of projects
 */

import { View } from "../../core/view.js";

export class ProjectListView extends View {
  constructor(router, storage) {
    super(router, storage);
    this.projects = [];
    this.editingProjectId = null;
  }

  async render() {
    this.projects = await this.storage.getProjects();

    const projectItems = this.projects
      .map(
        (project) => `
            <div class="project-item" data-project-id="${project.id}">
                <div class="project-icon">📁</div>
                <input 
                    type="text" 
                    class="project-name ${
                      this.editingProjectId === project.id ? "editing" : ""
                    }" 
                    value="${project.name}"
                    data-project-id="${project.id}"
                    ${this.editingProjectId === project.id ? "" : "readonly"}
                />
                <div class="project-meta">
                    <span class="api-count">${
                      project.apis?.length || 0
                    } APIs</span>
                    <button class="btn-action btn-edit" data-project-id="${project.id}" title="Edit">✏️</button>
                    <button class="btn-action btn-delete" data-project-id="${project.id}" title="Delete">🗑️</button>
                </div>
            </div>
        `,
      )
      .join("");

    return `
            <div class="project-list-view">
                <div class="header">
                    <h1 class="header-title">Projects</h1>
                    <div class="header-right">
                        <button class="btn-icon" id="import-project" title="Import">
                            <image src="icons/import.png" alt="import" width="20" height="20" />
                        </button>
                        <button class="btn-icon" id="add-project">
                            <span class="icon-plus">+</span>
                        </button>
                    </div>
                </div>
                <div class="content">
                    ${
                      this.projects.length === 0
                        ? `
                        <div class="empty-state-large">
                            <div class="empty-icon">📦</div>
                            <h2 class="empty-title">No Projects</h2>
                            <p class="empty-description">Create a new project to start mocking APIs</p>
                            <button class="btn btn-primary" id="create-first-project">
                                <span class="icon-plus">+</span>
                                Create First Project
                            </button>
                        </div>
                    `
                        : `
                        <div class="project-list">
                            ${projectItems}
                        </div>
                    `
                    }
                </div>
                <div class="modal-overlay hidden" id="import-modal">
                    <div class="modal">
                        <div class="modal-header">
                            <h2 class="modal-title">Import Project</h2>
                            <button class="btn-icon" id="import-modal-close">✕</button>
                        </div>
                        <div class="modal-body">
                            <textarea class="modal-textarea" id="import-json" placeholder='Paste exported JSON here...'></textarea>
                            <p class="import-error hidden" id="import-error"></p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="import-save">Import</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  attachEvents() {
    // + button: Add new project
    this.addEventListener("add-project", "click", () =>
      this.handleAddProject(),
    );

    // Create first project button (empty state)
    this.addEventListener("create-first-project", "click", () =>
      this.handleAddProject(),
    );

    // Project item click: Navigate to detail screen
    const projectItems = document.querySelectorAll(".project-item");
    projectItems.forEach((item) => {
      const handler = (e) => {
        // Exclude clicks on edit/delete buttons
        if (
          e.target.classList.contains("btn-action") ||
          e.target.closest(".btn-action")
        ) {
          return;
        }
        // Exclude clicks on project name in edit mode
        if (
          e.target.classList.contains("project-name") &&
          e.target.classList.contains("editing")
        ) {
          return;
        }
        const projectId = item.dataset.projectId;
        this.router.navigate("project-detail", { projectId });
      };
      item.addEventListener("click", handler);

      // Store handler for cleanup
      this.handlers.set(`project-item-${item.dataset.projectId}`, {
        element: item,
        event: "click",
        handler,
      });
    });

    // Edit button click: Enter edit mode
    const editButtons = document.querySelectorAll(".btn-edit");
    editButtons.forEach((btn) => {
      const handler = (e) => {
        e.stopPropagation();
        const projectId = btn.dataset.projectId;
        const input = document.querySelector(
          `input.project-name[data-project-id="${projectId}"]`,
        );
        if (input) {
          this.handleEditProjectName(input);
        }
      };
      btn.addEventListener("click", handler);
      this.handlers.set(`btn-edit-${btn.dataset.projectId}`, {
        element: btn,
        event: "click",
        handler,
      });
    });

    // Delete button click: Delete project
    const deleteButtons = document.querySelectorAll(".btn-delete");
    deleteButtons.forEach((btn) => {
      const handler = (e) => {
        e.stopPropagation();
        this.handleDeleteProject(btn.dataset.projectId);
      };
      btn.addEventListener("click", handler);
      this.handlers.set(`btn-delete-${btn.dataset.projectId}`, {
        element: btn,
        event: "click",
        handler,
      });
    });

    // Import button: Show import modal
    this.addEventListener("import-project", "click", () => {
      const modal = document.getElementById("import-modal");
      const input = document.getElementById("import-json");
      const error = document.getElementById("import-error");
      if (modal) modal.classList.remove("hidden");
      if (input) input.value = "";
      if (error) error.classList.add("hidden");
    });

    // Import modal close button
    this.addEventListener("import-modal-close", "click", () => {
      const modal = document.getElementById("import-modal");
      if (modal) modal.classList.add("hidden");
    });

    // Import modal overlay click
    const importOverlay = document.getElementById("import-modal");
    if (importOverlay) {
      const overlayHandler = (e) => {
        if (e.target === importOverlay) {
          importOverlay.classList.add("hidden");
        }
      };
      importOverlay.addEventListener("click", overlayHandler);
      this.handlers.set("import-overlay", {
        element: importOverlay,
        event: "click",
        handler: overlayHandler,
      });
    }

    // Import save button
    this.addEventListener("import-save", "click", () => {
      this.handleImportProject();
    });

    // Project name input: blur and keydown handlers
    const projectNames = document.querySelectorAll(".project-name");
    projectNames.forEach((input) => {
      const blurHandler = () => {
        this.handleSaveProjectName(input);
      };

      const keydownHandler = (e) => {
        if (e.isComposing) return; // Skip during IME composition
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          this.handleCancelEdit(input);
        }
      };

      input.addEventListener("blur", blurHandler);
      input.addEventListener("keydown", keydownHandler);

      // Store handlers for cleanup
      const projectId = input.dataset.projectId;
      this.handlers.set(`project-name-blur-${projectId}`, {
        element: input,
        event: "blur",
        handler: blurHandler,
      });
      this.handlers.set(`project-name-keydown-${projectId}`, {
        element: input,
        event: "keydown",
        handler: keydownHandler,
      });
    });
  }

  async handleAddProject() {
    const project = await this.storage.createProject("Untitled Project");
    // Refresh screen
    await this.mount(this.router.container);
    // Set new project name to edit mode
    this.editingProjectId = project.id;
    await this.mount(this.router.container);
    const input = document.querySelector(
      `input[data-project-id="${project.id}"]`,
    );
    if (input) {
      input.removeAttribute("readonly");
      input.classList.add("editing");
      input.focus();
      input.select();
    }
  }

  async handleImportProject() {
    const input = document.getElementById("import-json");
    const errorEl = document.getElementById("import-error");
    const jsonStr = input?.value.trim();

    if (!jsonStr) {
      this.showImportError(errorEl, "Please paste JSON data.");
      return;
    }

    let importData;
    try {
      importData = JSON.parse(jsonStr);
    } catch {
      this.showImportError(errorEl, "Invalid JSON format.");
      return;
    }

    if (!importData.name || typeof importData.name !== "string") {
      this.showImportError(errorEl, 'Missing required field: "name".');
      return;
    }

    if (importData.apis && !Array.isArray(importData.apis)) {
      this.showImportError(errorEl, '"apis" must be an array.');
      return;
    }

    // Create project with imported data
    const project = await this.storage.createProject(importData.name);

    if (importData.apis && importData.apis.length > 0) {
      const apis = importData.apis.map((api) => ({
        id: this.storage.generateId(),
        url: api.url || "",
        method: api.method || "GET",
        response: api.response || {},
        enabled: api.enabled !== undefined ? api.enabled : true,
        createdAt: Date.now(),
      }));
      await this.storage.updateProject(project.id, { apis });
    }

    // Close modal and refresh
    const modal = document.getElementById("import-modal");
    if (modal) modal.classList.add("hidden");
    await this.mount(this.router.container);
  }

  showImportError(el, message) {
    if (el) {
      el.textContent = message;
      el.classList.remove("hidden");
    }
  }

  async handleDeleteProject(projectId) {
    const project = this.projects.find((p) => p.id === projectId);
    if (!project) return;

    if (confirm(`Delete "${project.name}"?`)) {
      await this.storage.deleteProject(projectId);
      await this.mount(this.router.container);
    }
  }

  handleEditProjectName(input) {
    this.editingProjectId = input.dataset.projectId;
    input.removeAttribute("readonly");
    input.classList.add("editing");
    input.focus();
    input.select();
  }

  async handleSaveProjectName(input) {
    const projectId = input.dataset.projectId;
    const newName = input.value.trim();

    if (newName) {
      await this.storage.updateProject(projectId, { name: newName });
    }

    this.editingProjectId = null;
    input.setAttribute("readonly", "true");
    input.classList.remove("editing");
  }

  handleCancelEdit(input) {
    const projectId = input.dataset.projectId;
    const project = this.projects.find((p) => p.id === projectId);
    if (project) {
      input.value = project.name;
    }
    this.editingProjectId = null;
    input.setAttribute("readonly", "true");
    input.classList.remove("editing");
    input.blur();
  }
}
