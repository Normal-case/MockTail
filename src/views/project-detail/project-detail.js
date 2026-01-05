/**
 * Project Detail View
 * 프로젝트 상세 정보 및 API 목록을 보여주는 화면
 */

export class ProjectDetailView {
    constructor(router, storage) {
        this.router = router;
        this.storage = storage;
        this.project = null;
    }

    async render(data) {
        if (!data || !data.projectId) {
            return '<div class="error">프로젝트를 찾을 수 없습니다.</div>';
        }

        this.project = await this.storage.getProject(data.projectId);
        if (!this.project) {
            return '<div class="error">프로젝트를 찾을 수 없습니다.</div>';
        }

        const apiItems = (this.project.apis || []).map(api => `
            <div class="api-item ${api.enabled ? 'enabled' : 'disabled'}" data-api-id="${api.id}">
                <div class="api-info">
                    <div class="api-method ${api.method.toLowerCase()}">${api.method}</div>
                    <div class="api-url">${api.url}</div>
                </div>
                <button class="btn-toggle ${api.enabled ? 'active' : ''}" data-api-id="${api.id}">
                    <span class="toggle-icon">${api.enabled ? '✓' : ''}</span>
                </button>
            </div>
        `).join('');

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
                    ${!this.project.apis || this.project.apis.length === 0 ? `
                        <div class="empty-state">
                            <p class="text-secondary">API Mock을 추가하세요</p>
                        </div>
                    ` : `
                        <div class="api-list">
                            ${apiItems}
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    async mount(container, data) {
        container.innerHTML = await this.render(data);
        this.attachEvents(data);
    }

    attachEvents(data) {
        // 뒤로가기 버튼
        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.goBack();
            });
        }

        // + 버튼: API 추가
        const addApiBtn = document.getElementById('add-api');
        if (addApiBtn) {
            addApiBtn.addEventListener('click', () => {
                this.router.navigate('api-form', { 
                    projectId: data.projectId,
                    mode: 'create'
                });
            });
        }

        // API 아이템 클릭: 편집
        const apiItems = document.querySelectorAll('.api-item');
        apiItems.forEach(item => {
            item.addEventListener('click', (e) => {
                // 토글 버튼 클릭은 제외
                if (e.target.closest('.btn-toggle')) {
                    return;
                }
                const apiId = item.dataset.apiId;
                this.router.navigate('api-form', { 
                    projectId: data.projectId,
                    apiId,
                    mode: 'edit'
                });
            });
        });

        // 토글 버튼: API 활성화/비활성화
        const toggleBtns = document.querySelectorAll('.btn-toggle');
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const apiId = btn.dataset.apiId;
                await this.handleToggleAPI(data.projectId, apiId);
            });
        });
    }

    async handleToggleAPI(projectId, apiId) {
        const api = await this.storage.toggleAPI(projectId, apiId);
        if (api) {
            // 해당 API 아이템만 업데이트
            const apiItem = document.querySelector(`.api-item[data-api-id="${apiId}"]`);
            const toggleBtn = document.querySelector(`.btn-toggle[data-api-id="${apiId}"]`);
            
            if (apiItem && toggleBtn) {
                if (api.enabled) {
                    apiItem.classList.remove('disabled');
                    apiItem.classList.add('enabled');
                    toggleBtn.classList.add('active');
                    toggleBtn.querySelector('.toggle-icon').textContent = '✓';
                } else {
                    apiItem.classList.remove('enabled');
                    apiItem.classList.add('disabled');
                    toggleBtn.classList.remove('active');
                    toggleBtn.querySelector('.toggle-icon').textContent = '';
                }
            }
        }
    }

    unmount() {
        // 이벤트 리스너 정리
    }
}
