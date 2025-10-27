export interface Repository {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  avatarUrl: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  authorAvatar: string;
  date: string;
  branch: string;
}

export interface FileChange {
  path: string;
  type: "added" | "modified" | "deleted";
  additions: number;
  deletions: number;
}

export interface GeneratedDocumentation {
  summary: string;
  details: string;
  affectedModules: string[];
}

export interface PendingDocumentation {
  id: string;
  repository: Repository;
  commit: CommitInfo;
  fileChanges: FileChange[];
  documentation: GeneratedDocumentation;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

// Mock data
export const mockRepositories: Repository[] = [
  {
    id: "1",
    name: "auto-documentation-be",
    fullName: "younghyun/auto-documentation-be",
    owner: "younghyun",
    avatarUrl: "https://github.com/identicons/younghyun.png",
  },
  {
    id: "2",
    name: "auto-documentation-fe",
    fullName: "younghyun/auto-documentation-fe",
    owner: "younghyun",
    avatarUrl: "https://github.com/identicons/younghyun.png",
  },
  {
    id: "3",
    name: "api-gateway",
    fullName: "younghyun/api-gateway",
    owner: "younghyun",
    avatarUrl: "https://github.com/identicons/younghyun.png",
  },
];

export const mockPendingDocs: PendingDocumentation[] = [
  {
    id: "doc-1",
    repository: mockRepositories[0],
    commit: {
      hash: "a1b2c3d",
      message: "feat: Add user authentication endpoint",
      author: "Kim Young Hyun",
      authorAvatar: "https://github.com/identicons/younghyun.png",
      date: "2025-10-27T10:30:00Z",
      branch: "main",
    },
    fileChanges: [
      {
        path: "src/auth/auth.controller.ts",
        type: "added",
        additions: 45,
        deletions: 0,
      },
      {
        path: "src/auth/auth.service.ts",
        type: "added",
        additions: 120,
        deletions: 0,
      },
      {
        path: "src/auth/dto/login.dto.ts",
        type: "added",
        additions: 18,
        deletions: 0,
      },
      {
        path: "README.md",
        type: "modified",
        additions: 12,
        deletions: 2,
      },
    ],
    documentation: {
      summary: "Added user authentication system with JWT tokens",
      details: `## Authentication System

This commit introduces a new authentication system for the API.

### New Features
- JWT-based authentication
- Login endpoint (\`POST /auth/login\`)
- Token validation middleware
- User session management

### API Endpoints

#### POST /auth/login
Authenticates a user and returns a JWT token.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
\`\`\`

### Implementation Details
- Uses bcrypt for password hashing
- JWT tokens expire after 24 hours
- Passwords are validated with minimum 8 characters requirement`,
      affectedModules: ["Authentication", "User Management", "Security"],
    },
    status: "pending",
    createdAt: "2025-10-27T10:35:00Z",
  },
  {
    id: "doc-2",
    repository: mockRepositories[1],
    commit: {
      hash: "e4f5g6h",
      message: "refactor: Update dashboard components structure",
      author: "Kim Young Hyun",
      authorAvatar: "https://github.com/identicons/younghyun.png",
      date: "2025-10-27T09:15:00Z",
      branch: "main",
    },
    fileChanges: [
      {
        path: "src/components/dashboard/Dashboard.tsx",
        type: "modified",
        additions: 30,
        deletions: 45,
      },
      {
        path: "src/components/dashboard/Sidebar.tsx",
        type: "added",
        additions: 85,
        deletions: 0,
      },
      {
        path: "src/components/dashboard/Header.tsx",
        type: "modified",
        additions: 15,
        deletions: 8,
      },
      {
        path: "src/components/dashboard/old-layout.tsx",
        type: "deleted",
        additions: 0,
        deletions: 120,
      },
    ],
    documentation: {
      summary: "Refactored dashboard to use modular component structure",
      details: `## Dashboard Refactoring

Restructured the dashboard components for better maintainability and reusability.

### Changes
- Split monolithic Dashboard component into smaller, focused components
- Created new Sidebar component for navigation
- Updated Header component with responsive design
- Removed deprecated old-layout component

### Component Structure
\`\`\`
Dashboard/
├── Dashboard.tsx (Main container)
├── Sidebar.tsx (Navigation menu)
├── Header.tsx (Top bar with user info)
└── widgets/
    ├── StatsCard.tsx
    └── RecentActivity.tsx
\`\`\`

### Benefits
- Easier to maintain and test individual components
- Improved code reusability
- Better separation of concerns
- Responsive design improvements`,
      affectedModules: ["UI/Dashboard", "Navigation", "Layout"],
    },
    status: "pending",
    createdAt: "2025-10-27T09:20:00Z",
  },
  {
    id: "doc-3",
    repository: mockRepositories[2],
    commit: {
      hash: "i7j8k9l",
      message: "fix: Resolve rate limiting issues in API gateway",
      author: "Kim Young Hyun",
      authorAvatar: "https://github.com/identicons/younghyun.png",
      date: "2025-10-26T16:45:00Z",
      branch: "hotfix/rate-limiting",
    },
    fileChanges: [
      {
        path: "src/middleware/rate-limiter.ts",
        type: "modified",
        additions: 25,
        deletions: 10,
      },
      {
        path: "src/config/rate-limit.config.ts",
        type: "modified",
        additions: 8,
        deletions: 3,
      },
      {
        path: "tests/middleware/rate-limiter.spec.ts",
        type: "modified",
        additions: 35,
        deletions: 5,
      },
    ],
    documentation: {
      summary: "Fixed rate limiting bypass issue and improved error handling",
      details: `## Rate Limiting Fix

### Problem
The rate limiter was allowing requests to bypass limits under certain conditions.

### Solution
- Fixed token bucket algorithm implementation
- Added proper error handling for Redis connection failures
- Improved rate limit configuration management

### Configuration Updates
Rate limits are now configurable per endpoint:
\`\`\`typescript
{
  '/api/v1/users': { limit: 100, window: '15m' },
  '/api/v1/posts': { limit: 50, window: '15m' },
  '/api/v1/auth': { limit: 5, window: '15m' }
}
\`\`\`

### Testing
Added comprehensive tests covering:
- Normal rate limiting behavior
- Redis failure scenarios
- Multiple concurrent requests
- Different endpoint configurations`,
      affectedModules: ["API Gateway", "Rate Limiting", "Middleware"],
    },
    status: "pending",
    createdAt: "2025-10-26T16:50:00Z",
  },
];
