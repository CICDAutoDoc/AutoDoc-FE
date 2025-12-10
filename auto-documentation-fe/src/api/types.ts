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
  created_at?: string;
  updated_at?: string;
}

export interface WebhooksResponse {
  success: boolean;
  webhooks: Webhook[];
  total: number;
  error: string | null;
}

export interface SetupRepositoryRequest {
  repo_owner: string;
  repo_name: string;
  access_token: string;
  webhook_url: string;
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

// 문서 수정 요청 (PUT - 전체 덮어쓰기, status는 자동으로 'edited'로 변경됨)
export interface UpdateDocumentRequest {
  title: string;
  content: string;
}

// 문서 수정 응답
export interface UpdateDocumentResponse {
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

// 문서 Diff 응답
export interface DocumentDiffResponse {
  old_content: string;
  new_content: string;
  last_updated: string;
  diff_lines: string[];
}

// 문서 목록 조회 파라미터
export interface GetDocumentsParams {
  repository_name?: string;
  status?: 'generated' | 'edited' | 'reviewed' | 'failed';
  limit?: number;
  offset?: number;
}

// 문서 목록 아이템 (목록 조회 시 반환되는 간소화된 문서)
export interface DocumentListItem {
  id: number;
  title: string;
  content: string;
  status: string;
  repository_name: string;
  created_at: string;
}

// Owner별 최신 문서 조회 파라미터
export interface GetOwnerDocumentsParams {
  repoOwner: string;
  limit?: number;
  offset?: number;
}

// Owner별 최신 문서 아이템
export interface OwnerDocumentItem {
  id: number;
  title: string;
  repository_name: string;
  status: string;
  created_at: string;
}

// GitHub README 발행 파라미터
export interface PublishDocumentParams {
  documentId: number;
  userId: number;
  branch?: string;
  message?: string;
}

// GitHub README 발행 응답
export interface PublishDocumentResponse {
  success: boolean;
  message: string;
  commit_sha: string;
}

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}
