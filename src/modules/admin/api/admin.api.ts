import { apiClient } from '../../../core/api/api-client';
import type { AdminDashboardResponse } from '../types/admin.types';

export async function getAdminDashboardRequest(): Promise<AdminDashboardResponse> {
  return await apiClient.get<AdminDashboardResponse>('/api/admin/dashboard');
}
