import { useState, useEffect, useCallback } from 'react';
import { Repository } from '@/api/types';
import { getUserRepositories } from '@/api/endpoints/repositories';

interface UseRepositoriesOptions {
  userId: string | null;
  autoFetch?: boolean; // 자동으로 fetch 할지 여부
}

interface UseRepositoriesReturn {
  repositories: Repository[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useRepositories = ({
  userId,
  autoFetch = true,
}: UseRepositoriesOptions): UseRepositoriesReturn => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRepositories = useCallback(async () => {
    if (!userId) {
      setRepositories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getUserRepositories(userId);
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch repositories'));
      console.error('Error fetching repositories:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (autoFetch && userId) {
      fetchRepositories();
    }
  }, [autoFetch, userId, fetchRepositories]);

  return {
    repositories,
    loading,
    error,
    refetch: fetchRepositories,
  };
};

export default useRepositories;
