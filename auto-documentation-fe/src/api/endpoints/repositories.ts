import apiClient from '../client';
import { Repository, RepositoriesResponse, UserRepositoriesResponse, UserRepository } from '../types';

/**
 * 사용자의 GitHub 저장소 목록 조회
 * @param userId - 사용자 ID
 * @returns 저장소 목록
 */
export const getUserRepositories = async (userId: string): Promise<UserRepository[]> => {
  try {
    const response = await apiClient.get<UserRepositoriesResponse>(
      `/github/repositories/${userId}`
    );

    if (!response.data.success) {
      throw new Error(response.data.error || '저장소 목록을 불러오는데 실패했습니다.');
    }

    return response.data.repositories;
  } catch (error) {

    throw error;
  }
};

/**
 * 특정 저장소 정보 조회
 * @param userId - 사용자 ID
 * @param fullName - 저장소 full_name (예: "owner/repo")
 * @returns 저장소 정보
 */
export const getRepository = async (
  userId: string,
  fullName: string
): Promise<UserRepository | null> => {
  try {
    const repositories = await getUserRepositories(userId);
    const repo = repositories.find(
      (r) => r.full_name === fullName
    );
    return repo || null;
  } catch (error) {

    throw error;
  }
};

export const repositoriesApi = {
  getUserRepositories,
  getRepository,
};

export default repositoriesApi;
