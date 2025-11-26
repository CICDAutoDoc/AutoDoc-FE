import { useQuery } from '@tanstack/react-query';
import { UserRepository } from '@/api/types';
import { getUserRepositories } from '@/api/endpoints/repositories';

export const useRepositories = (userId: string) => {
  return useQuery<UserRepository[], Error>({
    queryKey: ['repositories', userId],
    queryFn: () => getUserRepositories(userId),
    enabled: !!userId,
  });
};

export default useRepositories;
