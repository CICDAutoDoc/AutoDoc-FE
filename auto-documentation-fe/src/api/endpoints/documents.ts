import apiClient from '../client';
import {
  Document,
  DocumentListItem,
  GetDocumentsParams,
  GetOwnerDocumentsParams,
  OwnerDocumentItem,
  LatestDocumentResponse,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
  DocumentDiffResponse,
  PublishDocumentResponse,
} from '../types';

/**
 * 문서 목록 조회
 * @param params - 조회 파라미터 (repository_name, status, limit, offset)
 * @returns 문서 목록
 */
export const getDocuments = async (
  params: GetDocumentsParams = {}
): Promise<DocumentListItem[]> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.repository_name) {
      queryParams.set('repository_name', params.repository_name);
    }
    if (params.status) {
      queryParams.set('status', params.status);
    }
    if (params.limit !== undefined) {
      queryParams.set('limit', params.limit.toString());
    }
    if (params.offset !== undefined) {
      queryParams.set('offset', params.offset.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString ? `/documents/?${queryString}` : '/documents/';

    const response = await apiClient.get<DocumentListItem[]>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

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
 * 문서 상세 조회
 * @param documentId - 문서 ID
 * @returns 문서 상세
 */
export const getDocument = async (documentId: number): Promise<Document> => {
  try {
    const response = await apiClient.get<Document>(`/documents/${documentId}`);
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

/**
 * GitHub README로 발행
 * @param documentId - 문서 ID
 * @param userId - 사용자 ID
 * @param branch - 브랜치 (기본값: main)
 * @param message - 커밋 메시지
 * @returns 발행 결과
 */
export const publishDocument = async (
  documentId: number,
  userId: number,
  branch: string = 'main',
  message: string = 'Docs: Update README.md by AutoDoc'
): Promise<PublishDocumentResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.set('user_id', userId.toString());
    queryParams.set('branch', branch);
    queryParams.set('message', message);

    const response = await apiClient.post<PublishDocumentResponse>(
      `/documents/${documentId}/publish?${queryParams.toString()}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * 사용자별 모든 최신 문서 조회
 * @param params - 조회 파라미터 (repoOwner, limit, offset)
 * @returns 최신 문서 목록
 */
export const getOwnerDocuments = async (
  params: GetOwnerDocumentsParams
): Promise<OwnerDocumentItem[]> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.limit !== undefined) {
      queryParams.set('limit', params.limit.toString());
    }
    if (params.offset !== undefined) {
      queryParams.set('offset', params.offset.toString());
    }

    const queryString = queryParams.toString();
    const url = queryString
      ? `/documents/owner/${params.repoOwner}?${queryString}`
      : `/documents/owner/${params.repoOwner}`;

    const response = await apiClient.get<OwnerDocumentItem[]>(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const documentsApi = {
  getDocuments,
  getDocument,
  getLatestDocument,
  getOwnerDocuments,
  updateDocument,
  getDocumentDiff,
  publishDocument,
};

export default documentsApi;
