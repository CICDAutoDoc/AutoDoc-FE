import { useState, useEffect, useCallback } from 'react';
import { initiateGitHubLogin, handleGitHubCallback, logout } from '@/api/endpoints/auth';

interface User {
  id: string;
  github_username: string;
  github_id: number;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string, state?: string) => Promise<void>;
}

const USER_STORAGE_KEY = 'autodoc_user';

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // 초기 로드 시 localStorage에서 사용자 정보 확인
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {

        localStorage.removeItem(USER_STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  // GitHub 로그인 시작
  const login = useCallback(() => {
    const loginUrl = initiateGitHubLogin();
    window.location.href = loginUrl;
  }, []);

  // GitHub OAuth 콜백 처리
  const handleCallback = useCallback(async (code: string, state?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await handleGitHubCallback(code, state);

      // 백엔드 응답: {"message":"Login successful","user":{...},"access_token":"..."}
      const userData: User = {
        id: response.user.id.toString(),
        github_username: response.user.username,
        github_id: response.user.github_id,
      };

      setUser(userData);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));

      // access_token 저장
      if (response.access_token) {
        localStorage.setItem('access_token', response.access_token);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to handle callback'));

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 로그아웃
  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem('access_token');
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout: handleLogout,
    handleCallback,
  };
};

export default useAuth;
