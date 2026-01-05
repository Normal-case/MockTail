/**
 * Project List View
 * 프로젝트 목록을 보여주는 화면
 */

export class ProjectListView {
  constructor(router, storage) {
    this.router = router;
    this.storage = storage;
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
        `
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

  async mount(container) {
    container.innerHTML = await this.render();
    this.attachEvents();
  }

  attachEvents() {
    // + 버튼: 새 프로젝트 추가
    const addBtn = document.getElementById("add-project");
    if (addBtn) {
      addBtn.addEventListener("click", () => this.handleAddProject());
    }

    // 첫 프로젝트 만들기 버튼 (empty state)
    const createFirstBtn = document.getElementById("create-first-project");
    if (createFirstBtn) {
      createFirstBtn.addEventListener("click", () => this.handleAddProject());
    }

    // 프로젝트 아이템 클릭: 상세 화면으로 이동
    const projectItems = document.querySelectorAll(".project-item");
    projectItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        // input을 클릭한 경우는 제외
        if (e.target.classList.contains("project-name")) {
          return;
        }
        const projectId = item.dataset.projectId;
        this.router.navigate("project-detail", { projectId });
      });
    });

    // 프로젝트 이름 더블클릭: 편집 모드
    const projectNames = document.querySelectorAll(".project-name");
    projectNames.forEach((input) => {
      input.addEventListener("dblclick", (e) => {
        e.stopPropagation();
        this.handleEditProjectName(input);
      });

      input.addEventListener("blur", () => {
        this.handleSaveProjectName(input);
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          input.blur();
        } else if (e.key === "Escape") {
          this.handleCancelEdit(input);
        }
      });
    });
  }

  async handleAddProject() {
    const project = await this.storage.createProject("Untitled Project");
    // 화면 새로고침
    await this.mount(this.router.container);
    // 새로 만든 프로젝트 이름을 편집 모드로
    this.editingProjectId = project.id;
    await this.mount(this.router.container);
    const input = document.querySelector(
      `input[data-project-id="${project.id}"]`
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

  unmount() {
    // 이벤트 리스너 정리
  }
}
