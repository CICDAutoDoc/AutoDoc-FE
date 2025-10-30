# API 사용 가이드

이 문서는 AutoDoc 프론트엔드에서 백엔드 API를 사용하는 방법을 설명합니다.

## 폴더 구조

```
src/
├── api/
│   ├── client.ts              # Axios 클라이언트 설정
│   ├── types.ts               # API 타입 정의
│   ├── index.ts               # API 통합 export
│   └── endpoints/
│       ├── auth.ts            # 인증 관련 API
│       ├── repositories.ts    # 레포지토리 관련 API
│       └── webhooks.ts        # 웹훅 관련 API
└── hooks/
    ├── useAuth.ts             # 인증 hook
    ├── useRepositories.ts     # 레포지토리 hook
    └── useWebhooks.ts         # 웹훅 hook
```

## 환경 설정

1. `.env.local` 파일을 생성하고 API URL을 설정하세요:

```env
NEXT_PUBLIC_API_URL=http://15.165.120.222
```

2. 개발 환경에서는 로컬 백엔드 서버를 사용할 수 있습니다:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API 사용 방법

### 1. 직접 API 함수 호출

```typescript
import { getUserRepositories } from '@/api/endpoints/repositories';

async function fetchRepos() {
  try {
    const repositories = await getUserRepositories('user123');
    console.log(repositories);
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
  }
}
```

### 2. React Hooks 사용 (권장)

#### useAuth Hook

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginButton() {
  const { user, loading, login, logout } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.github_username}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login with GitHub</button>
      )}
    </div>
  );
}
```

#### useRepositories Hook

```typescript
import { useRepositories } from '@/hooks/useRepositories';

function RepositoriesList() {
  const { repositories, loading, error, refetch } = useRepositories({
    userId: 'user123',
    autoFetch: true,
  });

  if (loading) return <div>Loading repositories...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <ul>
        {repositories.map((repo) => (
          <li key={repo.id}>{repo.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### useWebhooks Hook

```typescript
import { useWebhooks } from '@/hooks/useWebhooks';

function WebhookManager() {
  const { webhooks, loading, setupRepo, removeWebhook } = useWebhooks({
    repoOwner: 'owner',
    repoName: 'repo',
    userId: 'user123',
    autoFetch: true,
  });

  const handleSetup = async () => {
    try {
      await setupRepo({
        repo_owner: 'owner',
        repo_name: 'repo',
      });
      alert('Repository setup successful!');
    } catch (error) {
      alert('Setup failed');
    }
  };

  const handleDelete = async (webhookId: number) => {
    try {
      await removeWebhook(webhookId);
      alert('Webhook deleted!');
    } catch (error) {
      alert('Delete failed');
    }
  };

  return (
    <div>
      <button onClick={handleSetup}>Setup Repository</button>
      <ul>
        {webhooks.map((webhook) => (
          <li key={webhook.id}>
            {webhook.name}
            <button onClick={() => handleDelete(webhook.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## API 엔드포인트

### Authentication

- `GET /github/auth/login` - GitHub OAuth 로그인 시작
- `GET /github/auth/callback` - GitHub OAuth 콜백 처리

```typescript
import { initiateGitHubLogin, handleGitHubCallback } from '@/api/endpoints/auth';

// 로그인 시작
const loginUrl = initiateGitHubLogin();
window.location.href = loginUrl;

// 콜백 처리
await handleGitHubCallback(code, state);
```

### Repositories

- `GET /github/repositories/{user_id}` - 사용자의 GitHub 저장소 목록 조회

```typescript
import { getUserRepositories, getRepository } from '@/api/endpoints/repositories';

// 모든 저장소 조회
const repos = await getUserRepositories('user123');

// 특정 저장소 조회
const repo = await getRepository('user123', 'owner', 'repo-name');
```

### Webhooks

- `GET /github/webhooks/{repo_owner}/{repo_name}/{user_id}` - 웹훅 목록 조회
- `POST /github/setup-repository/{user_id}` - 저장소 등록 및 웹훅 설정
- `DELETE /github/webhook/{repo_owner}/{repo_name}/{webhook_id}/{user_id}` - 웹훅 삭제

```typescript
import {
  getRepositoryWebhooks,
  setupRepository,
  deleteWebhook,
} from '@/api/endpoints/webhooks';

// 웹훅 목록 조회
const webhooks = await getRepositoryWebhooks('owner', 'repo', 'user123');

// 저장소 설정
await setupRepository('user123', {
  repo_owner: 'owner',
  repo_name: 'repo',
  webhook_url: 'https://optional-webhook-url.com',
});

// 웹훅 삭제
await deleteWebhook('owner', 'repo', 123, 'user123');
```

## 에러 핸들링

API 클라이언트는 자동으로 에러를 처리합니다:

- **401 Unauthorized**: 인증 실패 (자동 로그인 페이지로 리다이렉트)
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스를 찾을 수 없음
- **500+ Server Error**: 서버 오류

커스텀 에러 핸들링이 필요한 경우:

```typescript
try {
  const repos = await getUserRepositories('user123');
} catch (error) {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 404) {
      console.error('User not found');
    } else if (error.response?.status === 500) {
      console.error('Server error');
    }
  }
}
```

## 타입 정의

모든 API 타입은 `src/api/types.ts`에 정의되어 있습니다:

- `User` - 사용자 정보
- `Repository` - 저장소 정보
- `Webhook` - 웹훅 정보
- `SetupRepositoryRequest` - 저장소 설정 요청
- `PendingDocumentation` - 대기 중인 문서

## 통합 API 객체

모든 API를 한 번에 import하려면:

```typescript
import api from '@/api';

// 사용 예시
const repos = await api.repositories.getUserRepositories('user123');
const webhooks = await api.webhooks.getRepositoryWebhooks('owner', 'repo', 'user123');
```

## 개발 팁

1. **자동 완성**: TypeScript를 사용하므로 IDE에서 자동 완성과 타입 체크를 활용하세요.

2. **React Hooks 사용**: 가능한 한 직접 API 함수를 호출하는 대신 hooks를 사용하세요. 상태 관리와 로딩/에러 처리가 자동으로 됩니다.

3. **환경 변수**: 프로덕션과 개발 환경에서 다른 API URL을 사용하려면 `.env.local`과 `.env.production`을 따로 설정하세요.

4. **인증**: 현재는 localStorage를 사용하여 사용자 정보를 저장합니다. 프로덕션에서는 더 안전한 방법(httpOnly 쿠키 등)을 고려하세요.
