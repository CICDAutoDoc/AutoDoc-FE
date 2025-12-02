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
    onSuccess: (_, variables) => {
      // 성공 후 해당 레포지토리의 웹훅 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['webhooks', variables.data.repo_owner, variables.data.repo_name, variables.userId],
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
      // 성공 후 해당 레포지토리의 웹훅 쿼리 무효화
      queryClient.invalidateQueries({
        queryKey: ['webhooks', variables.repoOwner, variables.repoName, variables.userId],
      });
    },
  });
};

export default useWebhooks;
