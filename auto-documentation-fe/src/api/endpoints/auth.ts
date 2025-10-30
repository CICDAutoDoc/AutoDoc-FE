import apiClient from '../client';

/**
 * GitHub OAuth 로그인 시작
 * 사용자를 GitHub OAuth 인증 페이지로 리다이렉트합니다.
 */
export const initiateGitHubLogin = (): string => {
  // 브라우저에서 직접 호출할 URL을 반환
  return `${apiClient.defaults.baseURL}/github/auth/login`;
};

/**
 * GitHub OAuth 콜백 처리
 * OAuth 인증 후 GitHub에서 리다이렉트되는 엔드포인트
 *
 * 주의: 이 엔드포인트는 일반적으로 백엔드에서 처리하고
 * 프론트엔드는 결과를 받아 처리합니다.
 */
export const handleGitHubCallback = async (code: string, state?: string) => {
  try {
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) {
      params.append('state', state);
    }

    const response = await apiClient.get(`/github/auth/callback?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('GitHub callback error:', error);
    throw error;
  }
};

// 로그인 상태 확인을 위한 헬퍼 함수들
export const isAuthenticated = (): boolean => {
  // 실제 구현에서는 토큰이나 세션 확인
  // 현재는 localStorage나 cookie를 확인할 수 있습니다
  return false; // TODO: 실제 인증 상태 확인 로직 구현
};

export const logout = (): void => {
  // 토큰 제거 등 로그아웃 처리
  // localStorage.removeItem('token');
  // 필요시 백엔드 로그아웃 엔드포인트 호출
};

export const authApi = {
  initiateGitHubLogin,
  handleGitHubCallback,
  isAuthenticated,
  logout,
};

export default authApi;
