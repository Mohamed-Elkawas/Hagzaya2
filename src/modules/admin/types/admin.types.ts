export interface AdminDashboardResponse {
  totalPlayers: number;
  totalOwners: number;
  totalFields: number;
  approvedFields: number;
  pendingFields: number;
  totalBookings: number;
  bookingsToday: number;
  totalTournaments: number;
  activeTournaments: number;
  totalRevenue: number;
  pendingFieldApprovals: number;
  pendingPaymentReviews: number;
  revenueTrend: { day: string; revenue: number }[];
}
