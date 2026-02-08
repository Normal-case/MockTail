# 🍹 Mocktail Usage Examples

This document provides practical examples for using Mocktail in real-world scenarios.

## 📚 Table of Contents

1. [Basic Usage](#basic-usage)
2. [REST API Mocking](#rest-api-mocking)
3. [Error Scenario Testing](#error-scenario-testing)
4. [Authentication Testing](#authentication-testing)
5. [Pagination Testing](#pagination-testing)
6. [Real-time Data Mocking](#real-time-data-mocking)
7. [Import/Export Workflow](#importexport-workflow)
8. [Tips & Tricks](#tips--tricks)

---

## Basic Usage

### Creating Your First Mock

1. Open Chrome DevTools (F12) → Go to the **Mocktail** tab
2. Click **+** to create a new project (e.g., "My App")
3. Click on the project to open it
4. Click **+** to add an API mock
5. Fill in the form:
   - **Method**: GET
   - **URL**: `https://api.example.com/status`
   - **Response**:

```json
{
  "status": "online",
  "message": "Server is running normally"
}
```

6. Click **Add** — the mock is now active!

### Project JSON Structure (for Import)

When importing a project, use this format:

```json
{
  "name": "My App",
  "apis": [
    {
      "url": "https://api.example.com/status",
      "method": "GET",
      "response": {
        "status": "online",
        "message": "Server is running normally"
      },
      "enabled": true
    }
  ]
}
```

---

## REST API Mocking

### 1. User List API

```json
{
  "name": "User List Project",
  "apis": [
    {
      "url": "https://jsonplaceholder.typicode.com/users",
      "method": "GET",
      "response": {
        "users": [
          {
            "id": 1,
            "name": "John Doe",
            "email": "john@example.com",
            "username": "johnd",
            "phone": "555-1234"
          },
          {
            "id": 2,
            "name": "Jane Smith",
            "email": "jane@example.com",
            "username": "janes",
            "phone": "555-5678"
          }
        ],
        "total": 2,
        "page": 1
      },
      "enabled": true
    }
  ]
}
```

### 2. User Detail API

```json
{
  "url": "https://api.example.com/users/1",
  "method": "GET",
  "response": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com",
    "avatar": "https://i.pravatar.cc/150?img=1",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00Z",
    "profile": {
      "bio": "Software developer",
      "location": "San Francisco",
      "website": "https://example.com"
    }
  },
  "enabled": true
}
```

### 3. Blog Posts API

```json
{
  "url": "https://api.example.com/posts",
  "method": "GET",
  "response": {
    "posts": [
      {
        "id": 1,
        "title": "Getting Started with Mocktail",
        "content": "Mocktail makes it easy to mock API responses.",
        "author": "John Doe",
        "createdAt": "2024-01-15T10:30:00Z",
        "likes": 42,
        "comments": 7
      },
      {
        "id": 2,
        "title": "Chrome Extension Development",
        "content": "Building extensions with Manifest V3.",
        "author": "Jane Smith",
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
  },
  "enabled": true
}
```

### 4. Create Resource (POST)

```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "response": {
    "id": 42,
    "name": "New User",
    "email": "newuser@example.com",
    "createdAt": "2024-06-15T12:00:00Z"
  },
  "enabled": true
}
```

---

## Error Scenario Testing

### 1. Server Error (500)

Override status code to simulate a server crash:

```json
{
  "url": "https://api.example.com/users",
  "method": "GET",
  "response": {
    "error": "Internal Server Error",
    "message": "An unexpected error occurred on the server",
    "code": "SERVER_ERROR"
  },
  "enabled": true
}
```

> **Note**: Custom status code overrides will be available in a future update. Currently, the response body is replaced while keeping the original status code.

### 2. Unauthorized (401)

```json
{
  "url": "https://api.example.com/protected",
  "method": "GET",
  "response": {
    "error": "Unauthorized",
    "message": "Authentication is required",
    "code": "AUTH_REQUIRED"
  },
  "enabled": true
}
```

### 3. Forbidden (403)

```json
{
  "url": "https://api.example.com/admin",
  "method": "GET",
  "response": {
    "error": "Forbidden",
    "message": "You do not have permission to access this resource",
    "code": "PERMISSION_DENIED"
  },
  "enabled": true
}
```

### 4. Not Found (404)

```json
{
  "url": "https://api.example.com/users/999",
  "method": "GET",
  "response": {
    "error": "Not Found",
    "message": "User not found",
    "code": "USER_NOT_FOUND"
  },
  "enabled": true
}
```

### 5. Validation Error (422)

```json
{
  "url": "https://api.example.com/users",
  "method": "POST",
  "response": {
    "error": "Validation Error",
    "message": "The provided data is invalid",
    "errors": {
      "email": ["Email format is invalid"],
      "password": ["Password must be at least 8 characters"]
    }
  },
  "enabled": true
}
```

---

## Authentication Testing

### 1. Login Success

```json
{
  "url": "https://api.example.com/auth/login",
  "method": "POST",
  "response": {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-token",
    "refreshToken": "refresh-token-12345",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "avatar": "https://i.pravatar.cc/150?img=1"
    }
  },
  "enabled": true
}
```

### 2. Login Failure

```json
{
  "url": "https://api.example.com/auth/login",
  "method": "POST",
  "response": {
    "success": false,
    "error": "Invalid Credentials",
    "message": "Email or password is incorrect"
  },
  "enabled": true
}
```

### 3. Token Refresh

```json
{
  "url": "https://api.example.com/auth/refresh",
  "method": "POST",
  "response": {
    "token": "new-access-token-67890",
    "refreshToken": "new-refresh-token-67890",
    "expiresIn": 3600
  },
  "enabled": true
}
```

### 4. Current User (Admin Role)

```json
{
  "url": "https://api.example.com/me",
  "method": "GET",
  "response": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin",
    "permissions": ["read", "write", "delete", "admin"]
  },
  "enabled": true
}
```

---

## Pagination Testing

### 1. First Page

```json
{
  "url": "https://api.example.com/posts?page=1",
  "method": "GET",
  "response": {
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
  },
  "enabled": true
}
```

### 2. Last Page

```json
{
  "url": "https://api.example.com/posts?page=4",
  "method": "GET",
  "response": {
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
  },
  "enabled": true
}
```

### 3. Empty Result

```json
{
  "url": "https://api.example.com/search?q=nonexistent",
  "method": "GET",
  "response": {
    "data": [],
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 0,
      "totalPages": 0,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "enabled": true
}
```

---

## Real-time Data Mocking

### 1. Notifications

```json
{
  "url": "https://api.example.com/notifications",
  "method": "GET",
  "response": {
    "notifications": [
      {
        "id": 1,
        "type": "message",
        "title": "New Message",
        "message": "John Doe sent you a message",
        "read": false,
        "createdAt": "2024-01-15T10:30:00Z"
      },
      {
        "id": 2,
        "type": "like",
        "title": "New Like",
        "message": "Jane Smith liked your post",
        "read": true,
        "createdAt": "2024-01-14T15:20:00Z"
      }
    ],
    "unreadCount": 1
  },
  "enabled": true
}
```

### 2. Dashboard Statistics

```json
{
  "url": "https://api.example.com/stats",
  "method": "GET",
  "response": {
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
  },
  "enabled": true
}
```

---

## Import/Export Workflow

### Exporting a Project

1. Open the project detail screen
2. Click the **📋 Export** button
3. Copy the JSON to clipboard
4. Share the JSON with your team (via Slack, email, etc.)

### Importing a Project

1. On the project list screen, click the **📥 Import** button
2. Paste the exported JSON into the text area
3. Click **Import**
4. The project with all its API mocks will be created

### Example: Complete Project for Import

```json
{
  "name": "E-commerce API Mocks",
  "apis": [
    {
      "url": "https://api.shop.com/products",
      "method": "GET",
      "response": {
        "products": [
          {"id": 1, "name": "Laptop", "price": 999.99, "inStock": true},
          {"id": 2, "name": "Phone", "price": 699.99, "inStock": false}
        ]
      },
      "enabled": true
    },
    {
      "url": "https://api.shop.com/cart",
      "method": "GET",
      "response": {
        "items": [
          {"productId": 1, "quantity": 2, "price": 999.99}
        ],
        "total": 1999.98
      },
      "enabled": true
    },
    {
      "url": "https://api.shop.com/checkout",
      "method": "POST",
      "response": {
        "orderId": "ORD-12345",
        "status": "confirmed",
        "estimatedDelivery": "2024-02-01"
      },
      "enabled": true
    }
  ]
}
```

---

## Tips & Tricks

### 1. Organize by Feature

Create separate projects for different features or teams:
- "Auth Flows" — login, signup, token refresh mocks
- "User Dashboard" — stats, notifications, profile mocks
- "E-commerce" — products, cart, checkout mocks

### 2. Toggle Mocks Quickly

Use the toggle button (✓) on each API item to enable/disable mocks without deleting them. This is useful for:
- Switching between success and error responses
- Temporarily using real API responses for comparison

### 3. Development Workflow

1. Start with real API calls during normal development
2. Add Mocktail mocks when you need specific test data
3. Toggle individual mocks on/off as needed
4. Export your project configuration to share with teammates

### 4. Testing Error Handling

Create multiple mock versions for the same endpoint:
- One project with success responses (enabled)
- Another project with error responses (disabled by default)
- Switch between them by toggling the mocks

---

**Need more examples? Open an issue on [GitHub](https://github.com/user/mocktail/issues)!**
