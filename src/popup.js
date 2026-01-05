/**
 * Mocktail Popup
 * Chrome Extension Popup 메인 진입점
 */

import { Router } from "./core/router.js";
import { Storage } from "./core/storage.js";
import { ProjectListView } from "./views/project-list/project-list.js";
import { ProjectDetailView } from "./views/project-detail/project-detail.js";
import { ApiFormView } from "./views/api-form/api-form.js";

// 전역 인스턴스
const storage = new Storage();
const router = new Router();

/**
 * 앱 초기화
 */
async function init() {
  try {
    // 라우터 초기화
    router.init("app");

    // 뷰 등록
    router.register("project-list", new ProjectListView(router, storage));
    router.register("project-detail", new ProjectDetailView(router, storage));
    router.register("api-form", new ApiFormView(router, storage));

    // 프로젝트 목록 화면으로 시작 (프로젝트 없으면 empty state 표시)
    await router.navigate("project-list");
  } catch (error) {
    console.error("앱 초기화 오류:", error);
    document.getElementById("app").innerHTML = `
            <div style="padding: 20px; text-align: center; color: #d32f2f;">
                <p>앱을 시작할 수 없습니다.</p>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">${error.message}</p>
            </div>
        `;
  }
}

// DOM 로드 완료 후 초기화
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
