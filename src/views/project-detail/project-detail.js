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
      return '<div class="error">프로젝트를 찾을 수 없습니다.</div>';
    }

    this.projectId = data.projectId;
    this.project = await this.storage.getProject(data.projectId);
    if (!this.project) {
      return '<div class="error">프로젝트를 찾을 수 없습니다.</div>';
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
                    <button class="btn-icon" id="add-api">
                        <span class="icon-plus">+</span>
                    </button>
                </div>
                <div class="content">
                    ${
                      !this.project.apis || this.project.apis.length === 0
                        ? `
                        <div class="empty-state">
                            <p class="text-secondary">API Mock을 추가하세요</p>
                        </div>
                    `
                        : `
                        <div class="api-list">
                            ${apiItems}
                        </div>
                    `
                    }
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
