/**
 * Storage 클래스 단위 테스트
 * TDD 방식으로 작성된 테스트 케이스들
 */
import { describe, test, expect, beforeEach, vi } from "vitest";
import { Storage } from "../src/core/storage.js";

describe("Storage 클래스", () => {
  let storage;
  let mockData;

  beforeEach(() => {
    // 각 테스트 전에 Storage 인스턴스와 Mock 데이터 초기화
    storage = new Storage();
    mockData = { projects: [] };

    // Chrome Storage API Mock 구현
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      callback({ mocktail_data: mockData });
    });

    chrome.storage.local.set.mockImplementation((data, callback) => {
      mockData = data.mocktail_data;
      if (callback) callback();
    });

    // Mock 호출 기록 초기화
    vi.clearAllMocks();
  });

  describe("데이터 저장 및 불러오기", () => {
    test("getData()는 전체 데이터를 가져온다", async () => {
      mockData = { projects: [{ id: "1", name: "Test" }] };

      const data = await storage.getData();

      expect(data).toEqual({ projects: [{ id: "1", name: "Test" }] });
    });

    test("데이터가 없으면 빈 projects 배열을 반환한다", async () => {
      chrome.storage.local.get.mockImplementation((keys, callback) => {
        callback({});
      });

      const data = await storage.getData();

      expect(data).toEqual({ projects: [] });
    });

    test("setData()는 데이터를 저장한다", async () => {
      const testData = { projects: [{ id: "1", name: "Test" }] };

      await storage.setData(testData);

      expect(chrome.storage.local.set).toHaveBeenCalledWith(
        { mocktail_data: testData },
        expect.any(Function),
      );
    });
  });

  describe("프로젝트 생성", () => {
    test("새 프로젝트를 생성하면 기본값이 설정된다", async () => {
      const project = await storage.createProject("테스트 프로젝트");

      expect(project).toMatchObject({
        name: "테스트 프로젝트",
        apis: [],
      });
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(typeof project.createdAt).toBe("number");
    });

    test('이름을 지정하지 않으면 "Untitled Project"가 된다', async () => {
      const project = await storage.createProject();

      expect(project.name).toBe("Untitled Project");
    });

    test("생성된 프로젝트는 Storage에 저장된다", async () => {
      await storage.createProject("프로젝트 1");
      const projects = await storage.getProjects();

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe("프로젝트 1");
    });

    test("여러 프로젝트를 생성할 수 있다", async () => {
      await storage.createProject("프로젝트 1");
      await storage.createProject("프로젝트 2");
      await storage.createProject("프로젝트 3");

      const projects = await storage.getProjects();

      expect(projects).toHaveLength(3);
      expect(projects.map((p) => p.name)).toEqual([
        "프로젝트 1",
        "프로젝트 2",
        "프로젝트 3",
      ]);
    });
  });

  describe("프로젝트 조회", () => {
    test("getProjects()는 모든 프로젝트를 반환한다", async () => {
      await storage.createProject("프로젝트 1");
      await storage.createProject("프로젝트 2");

      const projects = await storage.getProjects();

      expect(projects).toHaveLength(2);
    });

    test("존재하는 프로젝트를 ID로 찾을 수 있다", async () => {
      const created = await storage.createProject("찾을 프로젝트");
      const found = await storage.getProject(created.id);

      expect(found).toEqual(created);
    });

    test("존재하지 않는 ID는 undefined를 반환한다", async () => {
      const result = await storage.getProject("non-existent-id");

      expect(result).toBeUndefined();
    });

    test("프로젝트가 없으면 빈 배열을 반환한다", async () => {
      const projects = await storage.getProjects();

      expect(projects).toEqual([]);
    });
  });

  describe("프로젝트 업데이트", () => {
    test("프로젝트 이름을 변경할 수 있다", async () => {
      const project = await storage.createProject("원래 이름");
      const updated = await storage.updateProject(project.id, {
        name: "새로운 이름",
      });

      expect(updated.name).toBe("새로운 이름");
      expect(updated.id).toBe(project.id);
    });

    test("부분 업데이트가 가능하다", async () => {
      const project = await storage.createProject("프로젝트");
      const originalCreatedAt = project.createdAt;

      const updated = await storage.updateProject(project.id, {
        name: "수정됨",
      });

      expect(updated.name).toBe("수정됨");
      expect(updated.createdAt).toBe(originalCreatedAt); // 기존 값 유지
      expect(updated.apis).toEqual([]); // 기존 값 유지
    });

    test("존재하지 않는 프로젝트 업데이트 시 null을 반환한다", async () => {
      const result = await storage.updateProject("fake-id", { name: "test" });

      expect(result).toBeNull();
    });
  });

  describe("프로젝트 삭제", () => {
    test("프로젝트를 삭제할 수 있다", async () => {
      const project = await storage.createProject("삭제할 프로젝트");
      await storage.deleteProject(project.id);

      const projects = await storage.getProjects();
      expect(projects).toHaveLength(0);
    });

    test("특정 프로젝트만 삭제된다", async () => {
      const project1 = await storage.createProject("프로젝트 1");
      const project2 = await storage.createProject("프로젝트 2");
      const project3 = await storage.createProject("프로젝트 3");

      await storage.deleteProject(project2.id);

      const projects = await storage.getProjects();
      expect(projects).toHaveLength(2);
      expect(projects.map((p) => p.id)).toEqual([project1.id, project3.id]);
    });

    test("존재하지 않는 프로젝트 삭제는 에러 없이 처리된다", async () => {
      await expect(
        storage.deleteProject("non-existent-id"),
      ).resolves.toBeUndefined();
    });
  });

  describe("API Mock 추가", () => {
    let projectId;

    beforeEach(async () => {
      const project = await storage.createProject("API 테스트");
      projectId = project.id;
    });

    test("API Mock을 추가할 수 있다", async () => {
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

    test("method 기본값은 GET이다", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/data",
      });

      expect(api.method).toBe("GET");
    });

    test("response 기본값은 빈 객체이다", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/data",
        method: "POST",
      });

      expect(api.response).toEqual({});
    });

    test("enabled 기본값은 true이다", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });

      expect(api.enabled).toBe(true);
    });

    test("enabled를 false로 설정할 수 있다", async () => {
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
        enabled: false,
      });

      expect(api.enabled).toBe(false);
    });

    test("생성된 API는 프로젝트에 추가된다", async () => {
      await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(1);
    });

    test("여러 API를 추가할 수 있다", async () => {
      await storage.createAPI(projectId, { url: "https://api.test.com/users" });
      await storage.createAPI(projectId, { url: "https://api.test.com/posts" });
      await storage.createAPI(projectId, {
        url: "https://api.test.com/comments",
      });

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(3);
    });

    test("존재하지 않는 프로젝트에 API 추가 시 null 반환", async () => {
      const result = await storage.createAPI("fake-id", {
        url: "https://test.com",
      });

      expect(result).toBeNull();
    });
  });

  describe("API Mock 조회", () => {
    let projectId;

    beforeEach(async () => {
      const project = await storage.createProject("API 테스트");
      projectId = project.id;
    });

    test("getAPIs()는 프로젝트의 모든 API를 반환한다", async () => {
      await storage.createAPI(projectId, { url: "https://api.test.com/users" });
      await storage.createAPI(projectId, { url: "https://api.test.com/posts" });

      const apis = await storage.getAPIs(projectId);

      expect(apis).toHaveLength(2);
      expect(apis[0].url).toBe("https://api.test.com/users");
      expect(apis[1].url).toBe("https://api.test.com/posts");
    });

    test("API가 없으면 빈 배열을 반환한다", async () => {
      const apis = await storage.getAPIs(projectId);

      expect(apis).toEqual([]);
    });

    test("존재하지 않는 프로젝트의 API 조회 시 빈 배열 반환", async () => {
      const apis = await storage.getAPIs("non-existent-id");

      expect(apis).toEqual([]);
    });
  });

  describe("API Mock 업데이트", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API 테스트");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
        method: "GET",
        response: { data: "old" },
      });
      apiId = api.id;
    });

    test("API URL을 변경할 수 있다", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        url: "https://api.test.com/new-users",
      });

      expect(updated.url).toBe("https://api.test.com/new-users");
    });

    test("API method를 변경할 수 있다", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        method: "POST",
      });

      expect(updated.method).toBe("POST");
    });

    test("API response를 변경할 수 있다", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        response: { data: "new" },
      });

      expect(updated.response).toEqual({ data: "new" });
    });

    test("부분 업데이트가 가능하다", async () => {
      const updated = await storage.updateAPI(projectId, apiId, {
        method: "POST",
      });

      expect(updated.method).toBe("POST");
      expect(updated.url).toBe("https://api.test.com/users"); // 기존 값 유지
      expect(updated.response).toEqual({ data: "old" }); // 기존 값 유지
    });

    test("존재하지 않는 프로젝트의 API 업데이트 시 null 반환", async () => {
      const result = await storage.updateAPI("fake-project", apiId, {
        method: "POST",
      });

      expect(result).toBeNull();
    });

    test("존재하지 않는 API 업데이트 시 null 반환", async () => {
      const result = await storage.updateAPI(projectId, "fake-api", {
        method: "POST",
      });

      expect(result).toBeNull();
    });
  });

  describe("API Mock 삭제", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API 테스트");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });
      apiId = api.id;
    });

    test("API를 삭제할 수 있다", async () => {
      await storage.deleteAPI(projectId, apiId);

      const apis = await storage.getAPIs(projectId);
      expect(apis).toHaveLength(0);
    });

    test("특정 API만 삭제된다", async () => {
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

    test("존재하지 않는 프로젝트의 API 삭제는 에러 없이 처리된다", async () => {
      await expect(
        storage.deleteAPI("fake-project", apiId),
      ).resolves.toBeUndefined();
    });
  });

  describe("API Mock 토글", () => {
    let projectId;
    let apiId;

    beforeEach(async () => {
      const project = await storage.createProject("API 테스트");
      projectId = project.id;
      const api = await storage.createAPI(projectId, {
        url: "https://api.test.com/users",
      });
      apiId = api.id;
    });

    test("API를 비활성화할 수 있다", async () => {
      const toggled = await storage.toggleAPI(projectId, apiId);

      expect(toggled.enabled).toBe(false);
    });

    test("비활성화된 API를 다시 활성화할 수 있다", async () => {
      await storage.toggleAPI(projectId, apiId);
      const toggled = await storage.toggleAPI(projectId, apiId);

      expect(toggled.enabled).toBe(true);
    });

    test("토글 상태가 저장된다", async () => {
      await storage.toggleAPI(projectId, apiId);

      const apis = await storage.getAPIs(projectId);
      expect(apis[0].enabled).toBe(false);
    });

    test("존재하지 않는 프로젝트의 API 토글 시 null 반환", async () => {
      const result = await storage.toggleAPI("fake-project", apiId);

      expect(result).toBeNull();
    });

    test("존재하지 않는 API 토글 시 null 반환", async () => {
      const result = await storage.toggleAPI(projectId, "fake-api");

      expect(result).toBeNull();
    });
  });

  describe("ID 생성", () => {
    test("generateId()는 문자열을 반환한다", () => {
      const id = storage.generateId();

      expect(typeof id).toBe("string");
    });

    test("생성된 ID는 타임스탬프-랜덤문자열 형식이다", () => {
      const id = storage.generateId();

      expect(id).toMatch(/^\d+-[a-z0-9]+$/);
    });

    test("여러 ID를 생성하면 모두 다르다", () => {
      const id1 = storage.generateId();
      const id2 = storage.generateId();
      const id3 = storage.generateId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    test("100개의 ID를 빠르게 생성해도 중복되지 않는다", () => {
      const ids = new Set();

      for (let i = 0; i < 100; i++) {
        ids.add(storage.generateId());
      }

      expect(ids.size).toBe(100); // 모두 고유해야 함
    });
  });
});
