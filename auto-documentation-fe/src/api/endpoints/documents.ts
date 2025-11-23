import apiClient from '../client';
import { Document, LatestDocumentResponse } from '../types';

/**
 * 저장소별 최신 문서 조회
 * @param repoOwner - 저장소 소유자
 * @param repoName - 저장소 이름
 * @returns 최신 문서
 */
export const getLatestDocument = async (
  repoOwner: string,
  repoName: string
): Promise<Document> => {
  try {
    const response = await apiClient.get<LatestDocumentResponse>(
      `/documents/document/latest/${repoOwner}/${repoName}`
    );

    return response.data;
  } catch (error) {
    console.error('Failed to fetch latest document:', error);
    throw error;
  }
};

export const documentsApi = {
  getLatestDocument,
};

export default documentsApi;
