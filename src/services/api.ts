import {
  User,
  Service,
  ServiceCategory,
  Booking,
  Review,
  ProviderProfile,
  NotificationItem,
  ContactMessage,
} from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('local_connect_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  register: (payload: { name: string; email: string; phone?: string; password: string; role: string }) =>
    request<{ success: boolean; token: string; user: User; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  login: (payload: { emailOrPhone: string; password: string }) =>
    request<{ success: boolean; token: string; user: User; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getMe: () => request<{ success: boolean; user: User }>('/auth/me'),

  logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),

  switchDemo: (role: 'customer' | 'provider' | 'admin') =>
    request<{ success: boolean; token: string; user: User }>(`/auth/demo-switch/${role}`),

  forgotPassword: (email: string) =>
    request<{ success: boolean; message: string; demoToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (payload: { token: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Services
  getServices: (params: Record<string, string | number> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    return request<{
      success: boolean;
      data: Service[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/services?${query.toString()}`);
  },

  getServiceById: (id: string) =>
    request<{
      success: boolean;
      data: Service & { providerProfile?: ProviderProfile; reviews: Review[]; relatedServices: Service[] };
    }>(`/services/${id}`),

  createService: (payload: Partial<Service>) =>
    request<{ success: boolean; message: string; data: Service }>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateService: (id: string, payload: Partial<Service>) =>
    request<{ success: boolean; message: string; data: Service }>(`/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  deleteService: (id: string) =>
    request<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    }),

  // Categories
  getCategories: () => request<{ success: boolean; data: ServiceCategory[] }>('/categories'),

  // Bookings
  getMyBookings: () => request<{ success: boolean; data: Booking[] }>('/bookings/my'),

  getBookingById: (id: string) => request<{ success: boolean; data: Booking }>(`/bookings/${id}`),

  createBooking: (payload: {
    serviceId: string;
    appointmentDate: string;
    startTime: string;
    address: string;
    city?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; message: string; data: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateBookingStatus: (id: string, status: Booking['status']) =>
    request<{ success: boolean; message: string; data: Booking }>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  cancelBooking: (id: string) =>
    request<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    }),

  // Providers
  getProviders: () => request<{ success: boolean; data: ProviderProfile[] }>('/providers'),

  getProviderById: (id: string) =>
    request<{
      success: boolean;
      data: ProviderProfile & { services: Service[]; reviews: Review[] };
    }>(`/providers/${id}`),

  getMyProviderProfile: () => request<{ success: boolean; data: ProviderProfile }>('/providers/me'),

  updateMyProviderProfile: (payload: Partial<ProviderProfile>) =>
    request<{ success: boolean; message: string; data: ProviderProfile }>('/providers/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  // Reviews
  createReview: (payload: { bookingId: string; rating: number; comment: string }) =>
    request<{ success: boolean; message: string; data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteReview: (id: string) =>
    request<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    }),

  // Contact
  submitContact: (payload: { name: string; email: string; phone?: string; subject?: string; message: string }) =>
    request<{ success: boolean; message: string; data: ContactMessage }>('/contact', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getContactMessages: () => request<{ success: boolean; data: ContactMessage[] }>('/contact/messages'),

  updateContactStatus: (id: string, status: ContactMessage['status']) =>
    request<{ success: boolean; data: ContactMessage }>(`/contact/messages/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Admin
  getAdminStats: () =>
    request<{
      success: boolean;
      data: {
        metrics: {
          totalUsers: number;
          totalProviders: number;
          totalServices: number;
          totalBookings: number;
          actualUserCount: number;
          actualProviderCount: number;
          actualServiceCount: number;
          actualBookingCount: number;
          grossBookingValue: number;
          statusDistribution: Record<string, number>;
        };
        recentUsers: Array<{
          id: string;
          name: string;
          email: string;
          role: string;
          accountStatus: string;
          createdAt: string;
        }>;
        recentBookings: Booking[];
      };
    }>('/admin/stats'),

  getAdminUsers: (params: { search?: string; role?: string; status?: string } = {}) => {
    const q = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ success: boolean; data: User[] }>(`/admin/users?${q}`);
  },

  updateUserStatus: (id: string, status: 'active' | 'suspended', reason?: string) =>
    request<{ success: boolean; message: string; data: User }>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    }),

  getAdminProviders: () => request<{ success: boolean; data: ProviderProfile[] }>('/admin/providers'),

  updateProviderVerification: (id: string, status: 'verified' | 'pending' | 'rejected', remarks?: string) =>
    request<{ success: boolean; message: string; data: ProviderProfile }>(`/admin/providers/${id}/verification`, {
      method: 'PATCH',
      body: JSON.stringify({ status, remarks }),
    }),

  getAdminBookings: (params: { status?: string; search?: string } = {}) => {
    const q = new URLSearchParams(params).toString();
    return request<{ success: boolean; data: Booking[] }>(`/admin/bookings?${q}`);
  },

  // Notifications
  getNotifications: () => request<{ success: boolean; data: NotificationItem[] }>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PATCH' }),
};
