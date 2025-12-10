import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Document, DocumentListItem, GetDocumentsParams, UpdateDocumentRequest, DocumentDiffResponse } from '@/api/types';
import { getDocuments, getDocument, getLatestDocument, updateDocument, getDocumentDiff } from '@/api/endpoints/documents';

// 문서 목록 조회 Hook
export const useDocuments = (params: GetDocumentsParams = {}) => {
  return useQuery<DocumentListItem[], Error>({
    queryKey: ['documents', params],
    queryFn: () => getDocuments(params),
    enabled: !!params.repository_name, // repository_name이 있을 때만 쿼리 실행
    retry: false,
  });
};

// 문서 상세 조회 Hook
export const useDocument = (documentId: number | null) => {
  return useQuery<Document, Error>({
    queryKey: ['document', documentId],
    queryFn: () => getDocument(documentId!),
    enabled: !!documentId,
    retry: false,
  });
};

export const useLatestDocument = (repoOwner: string, repoName: string) => {
  return useQuery<Document, Error>({
    queryKey: ['document', 'latest', repoOwner, repoName],
    queryFn: () => getLatestDocument(repoOwner, repoName),
    enabled: !!repoOwner && !!repoName,
    retry: false, // 404 에러 시 재시도 하지 않음
  });
};

export const useUpdateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentId,
      data,
    }: {
      documentId: number;
      data: UpdateDocumentRequest;
      repoOwner?: string;
      repoName?: string;
    }) => updateDocument(documentId, data),
    onSuccess: (_, variables) => {
      // 해당 레포의 최신 문서 쿼리 무효화
      if (variables.repoOwner && variables.repoName) {
        queryClient.invalidateQueries({
          queryKey: ['document', 'latest', variables.repoOwner, variables.repoName],
        });
      }
      // 전체 문서 관련 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: ['document'],
      });
      queryClient.invalidateQueries({
        queryKey: ['documents'],
      });
      // Diff 쿼리도 무효화
      queryClient.invalidateQueries({
        queryKey: ['document', 'diff'],
      });
    },
  });
};

export const useDocumentDiff = (documentId: number | null) => {
  return useQuery<DocumentDiffResponse, Error>({
    queryKey: ['document', 'diff', documentId],
    queryFn: () => getDocumentDiff(documentId!),
    enabled: !!documentId,
    retry: false,
  });
};

export default useLatestDocument;
