import apiClient from '../client';
import { AuthCallbackResponse } from '../types';

/**
 * GitHub OAuth 로그인 시작
 * 사용자를 GitHub OAuth 인증 페이지로 리다이렉트합니다.
 */
export const initiateGitHubLogin = (): string => {
  // 프론트엔드 콜백 URL을 쿼리 파라미터로 전달
  const frontendCallbackUrl = `${window.location.origin}/github/auth/callback`;
  return `${apiClient.defaults.baseURL}/github/auth/login?redirect_uri=${encodeURIComponent(frontendCallbackUrl)}`;
};

/**
 * GitHub OAuth 콜백 처리
 * 프론트엔드가 GitHub에서 받은 code를 백엔드로 전달하여 토큰 교환
 *
 * @param code - GitHub에서 받은 인증 코드
 * @param state - CSRF 방지를 위한 state 파라미터
 * @returns 사용자 정보 및 access token
 */
export const handleGitHubCallback = async (
  code: string,
  state?: string
): Promise<AuthCallbackResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('code', code);
    if (state) {
      params.append('state', state);
    }

    const response = await apiClient.get<AuthCallbackResponse>(
      `/github/auth/callback?${params.toString()}`
    );
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
