/**
 * Storage Class Unit Tests
 * Test cases written in TDD style
 */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { Storage } from "../src/core/storage.js";

describe("Storage Class", () => {
  let storage;
  let mockData;

  beforeEach(() => {
    // Initialize Storage instance and mock data before each test
    storage = new Storage();
    mockData = { projects: [] };

    // Mock Chrome Storage API implementation
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ [storage.STORAGE_KEY]: mockData });
    });

    chrome.storage.local.set.mockImplementation((data, callback) => {
      mockData = data[storage.STORAGE_KEY];
      if (callback) callback();
    });

    // Clear mock call history
    vi.clearAllMocks();
  });

  describe("Data Storage and Retrieval", () => {
    test("should get all data with getData()", async () => {
      mockData = { projects: [{ id: "1", name: "Test" }] };

      const data = await storage.getData();

      expect(data).toEqual({ projects: [{ id: "1", name: "Test" }] });
    });

    test("should return empty projects array when no data exists", async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const data = await storage.getData();

      expect(data).toEqual({ projects: [] });
    });

    test("should save data with setData()", async () => {
      const testData = { projects: [{ id: "1", name: "Test" }] };

      await storage.setData(testData);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { mocktail_data: testData },
        expect.any(Function),
      );
    });
  });

  describe("Project Creation", () => {
    test("should create a new project with default values", async () => {
      const project = await storage.createProject("Test Project");

      expect(project).toMatchObject({
        name: "Test Project",
        apis: [],
      });
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(typeof project.createdAt).toBe("number");
    });

    test('should use "Untitled Project" as default name when no name is provided', async () => {
      const project = await storage.createProject();

      expect(project.name).toBe("Untitled Project");
    });

    test("should save created project to storage", async () => {
      await storage.createProject("Project 1");
      const projects = await storage.getProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("Project 1");
    });

    test("should be able to create multiple projects", async () => {
      await storage.createProject("Project 1");
      await storage.createProject("Project 2");
      await storage.createProject("Project 3");

      const projects = await storage.getProjects();

      expect(projects).toHaveLength(3);
      expect(projects.map((p) => p.name)).toEqual([
        "Project 1",
        "Project 2",
        "Project 3",
      ]);
    });
  });

  describe("Project Retrieval", () => {
    test("should return all projects with getProjects()", async () => {
      await storage.createProject("Project 1");
      await storage.createProject("Project 2");

      const projects = await storage.getProjects();

      expect(projects).toHaveLength(2);
    });

    test("should find an existing project by ID", async () => {
      const created = await storage.createProject("Target Project");
      const found = await storage.getProject(created.id);

      expect(found).toEqual(created);
    });

    test("should return undefined for non-existent ID", async () => {
      const result = await storage.getProject("non-existent-id");

      expect(result).toBeUndefined();
    });

    test("should return empty array when no projects exist", async () => {
      const projects = await storage.getProjects();

      expect(projects).toEqual([]);
    });
  });

  describe("Project Update", () => {
    test("should update project name", async () => {
      const project = await storage.createProject("Original Name");
      const updated = await storage.updateProject(project.id, {
        name: "New Name",
      });

      expect(updated.name).toBe("New Name");
      expect(updated.id).toBe(project.id);
    });

    test("should support partial updates", async () => {
      const project = await storage.createProject("Project");
      const originalCreatedAt = project.createdAt;

      const updated = await storage.updateProject(project.id, {
        name: "Updated",
      });

      expect(updated.name).toBe("Updated");
      expect(updated.createdAt).toBe(originalCreatedAt); // Preserve existing value
      expect(updated.apis).toEqual([]); // Preserve existing value
    });

    test("should return null when updating non-existent project", async () => {
      const result = await storage.updateProject("fake-id", { name: "test" });

      expect(result).toBeNull();
    });
  });

  describe("Project Deletion", () => {
    test("should delete a project", async () => {
      const project = await storage.createProject("Project to Delete");
      await storage.deleteProject(project.id);

      const projects = await storage.getProjects();
      expect(projects).toHaveLength(0);
    });

    test("should only delete the specified project", async () => {
      const project1 = await storage.createProject("Project 1");
      const project2 = await storage.createProject("Project 2");
      const project3 = await storage.createProject("Project 3");

      await storage.deleteProject(project2.id);

      const projects = await storage.getProjects();
      expect(projects).toHaveLength(2);
      expect(projects.map((p) => p.id)).toEqual([project1.id, project3.id]);
    });

    test("should handle deletion of non-existent project without error", async () => {
      await expect(
        storage.deleteProject("non-existent-id"),
      ).resolves.toBeUndefined();
    });
  });

  describe("API Mock Creation", () => {
    let projectId;

    beforeEach(async () => {
      const project = await storage.createProject("API Test");
      projectId = project.id;
    });

    test("should create an API mock", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
        method: "GET",
        response: { data: "test" },
      });

      expect(api).toMatchObject({
        url: "https://api.test.com/users",
        method: "GET",
        response: { data: "test" },
        enabled: true,
      });
      expect(api.id).toBeDefined();
      expect(api.createdAt).toBeDefined();
    });

    test("should default method to GET", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/data",
      });

      expect(api.method).toBe("GET");
    });

    test("should default response to empty object", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/data",
        method: "POST",
      });

      expect(api.response).toEqual({});
    });

    test("should default enabled to true", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });

      expect(api.enabled).toBe(true);
    });

    test("should be able to set enabled to false", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
        enabled: false,
      });

      expect(api.enabled).toBe(false);
    });

    test("should add created API to project", async () => {
      await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(1);
    });

    test("should be able to add multiple APIs", async () => {
      await storage.createAPI(projectId, { url: "https://api.test.com/users" });
      await storage.createAPI(projectId, { url: "https://api.test.com/posts" });
      await storage.createAPI(projectId, {
        url: "https://api.test.com/comments",
      });

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(3);
    });

    test("should return null when adding API to non-existent project", async () => {
      const result = await storage.createAPI("fake-id", {
        url: "https://test.com",
      });

      expect(result).toBeNull();
    });
  });

  describe("API Mock Retrieval", () => {
    let projectId;

    beforeEach(async () => {
      const project = await storage.createProject("API Test");
      projectId = project.id;
    });

    test("should return all APIs of a project with getAPIs()", async () => {
      await storage.createAPI(projectId, { url: "https://api.test.com/users" });
      await storage.createAPI(projectId, { url: "https://api.test.com/posts" });

      const apis = await storage.getAPIs(projectId);

      expect(apis).toHaveLength(2);
      expect(apis[0].url).toBe("https://api.test.com/users");
      expect(apis[1].url).toBe("https://api.test.com/posts");
    });

    test("should return empty array when no APIs exist", async () => {
      const apis = await storage.getAPIs(projectId);

      expect(apis).toEqual([]);
    });

    test("should return empty array for non-existent project", async () => {
      const apis = await storage.getAPIs("non-existent-id");

      expect(apis).toEqual([]);
    });
  });

  describe("API Mock Update", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API Test");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
        method: "GET",
        response: { data: "old" },
      });
      apiId = api.id;
    });

    test("should update API URL", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        url: "https://api.test.com/new-users",
      });

      expect(updated.url).toBe("https://api.test.com/new-users");
    });

    test("should update API method", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        method: "POST",
      });

      expect(updated.method).toBe("POST");
    });

    test("should update API response", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        response: { data: "new" },
      });

      expect(updated.response).toEqual({ data: "new" });
    });

    test("should support partial updates", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        method: "POST",
      });

      expect(updated.method).toBe("POST");
      expect(updated.url).toBe("https://api.test.com/users"); // Preserve existing value
      expect(updated.response).toEqual({ data: "old" }); // Preserve existing value
    });

    test("should return null when updating API of non-existent project", async () => {
      const result = await storage.updateAPI("fake-project", apiId, {
        method: "POST",
      });

      expect(result).toBeNull();
    });

    test("should return null when updating non-existent API", async () => {
      const result = await storage.updateAPI(projectId, "fake-api", {
        method: "POST",
      });

      expect(result).toBeNull();
    });
  });

  describe("API Mock Deletion", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API Test");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });
      apiId = api.id;
    });

    test("should delete an API", async () => {
      await storage.deleteAPI(projectId, apiId);

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(0);
    });

    test("should only delete the specified API", async () => {
      const api2 = await storage.createAPI(projectId, {
        url: "https://api.test.com/posts",
      });
      const api3 = await storage.createAPI(projectId, {
        url: "https://api.test.com/comments",
      });

      await storage.deleteAPI(projectId, api2.id);

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(2);
      expect(apis.map((a) => a.id)).toEqual([apiId, api3.id]);
    });

    test("should handle deletion of API from non-existent project without error", async () => {
      await expect(
        storage.deleteAPI("fake-project", apiId),
      ).resolves.toBeUndefined();
    });
  });

  describe("API Mock Toggle", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API Test");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });
      apiId = api.id;
    });

    test("should disable an API", async () => {
      const toggled = await storage.toggleAPI(projectId, apiId);

      expect(toggled.enabled).toBe(false);
    });

    test("should re-enable a disabled API", async () => {
      await storage.toggleAPI(projectId, apiId);
      const toggled = await storage.toggleAPI(projectId, apiId);

      expect(toggled.enabled).toBe(true);
    });

    test("should persist toggle state", async () => {
      await storage.toggleAPI(projectId, apiId);

      const apis = await storage.getAPIs(projectId);
      expect(apis[0].enabled).toBe(false);
    });

    test("should return null when toggling API of non-existent project", async () => {
      const result = await storage.toggleAPI("fake-project", apiId);

      expect(result).toBeNull();
    });

    test("should return null when toggling non-existent API", async () => {
      const result = await storage.toggleAPI(projectId, "fake-api");

      expect(result).toBeNull();
    });
  });

  describe("ID Generation", () => {
    test("should return a string from generateId()", () => {
      const id = storage.generateId();

      expect(typeof id).toBe("string");
    });

    test("should generate ID in timestamp-random format", () => {
      const id = storage.generateId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    test("should generate unique IDs", () => {
      const id1 = storage.generateId();
      const id2 = storage.generateId();
      const id3 = storage.generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    test("should generate 100 unique IDs without collision", () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        ids.add(storage.generateId());
      }

      expect(ids.size).toBe(100); // All should be unique
    });
  });
});
