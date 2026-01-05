/**
 * 화면 전환을 관리하는 라우터
 */

export class Router {
    constructor() {
        this.views = new Map();
        this.currentView = null;
        this.history = [];
        this.container = null;
    }

    /**
     * 라우터 초기화
     */
    init(containerId = 'app') {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }
    }

    /**
     * 뷰 등록
     */
    register(name, viewInstance) {
        this.views.set(name, viewInstance);
    }

    /**
     * 화면 전환
     */
    async navigate(viewName, data = null) {
        const view = this.views.get(viewName);
        if (!view) {
            console.error(`View "${viewName}" not found`);
            return;
        }

        // 현재 뷰 언마운트
        if (this.currentView) {
            const currentViewInstance = this.views.get(this.currentView.name);
            if (currentViewInstance && currentViewInstance.unmount) {
                currentViewInstance.unmount();
            }
        }

        // 히스토리에 추가
        if (this.currentView) {
            this.history.push(this.currentView);
        }

        // 새 뷰 마운트
        this.currentView = { name: viewName, data };
        await view.mount(this.container, data);
    }

    /**
     * 이전 화면으로 돌아가기
     */
    async goBack() {
        if (this.history.length === 0) {
            return;
        }

        const previous = this.history.pop();
        
        // 현재 뷰 언마운트
        if (this.currentView) {
            const currentViewInstance = this.views.get(this.currentView.name);
            if (currentViewInstance && currentViewInstance.unmount) {
                currentViewInstance.unmount();
            }
        }

        // 이전 뷰 마운트 (히스토리에 추가하지 않음)
        this.currentView = previous;
        const view = this.views.get(previous.name);
        await view.mount(this.container, previous.data);
    }

    /**
     * 현재 뷰 정보 가져오기
     */
    getCurrentView() {
        return this.currentView;
    }

    /**
     * 히스토리 초기화
     */
    clearHistory() {
        this.history = [];
    }

    /**
     * 특정 화면으로 이동하면서 히스토리 초기화
     */
    async reset(viewName, data = null) {
        this.clearHistory();
        await this.navigate(viewName, data);
    }
}
