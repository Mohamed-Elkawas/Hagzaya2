export interface TopFieldItem {
  name: string;
  bookingsCount: number;
  revenue: number;
}

export interface TopOwnerItem {
  ownerName: string;
  fieldsCount: number;
  totalRevenue: number;
}

export interface PlatformReportResponse {
  totalUsers: number;
  newUsersThisMonth: number;
  totalBookingsAllTime: number;
  totalPlatformRevenue: number;
  totalTournamentsAllTime: number;
  averageFieldRating: number;
  topFields: TopFieldItem[];
  topOwners: TopOwnerItem[];
}

export interface AdminTournamentItem {
  id: number;
  name: string;
  status: 'Upcoming' | 'Completed' | 'Ongoing' | 'Cancelled';
  fieldName: string;
  ownerName: string;
  teamsJoined: number;
  numberOfTeams: number;
  price: number;
  totalRevenue: number;
  startDate: string;
  endDate: string;
  pendingPayments: number;
}
