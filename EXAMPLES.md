# 🍹 Mocktail 사용 예시

이 문서에서는 Mocktail을 활용한 다양한 실제 사용 사례를 소개합니다.

## 📚 목차

1. [기본 사용법](#기본-사용법)
2. [REST API 모킹](#rest-api-모킹)
3. [GraphQL API 모킹](#graphql-api-모킹)
4. [에러 시나리오 테스트](#에러-시나리오-테스트)
5. [인증/권한 테스트](#인증권한-테스트)
6. [페이지네이션 테스트](#페이지네이션-테스트)
7. [실시간 데이터 모킹](#실시간-데이터-모킹)

---

## 기본 사용법

### 간단한 JSON 응답 교체

**시나리오**: `/api/status` 엔드포인트의 응답을 항상 "온라인"으로 변경

```json
{
  "name": "항상 온라인",
  "urlPattern": "/api/status",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "status": "online",
    "message": "서버가 정상 작동 중입니다"
  }
}
```

---

## REST API 모킹

### 1. 사용자 목록 API

```json
{
  "name": "Mock User List",
  "urlPattern": "https://jsonplaceholder.typicode.com/users",
  "matchType": "exact",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "users": [
      {
        "id": 1,
        "name": "홍길동",
        "email": "hong@example.com",
        "username": "hongkd",
        "phone": "010-1234-5678"
      },
      {
        "id": 2,
        "name": "김영희",
        "email": "kim@example.com",
        "username": "kimyh",
        "phone": "010-9876-5432"
      }
    ],
    "total": 2,
    "page": 1
  }
}
```

### 2. 특정 사용자 상세 정보

```json
{
  "name": "Mock User Detail",
  "urlPattern": "/api/users/\\d+",
  "matchType": "regex",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "id": 1,
    "name": "테스트 유저",
    "email": "test@example.com",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00Z",
    "profile": {
      "bio": "개발자입니다",
      "location": "서울",
      "website": "https://example.com"
    }
  }
}
```

### 3. 게시글 목록

```json
{
  "name": "Mock Posts",
  "urlPattern": "/api/posts",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "posts": [
      {
        "id": 1,
        "title": "Mocktail 사용법",
        "content": "Mocktail은 API를 쉽게 모킹할 수 있는 도구입니다.",
        "author": "홍길동",
        "createdAt": "2024-01-15T10:30:00Z",
        "likes": 42,
        "comments": 7
      },
      {
        "id": 2,
        "title": "크롬 확장 프로그램 개발",
        "content": "Manifest V3로 확장 프로그램을 만들어봅시다.",
        "author": "김영희",
        "createdAt": "2024-01-14T09:15:00Z",
        "likes": 28,
        "comments": 3
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

---

## GraphQL API 모킹

### GraphQL 쿼리 응답

```json
{
  "name": "Mock GraphQL User Query",
  "urlPattern": "https://api.example.com/graphql",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "data": {
      "user": {
        "id": "1",
        "name": "홍길동",
        "email": "hong@example.com",
        "posts": [
          {
            "id": "101",
            "title": "첫 번째 포스트",
            "content": "안녕하세요"
          },
          {
            "id": "102",
            "title": "두 번째 포스트",
            "content": "반갑습니다"
          }
        ]
      }
    }
  }
}
```

---

## 에러 시나리오 테스트

### 1. 서버 에러 (500)

```json
{
  "name": "Force 500 Error",
  "urlPattern": "/api/users",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 500,
  "enabled": true,
  "mockData": {
    "error": "Internal Server Error",
    "message": "서버에서 오류가 발생했습니다",
    "code": "SERVER_ERROR"
  }
}
```

### 2. 인증 실패 (401)

```json
{
  "name": "Force 401 Unauthorized",
  "urlPattern": "/api/protected",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 401,
  "enabled": true,
  "mockData": {
    "error": "Unauthorized",
    "message": "인증이 필요합니다",
    "code": "AUTH_REQUIRED"
  }
}
```

### 3. 권한 부족 (403)

```json
{
  "name": "Force 403 Forbidden",
  "urlPattern": "/api/admin",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 403,
  "enabled": true,
  "mockData": {
    "error": "Forbidden",
    "message": "권한이 없습니다",
    "code": "PERMISSION_DENIED"
  }
}
```

### 4. 리소스 없음 (404)

```json
{
  "name": "Force 404 Not Found",
  "urlPattern": "/api/users/999",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 404,
  "enabled": true,
  "mockData": {
    "error": "Not Found",
    "message": "사용자를 찾을 수 없습니다",
    "code": "USER_NOT_FOUND"
  }
}
```

### 5. 유효성 검사 실패 (422)

```json
{
  "name": "Validation Error",
  "urlPattern": "/api/users",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 422,
  "enabled": true,
  "mockData": {
    "error": "Validation Error",
    "message": "입력 데이터가 올바르지 않습니다",
    "errors": {
      "email": ["이메일 형식이 올바르지 않습니다"],
      "password": ["비밀번호는 8자 이상이어야 합니다"]
    }
  }
}
```

---

## 인증/권한 테스트

### 1. 로그인 성공

```json
{
  "name": "Login Success",
  "urlPattern": "/api/auth/login",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token",
    "refreshToken": "refresh-token-12345",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "name": "홍길동",
      "email": "hong@example.com",
      "role": "admin",
      "avatar": "https://i.pravatar.cc/150?img=1"
    }
  }
}
```

### 2. 로그인 실패

```json
{
  "name": "Login Failed",
  "urlPattern": "/api/auth/login",
  "matchType": "contains",
  "actionType": "replace",
  "statusCode": 401,
  "enabled": false,
  "mockData": {
    "success": false,
    "error": "Invalid Credentials",
    "message": "이메일 또는 비밀번호가 올바르지 않습니다"
  }
}
```

### 3. 토큰 갱신

```json
{
  "name": "Refresh Token",
  "urlPattern": "/api/auth/refresh",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "token": "new-access-token-67890",
    "refreshToken": "new-refresh-token-67890",
    "expiresIn": 3600
  }
}
```

### 4. 관리자 권한 부여

```json
{
  "name": "Force Admin Role",
  "urlPattern": "/api/me",
  "matchType": "contains",
  "actionType": "merge",
  "enabled": true,
  "mockData": {
    "role": "admin",
    "permissions": [
      "read",
      "write",
      "delete",
      "admin"
    ]
  }
}
```

---

## 페이지네이션 테스트

### 1. 첫 페이지

```json
{
  "name": "Page 1",
  "urlPattern": "/api/posts?page=1",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "data": [
      {"id": 1, "title": "Post 1"},
      {"id": 2, "title": "Post 2"},
      {"id": 3, "title": "Post 3"}
    ],
    "pagination": {
      "page": 1,
      "perPage": 3,
      "total": 10,
      "totalPages": 4,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### 2. 마지막 페이지

```json
{
  "name": "Last Page",
  "urlPattern": "/api/posts?page=4",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "data": [
      {"id": 10, "title": "Post 10"}
    ],
    "pagination": {
      "page": 4,
      "perPage": 3,
      "total": 10,
      "totalPages": 4,
      "hasNext": false,
      "hasPrev": true
    }
  }
}
```

---

## 실시간 데이터 모킹

### 1. 알림 목록

```json
{
  "name": "Notifications",
  "urlPattern": "/api/notifications",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "notifications": [
      {
        "id": 1,
        "type": "message",
        "title": "새 메시지",
        "message": "홍길동님이 메시지를 보냈습니다",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "type": "like",
        "title": "좋아요",
        "message": "김영희님이 게시글을 좋아합니다",
        "read": true,
        "createdAt": "2024-01-14T15:20:00Z"
      }
    ],
    "unreadCount": 1
  }
}
```

### 2. 실시간 통계

```json
{
  "name": "Real-time Stats",
  "urlPattern": "/api/stats",
  "matchType": "contains",
  "actionType": "replace",
  "enabled": true,
  "mockData": {
    "users": {
      "total": 1234,
      "online": 56,
      "new": 12
    },
    "posts": {
      "total": 5678,
      "today": 23
    },
    "revenue": {
      "today": 123456,
      "month": 3456789
    }
  }
}
```

---

## 디버깅 정보 추가

### 모든 API 응답에 디버그 정보 추가

```json
{
  "name": "Add Debug Info",
  "urlPattern": "api.",
  "matchType": "contains",
  "actionType": "merge",
  "enabled": true,
  "mockData": {
    "_debug": {
      "interceptedBy": "Mocktail",
      "timestamp": "2024-01-15T10:30:00Z",
      "isMocked": true
    }
  }
}
```

---

## 팁과 트릭

### 1. 여러 규칙 조합하기

- 일반적인 규칙 (모든 API에 적용)
- 특정 규칙 (특정 엔드포인트에만 적용)
- 우선순위를 고려하여 규칙 배치

### 2. 정규식 활용

```
/api/users/\d+        # /api/users/1, /api/users/123 매칭
/api/(posts|comments) # posts 또는 comments 매칭
```

### 3. 개발 워크플로우

1. 실제 API 호출로 시작
2. 필요한 경우 Mocktail로 응답 수정
3. 다양한 시나리오 테스트
4. 규칙 내보내기로 팀원과 공유

---

**더 많은 예시가 필요하신가요? [GitHub Issues](https://github.com/yourusername/mocktail/issues)에 요청해주세요!**


