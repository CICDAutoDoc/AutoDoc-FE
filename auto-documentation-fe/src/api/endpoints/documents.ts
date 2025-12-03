import apiClient from '../client';
import {
  Document,
  LatestDocumentResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
} from '../types';

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

/**
 * 문서 내용 및 상태 업데이트
 * @param documentId - 문서 ID
 * @param data - 수정할 데이터 (title, content, status 중 원하는 것만)
 * @returns 수정된 문서
 */
export const updateDocument = async (
  documentId: number,
  data: UpdateDocumentRequest
): Promise<UpdateDocumentResponse> => {
  try {
    const response = await apiClient.patch<UpdateDocumentResponse>(
      `/documents/${documentId}`,
      data
    );

    return response.data;
  } catch (error) {
    console.error('Failed to update document:', error);
    throw error;
  }
};

export const documentsApi = {
  getLatestDocument,
  updateDocument,
};

export default documentsApi;
