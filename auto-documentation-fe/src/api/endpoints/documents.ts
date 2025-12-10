import apiClient from '../client';
import {
  Document,
  LatestDocumentResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
  DocumentDiffResponse,
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

    throw error;
  }
};

/**
 * 수정한 문서 저장 (PUT - 전체 덮어쓰기)
 * @param documentId - 문서 ID
 * @param data - 수정할 데이터 (title, content)
 * @returns 수정된 문서 (status는 자동으로 'edited'로 변경됨)
 */
export const updateDocument = async (
  documentId: number,
  data: UpdateDocumentRequest
): Promise<UpdateDocumentResponse> => {
  try {
    const response = await apiClient.put<UpdateDocumentResponse>(
      `/documents/${documentId}`,
      data
    );

    return response.data;
  } catch (error) {

    throw error;
  }
};

/**
 * 문서 변경 내역 조회 (Diff)
 * @param documentId - 문서 ID
 * @returns 문서 변경 내역
 */
export const getDocumentDiff = async (
  documentId: number
): Promise<DocumentDiffResponse> => {
  try {
    const response = await apiClient.get<DocumentDiffResponse>(
      `/documents/${documentId}/diff`
    );

    return response.data;
  } catch (error) {

    throw error;
  }
};

export const documentsApi = {
  getLatestDocument,
  updateDocument,
  getDocumentDiff,
};

export default documentsApi;
