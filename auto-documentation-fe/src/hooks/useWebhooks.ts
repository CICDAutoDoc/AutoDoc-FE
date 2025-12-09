import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Webhook, SetupRepositoryRequest } from '@/api/types';
import {
  getRepositoryWebhooks,
  setupRepository,
  deleteWebhook,
} from '@/api/endpoints/webhooks';

// 웹훅 조회 hook
export const useWebhooks = (repoOwner: string, repoName: string, userId: string) => {
  return useQuery<Webhook[], Error>({
    queryKey: ['webhooks', repoOwner, repoName, userId],
    queryFn: () => getRepositoryWebhooks(repoOwner, repoName, userId),
    enabled: !!repoOwner && !!repoName && !!userId,
  });
};

// 여러 레포지토리의 웹훅을 조회하는 hook
export const useMultipleWebhooks = (
  repositories: Array<{ owner: string; name: string }>,
  userId: string
) => {
  return useQuery({
    queryKey: ['webhooks', 'multiple', repositories, userId],
    queryFn: async () => {
      const webhookPromises = repositories.map(async (repo) => {
        try {
          const webhooks = await getRepositoryWebhooks(repo.owner, repo.name, userId);
          return { fullName: `${repo.owner}/${repo.name}`, webhooks };
        } catch (err) {
          console.error(`Failed to fetch webhooks for ${repo.owner}/${repo.name}:`, err);
          return { fullName: `${repo.owner}/${repo.name}`, webhooks: [] };
        }
      });

      const results = await Promise.all(webhookPromises);
      return results.reduce((acc, { fullName, webhooks }) => {
        acc[fullName] = webhooks;
        return acc;
      }, {} as Record<string, Webhook[]>);
    },
    enabled: repositories.length > 0 && !!userId,
  });
};

// 웹훅 설정 mutation
export const useSetupWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: SetupRepositoryRequest }) =>
      setupRepository(userId, data),
    onSuccess: (response, variables) => {
      const fullName = `${variables.data.repo_owner}/${variables.data.repo_name}`;

      // 응답에서 웹훅 정보를 추출하여 즉시 캐시 업데이트
      const newWebhook: Webhook = {
        id: response.webhook_id || Date.now(),
        name: 'web',
        active: true,
        events: ['push'],
        config: {
          url: variables.data.webhook_url,
          content_type: 'json',
        },
      };

      // 여러 레포지토리 웹훅 목록 캐시 즉시 업데이트
      queryClient.setQueriesData<Record<string, Webhook[]>>(
        { queryKey: ['webhooks', 'multiple'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            [fullName]: [...(oldData[fullName] || []), newWebhook],
          };
        }
      );

      // 개별 레포지토리 웹훅 쿼리도 업데이트
      queryClient.setQueryData<Webhook[]>(
        ['webhooks', variables.data.repo_owner, variables.data.repo_name, variables.userId],
        (oldData) => [...(oldData || []), newWebhook]
      );

      // 백그라운드에서 실제 데이터로 동기화
      queryClient.invalidateQueries({
        queryKey: ['webhooks'],
      });
    },
  });
};

// 웹훅 삭제 mutation
export const useDeleteWebhook = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      repoOwner,
      repoName,
      webhookId,
      userId,
    }: {
      repoOwner: string;
      repoName: string;
      webhookId: number;
      userId: string;
    }) => deleteWebhook(repoOwner, repoName, webhookId, userId),
    onSuccess: (_, variables) => {
      const fullName = `${variables.repoOwner}/${variables.repoName}`;

      // 여러 레포지토리 웹훅 목록 캐시에서 해당 웹훅 즉시 제거
      queryClient.setQueriesData<Record<string, Webhook[]>>(
        { queryKey: ['webhooks', 'multiple'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            [fullName]: (oldData[fullName] || []).filter(
              (w) => w.id !== variables.webhookId
            ),
          };
        }
      );

      // 개별 레포지토리 웹훅 쿼리에서도 제거
      queryClient.setQueryData<Webhook[]>(
        ['webhooks', variables.repoOwner, variables.repoName, variables.userId],
        (oldData) => (oldData || []).filter((w) => w.id !== variables.webhookId)
      );

      // 백그라운드에서 실제 데이터로 동기화
      queryClient.invalidateQueries({
        queryKey: ['webhooks'],
      });
    },
  });
};

export default useWebhooks;
