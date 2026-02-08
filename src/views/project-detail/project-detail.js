/**
 * Project Detail View
 * Screen showing project details and API list
 */

import { View } from "../../core/view.js";

export class ProjectDetailView extends View {
  constructor(router, storage) {
    super(router, storage);
    this.project = null;
    this.projectId = null;
  }

  async render(data) {
    if (!data || !data.projectId) {
      return '<div class="error">Project not found.</div>';
    }

    this.projectId = data.projectId;
    this.project = await this.storage.getProject(data.projectId);
    if (!this.project) {
      return '<div class="error">Project not found.</div>';
    }

    const apiItems = (this.project.apis || [])
      .map(
        (api) => `
            <div class="api-item ${api.enabled ? "enabled" : "disabled"}" data-api-id="${api.id}">
                <div class="api-info">
                    <div class="api-method ${api.method.toLowerCase()}">${api.method}</div>
                    <div class="api-url">${api.url}</div>
                </div>
                <button class="btn-toggle ${api.enabled ? "active" : ""}" data-api-id="${api.id}">
                    <span class="toggle-icon">${api.enabled ? "✓" : ""}</span>
                </button>
            </div>
        `,
      )
      .join("");

    return `
            <div class="project-detail-view">
                <div class="header">
                    <div class="header-left">
                        <button class="btn-icon" id="back-button">
                            <span class="icon-back">←</span>
                        </button>
                        <h1 class="header-title">${this.project.name}</h1>
                    </div>
                    <div class="header-right">
                        <button class="btn-icon" id="export-project" title="Export">
                            <span>📋</span>
                        </button>
                        <button class="btn-icon" id="add-api">
                            <span class="icon-plus">+</span>
                        </button>
                    </div>
                </div>
                <div class="content">
                    ${
                      !this.project.apis || this.project.apis.length === 0
                        ? `
                        <div class="empty-state">
                            <p class="text-secondary">Add an API Mock</p>
                        </div>
                    `
                        : `
                        <div class="api-list">
                            ${apiItems}
                        </div>
                    `
                    }
                </div>
                <div class="modal-overlay hidden" id="export-modal">
                    <div class="modal">
                        <div class="modal-header">
                            <h2 class="modal-title">Export Project</h2>
                            <button class="btn-icon" id="modal-close">✕</button>
                        </div>
                        <div class="modal-body">
                            <pre class="modal-json" id="export-json"></pre>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-primary" id="copy-clipboard">Copy to Clipboard</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  attachEvents(data) {
    // Back button
    this.addEventListener("back-button", "click", () => {
      this.router.goBack();
    });

    // + button: Add API
    this.addEventListener("add-api", "click", () => {
      this.router.navigate("api-form", {
        projectId: data.projectId,
        mode: "create",
      });
    });

    // API item click: Edit
    const apiItems = document.querySelectorAll(".api-item");
    apiItems.forEach((item) => {
      const handler = (e) => {
        // Exclude toggle button clicks
        if (e.target.closest(".btn-toggle")) {
          return;
        }
        const apiId = item.dataset.apiId;
        this.router.navigate("api-form", {
          projectId: data.projectId,
          apiId,
          mode: "edit",
        });
      };
      item.addEventListener("click", handler);

      // Store handler for cleanup
      this.handlers.set(`api-item-${item.dataset.apiId}`, {
        element: item,
        event: "click",
        handler,
      });
    });

    // Toggle button: Enable/Disable API
    const toggleBtns = document.querySelectorAll(".btn-toggle");
    toggleBtns.forEach((btn) => {
      const handler = async (e) => {
        e.stopPropagation();
        const apiId = btn.dataset.apiId;
        await this.handleToggleAPI(data.projectId, apiId);
      };
      btn.addEventListener("click", handler);

      // Store handler for cleanup
      this.handlers.set(`toggle-btn-${btn.dataset.apiId}`, {
        element: btn,
        event: "click",
        handler,
      });
    });

    // Export button: Show export modal
    this.addEventListener("export-project", "click", () => {
      this.handleExportProject();
    });

    // Modal close button
    this.addEventListener("modal-close", "click", () => {
      this.closeExportModal();
    });

    // Modal overlay click: Close modal
    const overlay = document.getElementById("export-modal");
    if (overlay) {
      const overlayHandler = (e) => {
        if (e.target === overlay) {
          this.closeExportModal();
        }
      };
      overlay.addEventListener("click", overlayHandler);
      this.handlers.set("modal-overlay", {
        element: overlay,
        event: "click",
        handler: overlayHandler,
      });
    }

    // Copy to clipboard button
    this.addEventListener("copy-clipboard", "click", () => {
      this.handleCopyToClipboard();
    });
  }

  getExportData() {
    return {
      name: this.project.name,
      apis: (this.project.apis || []).map((api) => ({
        url: api.url,
        method: api.method,
        response: api.response,
        enabled: api.enabled,
      })),
    };
  }

  handleExportProject() {
    const exportData = this.getExportData();
    const json = JSON.stringify(exportData, null, 2);
    const jsonEl = document.getElementById("export-json");
    const modal = document.getElementById("export-modal");

    if (jsonEl && modal) {
      jsonEl.textContent = json;
      modal.classList.remove("hidden");
    }
  }

  closeExportModal() {
    const modal = document.getElementById("export-modal");
    if (modal) {
      modal.classList.add("hidden");
    }
  }

  handleCopyToClipboard() {
    const exportData = this.getExportData();
    const json = JSON.stringify(exportData, null, 2);
    const btn = document.getElementById("copy-clipboard");

    if (btn) {
      btn.disabled = true;
    }

    const textarea = document.createElement("textarea");
    textarea.value = json;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      document.execCommand("copy");
      copied = true;
    } catch (err) {
      console.error("Failed to copy:", err);
    } finally {
      document.body.removeChild(textarea);
    }

    if (btn) {
      if (copied) {
        const originalText = btn.textContent;
        const originalBg = btn.style.backgroundColor;
        btn.textContent = "Copied!";
        btn.style.backgroundColor = "var(--color-success)";
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.backgroundColor = originalBg;
          btn.disabled = false;
        }, 2000);
      } else {
        btn.disabled = false;
      }
    }
  }

  async handleToggleAPI(projectId, apiId) {
    const api = await this.storage.toggleAPI(projectId, apiId);
    if (api) {
      // Update only the API item
      const apiItem = document.querySelector(
        `.api-item[data-api-id="${apiId}"]`,
      );
      const toggleBtn = document.querySelector(
        `.btn-toggle[data-api-id="${apiId}"]`,
      );

      if (apiItem && toggleBtn) {
        if (api.enabled) {
          apiItem.classList.remove("disabled");
          apiItem.classList.add("enabled");
          toggleBtn.classList.add("active");
          toggleBtn.querySelector(".toggle-icon").textContent = "✓";
        } else {
          apiItem.classList.remove("enabled");
          apiItem.classList.add("disabled");
          toggleBtn.classList.remove("active");
          toggleBtn.querySelector(".toggle-icon").textContent = "";
        }
      }
    }
  }
}
