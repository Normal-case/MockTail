/**
 * API Form View
 * API Mock을 추가/편집하는 화면
 */

export class ApiFormView {
    constructor(router, storage) {
        this.router = router;
        this.storage = storage;
        this.mode = 'create'; // 'create' or 'edit'
        this.projectId = null;
        this.apiId = null;
        this.api = null;
    }

    async render(data) {
        if (!data || !data.projectId) {
            return '<div class="error">잘못된 접근입니다.</div>';
        }

        this.projectId = data.projectId;
        this.mode = data.mode || 'create';
        this.apiId = data.apiId;

        // 편집 모드일 경우 기존 API 데이터 로드
        if (this.mode === 'edit' && this.apiId) {
            const project = await this.storage.getProject(this.projectId);
            this.api = project?.apis.find(api => api.id === this.apiId);
            if (!this.api) {
                return '<div class="error">API를 찾을 수 없습니다.</div>';
            }
        }

        const isEdit = this.mode === 'edit';
        const method = this.api?.method || 'GET';
        const url = this.api?.url || '';
        const response = this.api?.response 
            ? JSON.stringify(this.api.response, null, 2) 
            : '{\n  "message": "Hello, Mock!"\n}';

        return `
            <div class="api-form-view">
                <div class="header">
                    <div class="header-left">
                        <button class="btn-icon" id="back-button">
                            <span class="icon-back">←</span>
                        </button>
                        <h1 class="header-title">${isEdit ? 'API 수정' : 'API 추가'}</h1>
                    </div>
                </div>
                <div class="content">
                    <form id="api-form" class="api-form">
                        <div class="input-group">
                            <label class="input-label">HTTP Method</label>
                            <select class="input" id="method-select" required>
                                <option value="GET" ${method === 'GET' ? 'selected' : ''}>GET</option>
                                <option value="POST" ${method === 'POST' ? 'selected' : ''}>POST</option>
                                <option value="PUT" ${method === 'PUT' ? 'selected' : ''}>PUT</option>
                                <option value="PATCH" ${method === 'PATCH' ? 'selected' : ''}>PATCH</option>
                                <option value="DELETE" ${method === 'DELETE' ? 'selected' : ''}>DELETE</option>
                            </select>
                        </div>

                        <div class="input-group">
                            <label class="input-label">API URL</label>
                            <input 
                                type="url" 
                                class="input" 
                                id="url-input" 
                                placeholder="https://api.example.com/users"
                                value="${url}"
                                required
                            />
                        </div>

                        <div class="input-group">
                            <label class="input-label">Mock Response (JSON)</label>
                            <textarea 
                                class="textarea" 
                                id="response-input" 
                                placeholder='{"message": "Hello, Mock!"}'
                                required
                            >${response}</textarea>
                            <div class="input-hint" id="json-hint"></div>
                        </div>

                        <div class="form-actions">
                            ${isEdit ? `
                                <button type="button" class="btn btn-secondary" id="delete-button">
                                    삭제
                                </button>
                            ` : ''}
                            <div style="flex: 1;"></div>
                            <button type="button" class="btn btn-secondary" id="cancel-button">
                                취소
                            </button>
                            <button type="submit" class="btn btn-primary">
                                ${isEdit ? '수정' : '추가'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    async mount(container, data) {
        container.innerHTML = await this.render(data);
        this.attachEvents();
    }

    attachEvents() {
        // 뒤로가기 버튼
        const backBtn = document.getElementById('back-button');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.router.goBack();
            });
        }

        // 취소 버튼
        const cancelBtn = document.getElementById('cancel-button');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.router.goBack();
            });
        }

        // 삭제 버튼
        const deleteBtn = document.getElementById('delete-button');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDelete();
            });
        }

        // 폼 제출
        const form = document.getElementById('api-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmit();
            });
        }

        // JSON 유효성 검사
        const responseInput = document.getElementById('response-input');
        if (responseInput) {
            responseInput.addEventListener('input', () => {
                this.validateJSON(responseInput.value);
            });
        }
    }

    validateJSON(jsonString) {
        const hint = document.getElementById('json-hint');
        if (!hint) return true;

        try {
            JSON.parse(jsonString);
            hint.textContent = '✓ 유효한 JSON 형식입니다';
            hint.className = 'input-hint success';
            return true;
        } catch (e) {
            hint.textContent = '⚠ JSON 형식이 올바르지 않습니다: ' + e.message;
            hint.className = 'input-hint error';
            return false;
        }
    }

    async handleSubmit() {
        const method = document.getElementById('method-select').value;
        const url = document.getElementById('url-input').value.trim();
        const responseText = document.getElementById('response-input').value.trim();

        // URL 유효성 검사
        if (!url) {
            alert('URL을 입력해주세요.');
            return;
        }

        // JSON 유효성 검사
        let response;
        try {
            response = JSON.parse(responseText);
        } catch (e) {
            alert('JSON 형식이 올바르지 않습니다.');
            return;
        }

        const apiData = { method, url, response };

        try {
            if (this.mode === 'edit' && this.apiId) {
                await this.storage.updateAPI(this.projectId, this.apiId, apiData);
            } else {
                await this.storage.createAPI(this.projectId, apiData);
            }
            
            // 프로젝트 상세 화면으로 돌아가기
            this.router.goBack();
        } catch (error) {
            console.error('API 저장 오류:', error);
            alert('저장 중 오류가 발생했습니다.');
        }
    }

    async handleDelete() {
        if (!confirm('정말 삭제하시겠습니까?')) {
            return;
        }

        try {
            await this.storage.deleteAPI(this.projectId, this.apiId);
            this.router.goBack();
        } catch (error) {
            console.error('API 삭제 오류:', error);
            alert('삭제 중 오류가 발생했습니다.');
        }
    }

    unmount() {
        // 이벤트 리스너 정리
    }
}
