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
                </div>
            </div>
        `,
      )
      .join("");

    return `
            <div class="project-list-view">
                <div class="header">
                    <h1 class="header-title">프로젝트</h1>
                    <button class="btn-icon" id="add-project">
                        <span class="icon-plus">+</span>
                    </button>
                </div>
                <div class="content">
                    ${
                      this.projects.length === 0
                        ? `
                        <div class="empty-state-large">
                            <div class="empty-icon">📦</div>
                            <h2 class="empty-title">프로젝트가 없습니다</h2>
                            <p class="empty-description">새 프로젝트를 만들어 API Mock을 시작하세요</p>
                            <button class="btn btn-primary" id="create-first-project">
                                <span class="icon-plus">+</span>
                                첫 프로젝트 만들기
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
        // Exclude clicks on input
        if (e.target.classList.contains("project-name")) {
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

    // Project name double-click: Edit mode
    const projectNames = document.querySelectorAll(".project-name");
    projectNames.forEach((input) => {
      const dblclickHandler = (e) => {
        e.stopPropagation();
        this.handleEditProjectName(input);
      };

      const blurHandler = () => {
        this.handleSaveProjectName(input);
      };

      const keydownHandler = (e) => {
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          this.handleCancelEdit(input);
        }
      };

      input.addEventListener("dblclick", dblclickHandler);
      input.addEventListener("blur", blurHandler);
      input.addEventListener("keydown", keydownHandler);

      // Store handlers for cleanup
      const projectId = input.dataset.projectId;
      this.handlers.set(`project-name-dblclick-${projectId}`, {
        element: input,
        event: "dblclick",
        handler: dblclickHandler,
      });
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
