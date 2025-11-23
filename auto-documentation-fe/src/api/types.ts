// User types
export interface User {
  id: string;
  github_username: string;
  github_id: number;
  access_token?: string;
}

// Auth callback response
export interface AuthCallbackResponse {
  message: string;
  user: {
    id: number;
    github_id: number;
    username: string;
    email: string;
  };
  access_token: string;
}

// Repository types
export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  html_url: string;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
}

export interface RepositoriesResponse {
  repositories: Repository[];
}

// 사용자 저장소 목록 조회 응답 (백엔드 /github/webhooks/{user_id})
export interface UserRepositoriesResponse {
  success: boolean;
  repositories: UserRepository[];
  total: number;
  error: string | null;
}

export interface UserRepository {
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  permissions?: Record<string, any>;
}

// Webhook types
export interface Webhook {
  id: number;
  name: string;
  active: boolean;
  events: string[];
  config: {
    url: string;
    content_type: string;
    insecure_ssl?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface WebhooksResponse {
  webhooks: Webhook[];
}

export interface SetupRepositoryRequest {
  repo_owner: string;
  repo_name: string;
  webhook_url?: string;
}

export interface SetupRepositoryResponse {
  message: string;
  webhook_id?: number;
  repository?: Repository;
}

export interface DeleteWebhookResponse {
  message: string;
}

// Webhook event types
export interface WebhookEvent {
  action: string;
  repository: Repository;
  sender: {
    login: string;
    avatar_url: string;
  };
  [key: string]: any; // 다양한 이벤트 타입을 수용
}

// Documentation types (기존 mock 데이터와 호환)
export interface Documentation {
  summary: string;
  details: string;
  changes: Array<{
    type: "added" | "modified" | "removed";
    file: string;
    description: string;
  }>;
}

export interface PendingDocumentation {
  id: string;
  repository: {
    owner: string;
    name: string;
    url: string;
  };
  commit: {
    sha: string;
    message: string;
    author: string;
    date: string;
    url: string;
  };
  documentation: Documentation;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  diff?: string;
}

// Document types
export interface Document {
  id: number;
  title: string;
  content: string;
  summary: string;
  status: string;
  document_type: string;
  commit_sha: string;
  repository_name: string;
  created_at: string;
  updated_at: string;
}

export interface LatestDocumentResponse {
  id: number;
  title: string;
  content: string;
  summary: string;
  status: string;
  document_type: string;
  commit_sha: string;
  repository_name: string;
  created_at: string;
  updated_at: string;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}
