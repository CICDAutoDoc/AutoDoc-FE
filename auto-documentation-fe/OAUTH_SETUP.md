# GitHub OAuth 설정 가이드

## 백엔드가 JSON만 반환하는 경우

백엔드 `/github/auth/callback`이 JSON을 반환한다면, **GitHub OAuth App의 콜백 URL을 프론트엔드로 설정**해야 합니다.

## 설정 방법

### 1. GitHub OAuth App 설정

GitHub OAuth App (백엔드 팀이 생성한 앱)의 설정을 다음과 같이 변경해주세요:

- **Authorization callback URL**: `http://localhost:3000/auth/callback`
- 프로덕션: `https://your-frontend-domain.com/auth/callback`

### 2. 동작 플로우

```
1. 사용자가 "GitHub으로 로그인" 클릭
   ↓
2. 백엔드 /github/auth/login으로 리다이렉트
   (백엔드가 GitHub OAuth URL 생성)
   ↓
3. GitHub 인증 페이지
   ↓
4. 인증 완료 후 프론트엔드로 리다이렉트 ⭐
   http://localhost:3000/auth/callback?code=xxx
   ↓
5. 프론트엔드가 code를 백엔드로 전달
   GET http://15.165.120.222/github/auth/callback?code=xxx
   ↓
6. 백엔드 응답:
   {
     "message": "Login successful",
     "user": {...},
     "access_token": "..."
   }
   ↓
7. 프론트엔드가 데이터 저장 후 메인 페이지로 이동
   ↓
8. 로그인 완료! 🎉
```

### 3. 백엔드 수정 필요사항

백엔드 `/github/auth/login` 엔드포인트에서 생성하는 GitHub OAuth URL의 `redirect_uri`를 프론트엔드로 변경해주세요:

**현재:**
```python
redirect_uri = "http://15.165.120.222/github/auth/callback"  # 백엔드
```

**변경:**
```python
# 환경변수 사용
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
redirect_uri = f"{FRONTEND_URL}/auth/callback"  # 프론트엔드
```

**전체 예시:**
```python
import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID")

@app.get("/github/auth/login")
async def login():
    github_auth_url = (
        f"https://github.com/login/oauth/authorize?"
        f"client_id={GITHUB_CLIENT_ID}&"
        f"redirect_uri={FRONTEND_URL}/auth/callback&"  # 프론트엔드로!
        f"scope=read:user,admin:repo_hook,repo"
    )
    return RedirectResponse(url=github_auth_url)
```

### 4. 환경변수 설정

백엔드 `.env` 파일:
```bash
FRONTEND_URL=http://localhost:3000  # 개발
# FRONTEND_URL=https://your-domain.com  # 프로덕션

GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
```

## 프론트엔드는 준비 완료!

프론트엔드 코드는 이미 구현되어 있습니다:
- ✅ `/auth/callback` 페이지가 `code`를 받아서 백엔드로 전달
- ✅ 백엔드 JSON 응답을 파싱
- ✅ 사용자 정보와 토큰 저장
- ✅ 메인 페이지로 자동 리다이렉트

## 테스트 방법

1. 백엔드 팀이 위 수정사항 적용
2. 프론트엔드에서 로그인 버튼 클릭
3. GitHub 인증 완료
4. 자동으로 프론트엔드 `/auth/callback`으로 돌아옴
5. 로그인 완료!

---

**요약**: GitHub OAuth 콜백 URL을 **백엔드 → 프론트엔드**로 변경해야 합니다!
