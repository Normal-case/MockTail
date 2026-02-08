/**
 * API Form View
 * Screen for adding/editing API Mocks
 */

import { View } from "../../core/view.js";

export class ApiFormView extends View {
  constructor(router, storage) {
    super(router, storage);
    this.mode = "create"; // 'create' or 'edit'
    this.projectId = null;
    this.apiId = null;
    this.api = null;
  }

  async render(data) {
    if (!data || !data.projectId) {
      return '<div class="error">Invalid access.</div>';
    }

    this.projectId = data.projectId;
    this.mode = data.mode || "create";
    this.apiId = data.apiId;

    // Load existing API data in edit mode
    if (this.mode === "edit" && this.apiId) {
      const project = await this.storage.getProject(this.projectId);
      this.api = project?.apis.find((api) => api.id === this.apiId);
      if (!this.api) {
        return '<div class="error">API not found.</div>';
      }
    }

    const isEdit = this.mode === "edit";
    const method = this.api?.method || "GET";
    const url = this.api?.url || "";
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
                        <h1 class="header-title">${isEdit ? "Edit API" : "Add API"}</h1>
                    </div>
                </div>
                <div class="content">
                    <form id="api-form" class="api-form">
                        <div class="input-group">
                            <label class="input-label">HTTP Method</label>
                            <select class="input" id="method-select" required>
                                <option value="GET" ${method === "GET" ? "selected" : ""}>GET</option>
                                <option value="POST" ${method === "POST" ? "selected" : ""}>POST</option>
                                <option value="PUT" ${method === "PUT" ? "selected" : ""}>PUT</option>
                                <option value="PATCH" ${method === "PATCH" ? "selected" : ""}>PATCH</option>
                                <option value="DELETE" ${method === "DELETE" ? "selected" : ""}>DELETE</option>
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
                            ${
                              isEdit
                                ? `
                                <button type="button" class="btn btn-secondary" id="delete-button">
                                    Delete
                                </button>
                            `
                                : ""
                            }
                            <div style="flex: 1;"></div>
                            <button type="button" class="btn btn-secondary" id="cancel-button">
                                Cancel
                            </button>
                            <button type="submit" class="btn btn-primary">
                                ${isEdit ? "Save" : "Add"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
  }

  attachEvents() {
    // Back button
    this.addEventListener("back-button", "click", () => {
      this.router.goBack();
    });

    // Cancel button
    this.addEventListener("cancel-button", "click", () => {
      this.router.goBack();
    });

    // Delete button (only in edit mode)
    this.addEventListener("delete-button", "click", () => {
      this.handleDelete();
    });

    // Form submission
    this.addEventListener("api-form", "submit", (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // JSON validation
    const responseInput = document.getElementById("response-input");
    if (responseInput) {
      this.addEventListener("response-input", "input", () => {
        this.validateJSON(responseInput.value);
      });
    }
  }

  validateJSON(jsonString) {
    const hint = document.getElementById("json-hint");
    if (!hint) return true;

    try {
      JSON.parse(jsonString);
      hint.textContent = "✓ Valid JSON";
      hint.className = "input-hint success";
      return true;
    } catch (e) {
      hint.textContent = "⚠ Invalid JSON: " + e.message;
      hint.className = "input-hint error";
      return false;
    }
  }

  async handleSubmit() {
    const method = document.getElementById("method-select").value;
    const url = document.getElementById("url-input").value.trim();
    const responseText = document.getElementById("response-input").value.trim();

    // URL validation
    if (!url) {
      alert("Please enter a URL.");
      return;
    }

    // JSON validation
    let response;
    try {
      response = JSON.parse(responseText);
    } catch (e) {
      alert("Invalid JSON format.");
      return;
    }

    const apiData = { method, url, response };

    try {
      if (this.mode === "edit" && this.apiId) {
        await this.storage.updateAPI(this.projectId, this.apiId, apiData);
      } else {
        await this.storage.createAPI(this.projectId, apiData);
      }

      // Return to project detail screen
      this.router.goBack();
    } catch (error) {
      console.error("API save error:", error);
      alert("Failed to save.");
    }
  }

  async handleDelete() {
    if (!confirm("Are you sure you want to delete this API?")) {
      return;
    }

    try {
      await this.storage.deleteAPI(this.projectId, this.apiId);
      this.router.goBack();
    } catch (error) {
      console.error("API delete error:", error);
      alert("Failed to delete.");
    }
  }
}
