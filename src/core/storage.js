/**
 * Chrome Storage API Wrapper
 * Manages project and API mock data
 */

// Storage key constant (read-only)
const STORAGE_KEY = "mocktail_data";

export class Storage {
  get STORAGE_KEY() {
    return STORAGE_KEY;
  }

  /**
   * Get all data
   */
  async getData() {
    return new Promise((resolve) => {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        resolve(result[STORAGE_KEY] || { projects: [] });
      });
    });
  }

  /**
   * Save all data
   */
  async setData(data) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
    });
  }

  /**
   * Get all projects
   */
  async getProjects() {
    const data = await this.getData();
    return data.projects || [];
  }

  /**
   * Get a specific project
   */
  async getProject(projectId) {
    const projects = await this.getProjects();
    return projects.find((p) => p.id === projectId);
  }

  /**
   * Create a new project
   */
  async createProject(name = "Untitled Project") {
    const data = await this.getData();
    const newProject = {
      id: this.generateId(),
      name,
      createdAt: Date.now(),
      apis: [],
    };
    data.projects.push(newProject);
    await this.setData(data);
    return newProject;
  }

  /**
   * Update a project
   */
  async updateProject(projectId, updates) {
    const data = await this.getData();
    const index = data.projects.findIndex((p) => p.id === projectId);
    if (index !== -1) {
      data.projects[index] = { ...data.projects[index], ...updates };
      await this.setData(data);
      return data.projects[index];
    }
    return null;
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId) {
    const data = await this.getData();
    data.projects = data.projects.filter((p) => p.id !== projectId);
    await this.setData(data);
  }

  /**
   * Get API mocks
   */
  async getAPIs(projectId) {
    const project = await this.getProject(projectId);
    return project ? project.apis : [];
  }

  /**
   * Add an API mock
   */
  async createAPI(projectId, apiData) {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const newAPI = {
      id: this.generateId(),
      url: apiData.url,
      method: apiData.method || "GET",
      response: apiData.response || {},
      enabled: apiData.enabled !== undefined ? apiData.enabled : true,
      createdAt: Date.now(),
    };

    project.apis.push(newAPI);
    await this.updateProject(projectId, { apis: project.apis });
    return newAPI;
  }

  /**
   * Update an API mock
   */
  async updateAPI(projectId, apiId, updates) {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const apiIndex = project.apis.findIndex((api) => api.id === apiId);
    if (apiIndex !== -1) {
      project.apis[apiIndex] = { ...project.apis[apiIndex], ...updates };
      await this.updateProject(projectId, { apis: project.apis });
      return project.apis[apiIndex];
    }
    return null;
  }

  /**
   * Delete an API mock
   */
  async deleteAPI(projectId, apiId) {
    const project = await this.getProject(projectId);
    if (!project) return;

    project.apis = project.apis.filter((api) => api.id !== apiId);
    await this.updateProject(projectId, { apis: project.apis });
  }

  /**
   * Toggle API mock enable/disable
   */
  async toggleAPI(projectId, apiId) {
    const project = await this.getProject(projectId);
    if (!project) return null;

    const api = project.apis.find((api) => api.id === apiId);
    if (api) {
      api.enabled = !api.enabled;
      await this.updateProject(projectId, { apis: project.apis });
      return api;
    }
    return null;
  }

  /**
   * Generate a unique ID
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
