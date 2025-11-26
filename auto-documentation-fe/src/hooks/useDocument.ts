import { useQuery } from '@tanstack/react-query';
import { Document } from '@/api/types';
import { getLatestDocument } from '@/api/endpoints/documents';

export const useLatestDocument = (repoOwner: string, repoName: string) => {
  return useQuery<Document, Error>({
    queryKey: ['document', 'latest', repoOwner, repoName],
    queryFn: () => getLatestDocument(repoOwner, repoName),
    enabled: !!repoOwner && !!repoName,
    retry: false, // 404 에러 시 재시도 하지 않음
  });
};

export default useLatestDocument;
