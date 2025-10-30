import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://15.165.120.222';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 쿠키/세션 인증을 위해
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 추후 JWT 토큰이나 다른 인증 헤더를 추가할 수 있습니다
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 에러 핸들링
    if (error.response) {
      // 서버가 응답을 반환한 경우
      const { status } = error.response;

      if (status === 401) {
        // 인증 실패 - 로그인 페이지로 리다이렉트
        console.error('인증이 필요합니다.');
        // window.location.href = '/login';
      } else if (status === 403) {
        // 권한 없음
        console.error('접근 권한이 없습니다.');
      } else if (status === 404) {
        console.error('리소스를 찾을 수 없습니다.');
      } else if (status >= 500) {
        console.error('서버 오류가 발생했습니다.');
      }
    } else if (error.request) {
      // 요청은 전송되었지만 응답을 받지 못한 경우
      console.error('서버로부터 응답이 없습니다.');
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error('요청 중 오류가 발생했습니다:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
