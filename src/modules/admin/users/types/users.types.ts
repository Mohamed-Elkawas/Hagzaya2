export interface BanUserRequest {
  reason: string;
}

export interface AdminUserListItem {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Player';
  isBanned: boolean;
  banReason: string | null;
  createdOn: string;
  // Player specific fields (nullable or missing for Owner)
  points: number | null;
  teamId: number | null;
  // Owner specific fields (nullable or missing for Player)
  fieldsCount: number | null;
  totalBookings: number | null;
  averageRating: number | null;
}

export interface AdminUsersResponse {
  page: number;
  pageSize: number;
  total: number;
  items: AdminUserListItem[];
}

export interface GetUsersParams {
  search?: string;
  role?: 'Owner' | 'Player';
  isBanned?: boolean;
  page: number;
  pageSize: number;
}