import { useState, useEffect, useCallback } from 'react';
import { Webhook, SetupRepositoryRequest } from '@/api/types';
import {
  getRepositoryWebhooks,
  setupRepository,
  deleteWebhook,
} from '@/api/endpoints/webhooks';

interface UseWebhooksOptions {
  repoOwner: string | null;
  repoName: string | null;
  userId: string | null;
  autoFetch?: boolean;
}

interface UseWebhooksReturn {
  webhooks: Webhook[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  setupRepo: (data: SetupRepositoryRequest) => Promise<void>;
  removeWebhook: (webhookId: number) => Promise<void>;
}

export const useWebhooks = ({
  repoOwner,
  repoName,
  userId,
  autoFetch = true,
}: UseWebhooksOptions): UseWebhooksReturn => {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchWebhooks = useCallback(async () => {
    if (!repoOwner || !repoName || !userId) {
      setWebhooks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getRepositoryWebhooks(repoOwner, repoName, userId);
      setWebhooks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch webhooks'));
      console.error('Error fetching webhooks:', err);
    } finally {
      setLoading(false);
    }
  }, [repoOwner, repoName, userId]);

  const setupRepo = useCallback(
    async (data: SetupRepositoryRequest) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      setLoading(true);
      setError(null);

      try {
        await setupRepository(userId, data);
        // 설정 후 웹훅 목록 갱신
        await fetchWebhooks();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to setup repository'));
        console.error('Error setting up repository:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [userId, fetchWebhooks]
  );

  const removeWebhook = useCallback(
    async (webhookId: number) => {
      if (!repoOwner || !repoName || !userId) {
        throw new Error('Repository information and user ID are required');
      }

      setLoading(true);
      setError(null);

      try {
        await deleteWebhook(repoOwner, repoName, webhookId, userId);
        // 삭제 후 웹훅 목록 갱신
        await fetchWebhooks();
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to delete webhook'));
        console.error('Error deleting webhook:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [repoOwner, repoName, userId, fetchWebhooks]
  );

  useEffect(() => {
    if (autoFetch && repoOwner && repoName && userId) {
      fetchWebhooks();
    }
  }, [autoFetch, repoOwner, repoName, userId, fetchWebhooks]);

  return {
    webhooks,
    loading,
    error,
    refetch: fetchWebhooks,
    setupRepo,
    removeWebhook,
  };
};

export default useWebhooks;
