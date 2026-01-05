/**
 * Chrome Storage API 래퍼
 * 프로젝트와 API Mock 데이터를 관리합니다
 */

export class Storage {
    constructor() {
        this.STORAGE_KEY = 'mocktail_data';
    }

    /**
     * 전체 데이터 가져오기
     */
    async getData() {
        return new Promise((resolve) => {
            chrome.storage.local.get([this.STORAGE_KEY], (result) => {
                resolve(result[this.STORAGE_KEY] || { projects: [] });
            });
        });
    }

    /**
     * 전체 데이터 저장하기
     */
    async setData(data) {
        return new Promise((resolve) => {
            chrome.storage.local.set({ [this.STORAGE_KEY]: data }, resolve);
        });
    }

    /**
     * 모든 프로젝트 가져오기
     */
    async getProjects() {
        const data = await this.getData();
        return data.projects || [];
    }

    /**
     * 특정 프로젝트 가져오기
     */
    async getProject(projectId) {
        const projects = await this.getProjects();
        return projects.find(p => p.id === projectId);
    }

    /**
     * 새 프로젝트 생성
     */
    async createProject(name = 'Untitled Project') {
        const data = await this.getData();
        const newProject = {
            id: this.generateId(),
            name,
            createdAt: Date.now(),
            apis: []
        };
        data.projects.push(newProject);
        await this.setData(data);
        return newProject;
    }

    /**
     * 프로젝트 업데이트
     */
    async updateProject(projectId, updates) {
        const data = await this.getData();
        const index = data.projects.findIndex(p => p.id === projectId);
        if (index !== -1) {
            data.projects[index] = { ...data.projects[index], ...updates };
            await this.setData(data);
            return data.projects[index];
        }
        return null;
    }

    /**
     * 프로젝트 삭제
     */
    async deleteProject(projectId) {
        const data = await this.getData();
        data.projects = data.projects.filter(p => p.id !== projectId);
        await this.setData(data);
    }

    /**
     * API Mock 가져오기
     */
    async getAPIs(projectId) {
        const project = await this.getProject(projectId);
        return project ? project.apis : [];
    }

    /**
     * API Mock 추가
     */
    async createAPI(projectId, apiData) {
        const project = await this.getProject(projectId);
        if (!project) return null;

        const newAPI = {
            id: this.generateId(),
            url: apiData.url,
            method: apiData.method || 'GET',
            response: apiData.response || {},
            enabled: apiData.enabled !== undefined ? apiData.enabled : true,
            createdAt: Date.now()
        };

        project.apis.push(newAPI);
        await this.updateProject(projectId, { apis: project.apis });
        return newAPI;
    }

    /**
     * API Mock 업데이트
     */
    async updateAPI(projectId, apiId, updates) {
        const project = await this.getProject(projectId);
        if (!project) return null;

        const apiIndex = project.apis.findIndex(api => api.id === apiId);
        if (apiIndex !== -1) {
            project.apis[apiIndex] = { ...project.apis[apiIndex], ...updates };
            await this.updateProject(projectId, { apis: project.apis });
            return project.apis[apiIndex];
        }
        return null;
    }

    /**
     * API Mock 삭제
     */
    async deleteAPI(projectId, apiId) {
        const project = await this.getProject(projectId);
        if (!project) return;

        project.apis = project.apis.filter(api => api.id !== apiId);
        await this.updateProject(projectId, { apis: project.apis });
    }

    /**
     * API Mock 활성화/비활성화 토글
     */
    async toggleAPI(projectId, apiId) {
        const project = await this.getProject(projectId);
        if (!project) return null;

        const api = project.apis.find(api => api.id === apiId);
        if (api) {
            api.enabled = !api.enabled;
            await this.updateProject(projectId, { apis: project.apis });
            return api;
        }
        return null;
    }

    /**
     * 고유 ID 생성
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
