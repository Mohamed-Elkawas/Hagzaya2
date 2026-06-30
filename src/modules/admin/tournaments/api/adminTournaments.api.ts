import apiClient from '../../../../core/api/api-client';
import type { AdminTournamentItem, PlatformReportResponse } from '../types/adminTournaments.types';

export const adminTournamentsApi = {
  getAllTournaments: async (status?: string): Promise<AdminTournamentItem[]> => {
    let url = '/api/admin/tournaments';
    if (status && status !== 'All') {
      url += `?status=${encodeURIComponent(status)}`;
    }
    const data = await apiClient.get<AdminTournamentItem[]>(url);
    return data;
  },

  deleteTournament: async (tournamentId: number): Promise<void> => {
    await apiClient.delete(`/api/admin/tournaments/${tournamentId}`);
  },

  getPlatformReports: async (): Promise<PlatformReportResponse> => {
    const data = await apiClient.get<PlatformReportResponse>('/api/admin/reports');
    return data;
  }
};
