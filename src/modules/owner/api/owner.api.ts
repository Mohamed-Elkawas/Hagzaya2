import axios from 'axios';

// Define the core types corresponding to the Owner API endpoints
export interface DashboardStats {
  totalRevenue: number;
  totalBookings: number;
  utilizationRate: number;
  totalPlayers: number;
  pendingRequests: number;
  revenueTrend: Array<{ day: string; revenue: number }>;
  upcomingBookings: Array<{
    id: number;
    fieldName: string;
    status: string;
    timeRange: string;
    date: string;
    playerName: string;
  }>;
}

export interface BookingRequest {
  id: number;
  playerName: string;
  fieldName: string;
  date: string;
  timeRange: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdOn: string;
}

export interface ApproveBookingPayload {
  referenceNumber?: string;
  notes?: string;
}

export interface DailyOperations {
  totalToday: number;
  pending: Array<any>;
  checkedIn: Array<any>;
  completed: Array<any>;
}

export interface DeletionSafetyCheck {
  fieldId: number;
  fieldName: string;
  upcomingBookings: number;
  activeTournaments: number;
  pendingPayments: number;
  canDelete: boolean;
}

export interface BlockSlotsPayload {
  date: string; // Format: YYYY-MM-DD
  slots: string[];
}

// ─── Axios Instance ───────────────────────────────────────────────────────────
const API = axios.create({
  baseURL: `${import.meta.env.VITE_PUBLIC_API_URL}/api/owner`,
});

// Request interceptor: auto-injects token + ngrok bypass header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('hagzaya_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['ngrok-skip-browser-warning'] = 'true';
  return config;
});

// Response interceptor: structured error parsing
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMsg =
      error.response?.data?.message ||
      error.response?.data?.title ||
      (typeof error.response?.data === 'string' ? error.response.data : null) ||
      error.message ||
      'Unknown server error';
    return Promise.reject(new Error(serverMsg));
  }
);

// ─── Owner API Handlers ───────────────────────────────────────────────────────
export const ownerApi = {
  getDashboardStats: async (period: string = 'weekly'): Promise<DashboardStats> => {
    const response = await API.get<DashboardStats>(`/dashboard`, { params: { period } });
    return response.data;
  },

  getBookingRequests: async (): Promise<BookingRequest[]> => {
    const response = await API.get<BookingRequest[]>('/booking-requests');
    return response.data;
  },

  approveBookingRequest: async (bookingId: number, payload: ApproveBookingPayload): Promise<void> => {
    await API.put(`/bookings/${bookingId}/approve`, payload);
  },

  getDailyOperations: async (): Promise<DailyOperations> => {
    const response = await API.get<DailyOperations>('/operations');
    return response.data;
  },

  checkDeletionSafety: async (fieldId: number): Promise<DeletionSafetyCheck> => {
    const response = await API.get<DeletionSafetyCheck>(`/fields/${fieldId}/deletion-check`);
    return response.data;
  },

  blockFieldSlots: async (fieldId: number, payload: BlockSlotsPayload): Promise<void> => {
    await API.post(`/fields/${fieldId}/block-slots`, payload);
  },

  deleteFieldSecurely: async (fieldId: number): Promise<void> => {
    await API.delete(`/fields/${fieldId}`);
  },
};
