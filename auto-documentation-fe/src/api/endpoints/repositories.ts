import apiClient from '../client';
import { Repository, RepositoriesResponse } from '../types';

/**
 * 사용자의 GitHub 저장소 목록 조회
 * @param userId - 사용자 ID
 * @returns 저장소 목록
 */
export const getUserRepositories = async (userId: string): Promise<Repository[]> => {
  try {
    const response = await apiClient.get<RepositoriesResponse>(
      `/github/repositories/${userId}`
    );
    return response.data.repositories || response.data as any;
  } catch (error) {
    console.error('Failed to fetch repositories:', error);
    throw error;
  }
};

/**
 * 특정 저장소 정보 조회 (필요시 백엔드에 추가 엔드포인트 요청)
 * @param userId - 사용자 ID
 * @param repoOwner - 저장소 소유자
 * @param repoName - 저장소 이름
 * @returns 저장소 정보
 */
export const getRepository = async (
  userId: string,
  repoOwner: string,
  repoName: string
): Promise<Repository | null> => {
  try {
    const repositories = await getUserRepositories(userId);
    const repo = repositories.find(
      (r) => r.owner.login === repoOwner && r.name === repoName
    );
    return repo || null;
  } catch (error) {
    console.error('Failed to fetch repository:', error);
    throw error;
  }
};

export const repositoriesApi = {
  getUserRepositories,
  getRepository,
};

export default repositoriesApi;
