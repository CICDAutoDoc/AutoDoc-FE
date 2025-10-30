import apiClient from '../client';
import {
  Webhook,
  WebhooksResponse,
  SetupRepositoryRequest,
  SetupRepositoryResponse,
  DeleteWebhookResponse,
} from '../types';

/**
 * 저장소의 웹훅 목록 조회
 * @param repoOwner - 저장소 소유자
 * @param repoName - 저장소 이름
 * @param userId - 사용자 ID
 * @returns 웹훅 목록
 */
export const getRepositoryWebhooks = async (
  repoOwner: string,
  repoName: string,
  userId: string
): Promise<Webhook[]> => {
  try {
    const response = await apiClient.get<WebhooksResponse>(
      `/github/webhooks/${repoOwner}/${repoName}/${userId}`
    );
    return response.data.webhooks || response.data as any;
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    throw error;
  }
};

/**
 * 저장소 등록 및 웹훅 설정
 * @param userId - 사용자 ID
 * @param data - 저장소 설정 데이터
 * @returns 설정 결과
 */
export const setupRepository = async (
  userId: string,
  data: SetupRepositoryRequest
): Promise<SetupRepositoryResponse> => {
  try {
    const response = await apiClient.post<SetupRepositoryResponse>(
      `/github/setup-repository/${userId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.error('Failed to setup repository:', error);
    throw error;
  }
};

/**
 * GitHub 웹훅 삭제
 * @param repoOwner - 저장소 소유자
 * @param repoName - 저장소 이름
 * @param webhookId - 웹훅 ID
 * @param userId - 사용자 ID
 * @returns 삭제 결과
 */
export const deleteWebhook = async (
  repoOwner: string,
  repoName: string,
  webhookId: number,
  userId: string
): Promise<DeleteWebhookResponse> => {
  try {
    const response = await apiClient.delete<DeleteWebhookResponse>(
      `/github/webhook/${repoOwner}/${repoName}/${webhookId}/${userId}`
    );
    return response.data;
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    throw error;
  }
};

/**
 * 웹훅 이벤트 수신 (주로 백엔드에서 처리되지만, 프론트엔드에서 테스트용으로 사용 가능)
 * 주의: 이 엔드포인트는 GitHub에서 호출하는 것이므로 일반적으로 프론트엔드에서 직접 호출하지 않습니다.
 */
export const receiveWebhookEvent = async (eventData: any): Promise<any> => {
  try {
    const response = await apiClient.post('/github/webhook', eventData);
    return response.data;
  } catch (error) {
    console.error('Failed to process webhook event:', error);
    throw error;
  }
};

export const webhooksApi = {
  getRepositoryWebhooks,
  setupRepository,
  deleteWebhook,
  receiveWebhookEvent,
};

export default webhooksApi;
