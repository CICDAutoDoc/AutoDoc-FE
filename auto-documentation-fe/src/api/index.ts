// API Client
export { default as apiClient } from './client';

// API Endpoints
export * from './endpoints/auth';
export * from './endpoints/repositories';
export * from './endpoints/webhooks';

// Types
export * from './types';

// Default exports
import authApi from './endpoints/auth';
import repositoriesApi from './endpoints/repositories';
import webhooksApi from './endpoints/webhooks';

export const api = {
  auth: authApi,
  repositories: repositoriesApi,
  webhooks: webhooksApi,
};

export default api;
