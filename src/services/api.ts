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
import { clientDb } from './clientDb';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('local_connect_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

// Helper to determine if we are in a static hosting environment like GitHub Pages
function isStaticEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.endsWith('github.io');
}

async function tryServerRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  // If explicitly on github.io, avoid failing fetch calls to /api/v1
  if (isStaticEnvironment()) {
    return null;
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Check if 404 HTML was returned (indicating no backend server on static host)
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 && contentType.includes('text/html')) {
        return null;
      }
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err: any) {
    // If connection refused or 404, return null to activate clientDb fallback
    if (err.message && err.message.includes('fetch')) {
      return null;
    }
    // If it's a real server validation error (e.g. 400 or 409), rethrow
    if (err.message && !err.message.includes('status 404')) {
      throw err;
    }
    return null;
  }
}

// Current logged in user helper from clientDb
function getClientAuthUser(): User | null {
  const token = localStorage.getItem('local_connect_token');
  if (!token) return null;
  const userId = token.replace('token_', '');
  return clientDb.get().users.find((u) => u.id === userId) || null;
}

export const api = {
  // Auth
  register: async (payload: { name: string; email: string; phone?: string; password: string; role: string }) => {
    const serverResult = await tryServerRequest<{
      success: boolean;
      token: string;
      user: User;
      message: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    // Client fallback
    const role = (payload.role === 'admin' ? 'admin' : payload.role === 'provider' ? 'provider' : 'customer') as any;
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone?.trim(),
      role,
      accountStatus: 'active',
      avatar:
        role === 'provider'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      createdAt: new Date().toISOString(),
    };

    clientDb.update((db) => {
      db.users.push(newUser);
      if (role === 'provider') {
        db.providers.push({
          id: `prov_${Date.now()}`,
          userId: newUser.id,
          businessName: `${newUser.name}'s Services`,
          bio: 'Verified service technician.',
          experienceYears: 2,
          serviceAreas: ['Local Region'],
          verificationStatus: 'verified',
          rating: 5.0,
          reviewsCount: 0,
          completedJobs: 0,
          hourlyRate: 350,
          profileImage: newUser.avatar!,
          phone: newUser.phone || '',
          email: newUser.email,
          availability: {
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            slots: ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'],
            unavailableDates: [],
          },
        });
      }
    });

    const token = `token_${newUser.id}`;
    return {
      success: true,
      token,
      user: newUser,
      message: 'Account registered successfully.',
    };
  },

  login: async (payload: { emailOrPhone: string; password: string }) => {
    const serverResult = await tryServerRequest<{
      success: boolean;
      token: string;
      user: User;
      message: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    // Client fallback
    const idf = payload.emailOrPhone.toLowerCase().trim();
    const user = clientDb.get().users.find((u) => u.email.toLowerCase() === idf || (u.phone && u.phone.includes(idf)));

    if (!user) {
      throw new Error('User not found. Try one of the quick 1-click demo buttons.');
    }

    const token = `token_${user.id}`;
    return {
      success: true,
      token,
      user,
      message: 'Logged in successfully.',
    };
  },

  getMe: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; user: User }>('/auth/me');
    if (serverResult) return serverResult;

    const user = getClientAuthUser();
    if (!user) {
      throw new Error('Not authenticated');
    }
    return { success: true, user };
  },

  logout: async () => {
    await tryServerRequest<{ success: boolean }>('/auth/logout', { method: 'POST' });
    return { success: true };
  },

  switchDemo: async (role: 'customer' | 'provider' | 'admin') => {
    const serverResult = await tryServerRequest<{ success: boolean; token: string; user: User }>(
      `/auth/demo-switch/${role}`
    );
    if (serverResult) return serverResult;

    // Client fallback
    let target = clientDb.get().users.find((u) => (role === 'admin' ? u.role === 'admin' : role === 'provider' ? u.role === 'provider' : u.id === 'usr_customer_1'));
    if (!target) {
      target = clientDb.get().users[0];
    }
    const token = `token_${target.id}`;
    return { success: true, token, user: target };
  },

  forgotPassword: async (email: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; demoToken?: string }>(
      '/auth/forgot-password',
      { method: 'POST', body: JSON.stringify({ email }) }
    );
    if (serverResult) return serverResult;

    return {
      success: true,
      message: `Password reset link generated for ${email}.`,
      demoToken: 'reset_usr_customer_1_demo',
    };
  },

  resetPassword: async (payload: { token: string; newPassword: string }) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    return { success: true, message: 'Password updated successfully.' };
  },

  // Services
  getServices: async (params: Record<string, string | number> = {}) => {
    const serverResult = await tryServerRequest<{
      success: boolean;
      data: Service[];
      pagination: { total: number; page: number; limit: number; totalPages: number };
    }>(`/services`);
    if (serverResult && Object.keys(params).length === 0) return serverResult;

    // Client fallback & filtering
    let list = [...clientDb.get().services];
    if (params.search) {
      const q = String(params.search).toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.categoryName.toLowerCase().includes(q) ||
          s.providerName.toLowerCase().includes(q)
      );
    }
    if (params.category && params.category !== 'all') {
      const cat = String(params.category).toLowerCase().trim();
      list = list.filter((s) => s.categoryId.toLowerCase() === cat || s.categoryName.toLowerCase() === cat);
    }
    if (params.location) {
      const loc = String(params.location).toLowerCase().trim();
      list = list.filter((s) => s.serviceArea.toLowerCase().includes(loc) || loc.includes(s.serviceArea.toLowerCase()));
    }
    if (params.minPrice) {
      list = list.filter((s) => s.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      list = list.filter((s) => s.price <= Number(params.maxPrice));
    }
    if (params.minRating) {
      list = list.filter((s) => s.rating >= Number(params.minRating));
    }

    if (params.sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else {
      list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    }

    const total = list.length;
    const page = Number(params.page || 1);
    const limit = Number(params.limit || 9);
    const paginated = list.slice((page - 1) * limit, page * limit);

    return {
      success: true,
      data: paginated,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  getServiceById: async (id: string) => {
    const serverResult = await tryServerRequest<{
      success: boolean;
      data: Service & { providerProfile?: ProviderProfile; reviews: Review[]; relatedServices: Service[] };
    }>(`/services/${id}`);
    if (serverResult) return serverResult;

    const service = clientDb.get().services.find((s) => s.id === id);
    if (!service) throw new Error('Service not found');

    const providerProfile = clientDb.get().providers.find((p) => p.userId === service.providerId);
    const reviews = clientDb.get().reviews.filter((r) => r.serviceId === service.id);
    const relatedServices = clientDb
      .get()
      .services.filter((s) => s.categoryId === service.categoryId && s.id !== service.id)
      .slice(0, 3);

    return {
      success: true,
      data: {
        ...service,
        providerProfile,
        reviews,
        relatedServices,
      },
    };
  },

  createService: async (payload: Partial<Service>) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: Service }>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    const user = getClientAuthUser() || clientDb.get().users.find((u) => u.role === 'provider')!;
    const category = clientDb.get().categories.find((c) => c.id === payload.categoryId) || clientDb.get().categories[0];

    const newSvc: Service = {
      id: `srv_${Date.now()}`,
      providerId: user.id,
      providerName: user.name,
      providerAvatar: user.avatar,
      categoryId: category.id,
      categoryName: category.name,
      title: payload.title || 'Specialized Service',
      description: payload.description || 'Professional on-demand service.',
      price: payload.price || 350,
      durationMinutes: payload.durationMinutes || 60,
      serviceArea: payload.serviceArea || 'Delhi NCR',
      rating: 5.0,
      reviewsCount: 0,
      image:
        payload.image ||
        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80',
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    clientDb.update((db) => {
      db.services.unshift(newSvc);
    });

    return { success: true, message: 'Service published successfully.', data: newSvc };
  },

  updateService: async (id: string, payload: Partial<Service>) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: Service }>(
      `/services/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    if (serverResult) return serverResult;

    let updated: Service | undefined;
    clientDb.update((db) => {
      const s = db.services.find((item) => item.id === id);
      if (s) {
        Object.assign(s, payload);
        updated = s;
      }
    });

    return { success: true, message: 'Service updated.', data: updated! };
  },

  deleteService: async (id: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string }>(`/services/${id}`, {
      method: 'DELETE',
    });
    if (serverResult) return serverResult;

    clientDb.update((db) => {
      db.services = db.services.filter((s) => s.id !== id);
    });
    return { success: true, message: 'Service deleted.' };
  },

  // Categories
  getCategories: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ServiceCategory[] }>('/categories');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().categories };
  },

  // Bookings
  getMyBookings: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: Booking[] }>('/bookings/my');
    if (serverResult) return serverResult;

    const user = getClientAuthUser();
    const all = clientDb.get().bookings;
    if (!user || user.role === 'admin') {
      return { success: true, data: all };
    }
    if (user.role === 'provider') {
      return { success: true, data: all.filter((b) => b.providerId === user.id) };
    }
    return { success: true, data: all.filter((b) => b.customerId === user.id) };
  },

  getBookingById: async (id: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; data: Booking }>(`/bookings/${id}`);
    if (serverResult) return serverResult;

    const booking = clientDb.get().bookings.find((b) => b.id === id);
    if (!booking) throw new Error('Booking not found');
    return { success: true, data: booking };
  },

  createBooking: async (payload: {
    serviceId: string;
    appointmentDate: string;
    startTime: string;
    address: string;
    city?: string;
    notes?: string;
  }) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: Booking }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    const user = getClientAuthUser() || clientDb.get().users.find((u) => u.role === 'customer')!;
    const service = clientDb.get().services.find((s) => s.id === payload.serviceId);
    if (!service) throw new Error('Service not found');

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      providerId: service.providerId,
      providerName: service.providerName,
      serviceId: service.id,
      serviceTitle: service.title,
      categoryName: service.categoryName,
      appointmentDate: payload.appointmentDate,
      startTime: payload.startTime,
      endTime: '11:00 AM',
      address: payload.address,
      city: payload.city || 'New Delhi',
      notes: payload.notes,
      agreedPrice: service.price,
      status: 'pending',
      paymentStatus: 'unpaid',
      hasReview: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clientDb.update((db) => {
      db.bookings.unshift(newBooking);
      db.notifications.unshift({
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: 'Booking Placed',
        message: `Your booking for "${service.title}" has been placed.`,
        type: 'booking_request',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    return { success: true, message: 'Booking confirmed.', data: newBooking };
  },

  updateBookingStatus: async (id: string, status: Booking['status']) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: Booking }>(
      `/bookings/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    if (serverResult) return serverResult;

    let updated: Booking | undefined;
    clientDb.update((db) => {
      const b = db.bookings.find((item) => item.id === id);
      if (b) {
        b.status = status;
        b.updatedAt = new Date().toISOString();
        if (status === 'completed') b.paymentStatus = 'paid';
        updated = b;
      }
    });

    return { success: true, message: `Booking status updated to ${status}.`, data: updated! };
  },

  cancelBooking: async (id: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string }>(`/bookings/${id}/cancel`, {
      method: 'PATCH',
    });
    if (serverResult) return serverResult;

    clientDb.update((db) => {
      const b = db.bookings.find((item) => item.id === id);
      if (b) {
        b.status = 'cancelled';
        b.updatedAt = new Date().toISOString();
      }
    });
    return { success: true, message: 'Booking cancelled.' };
  },

  // Providers
  getProviders: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ProviderProfile[] }>('/providers');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().providers };
  },

  getProviderById: async (id: string) => {
    const serverResult = await tryServerRequest<{
      success: boolean;
      data: ProviderProfile & { services: Service[]; reviews: Review[] };
    }>(`/providers/${id}`);
    if (serverResult) return serverResult;

    const provider = clientDb.get().providers.find((p) => p.id === id || p.userId === id);
    if (!provider) throw new Error('Provider not found');

    const services = clientDb.get().services.filter((s) => s.providerId === provider.userId);
    const reviews = clientDb.get().reviews.filter((r) => r.providerId === provider.userId);

    return { success: true, data: { ...provider, services, reviews } };
  },

  getMyProviderProfile: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ProviderProfile }>('/providers/me');
    if (serverResult) return serverResult;

    const user = getClientAuthUser() || clientDb.get().users.find((u) => u.role === 'provider');
    const profile = clientDb.get().providers.find((p) => p.userId === user?.id) || clientDb.get().providers[0];
    return { success: true, data: profile };
  },

  updateMyProviderProfile: async (payload: Partial<ProviderProfile>) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: ProviderProfile }>(
      '/providers/me',
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }
    );
    if (serverResult) return serverResult;

    let updated: ProviderProfile | undefined;
    clientDb.update((db) => {
      const p = db.providers[0];
      if (p) {
        Object.assign(p, payload);
        updated = p;
      }
    });

    return { success: true, message: 'Profile updated.', data: updated! };
  },

  // Reviews
  createReview: async (payload: { bookingId: string; rating: number; comment: string }) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: Review }>('/reviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (serverResult) return serverResult;

    const booking = clientDb.get().bookings.find((b) => b.id === payload.bookingId);
    const user = getClientAuthUser() || clientDb.get().users[0];

    const newRev: Review = {
      id: `rev_${Date.now()}`,
      bookingId: payload.bookingId,
      customerId: user.id,
      customerName: user.name,
      customerAvatar: user.avatar,
      providerId: booking?.providerId || 'usr_provider_1',
      serviceId: booking?.serviceId || 'srv_1',
      serviceTitle: booking?.serviceTitle || 'Service',
      rating: payload.rating,
      comment: payload.comment,
      createdAt: new Date().toISOString(),
    };

    clientDb.update((db) => {
      db.reviews.unshift(newRev);
      const b = db.bookings.find((item) => item.id === payload.bookingId);
      if (b) b.hasReview = true;
    });

    return { success: true, message: 'Review recorded.', data: newRev };
  },

  deleteReview: async (id: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
    if (serverResult) return serverResult;

    clientDb.update((db) => {
      db.reviews = db.reviews.filter((r) => r.id !== id);
    });
    return { success: true, message: 'Review deleted.' };
  },

  // Contact
  submitContact: async (payload: { name: string; email: string; phone?: string; subject?: string; message: string }) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: ContactMessage }>(
      '/contact',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    if (serverResult) return serverResult;

    const newMsg: ContactMessage = {
      id: `msg_${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      subject: payload.subject || 'General Inquiry',
      message: payload.message,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    clientDb.update((db) => {
      db.contactMessages.unshift(newMsg);
    });

    return {
      success: true,
      message: 'Thank you for contacting LocalServices. Our support team will respond shortly.',
      data: newMsg,
    };
  },

  getContactMessages: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ContactMessage[] }>('/contact/messages');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().contactMessages };
  },

  updateContactStatus: async (id: string, status: ContactMessage['status']) => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ContactMessage }>(
      `/contact/messages/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    if (serverResult) return serverResult;

    let updated: ContactMessage | undefined;
    clientDb.update((db) => {
      const m = db.contactMessages.find((item) => item.id === id);
      if (m) {
        m.status = status;
        updated = m;
      }
    });

    return { success: true, data: updated! };
  },

  // Admin
  getAdminStats: async () => {
    const serverResult = await tryServerRequest<any>('/admin/stats');
    if (serverResult) return serverResult;

    const db = clientDb.get();
    return {
      success: true,
      data: {
        metrics: {
          totalUsers: Math.max(120, db.users.length),
          totalProviders: Math.max(45, db.providers.length),
          totalServices: Math.max(28, db.services.length),
          totalBookings: Math.max(186, db.bookings.length),
          grossBookingValue: 12500,
          statusDistribution: {
            pending: 4,
            confirmed: 6,
            completed: 8,
            cancelled: 1,
            rejected: 0,
          },
        },
        recentUsers: db.users.slice(0, 8),
        recentBookings: db.bookings.slice(0, 8),
      },
    };
  },

  getAdminUsers: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: User[] }>('/admin/users');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().users };
  },

  updateUserStatus: async (id: string, status: 'active' | 'suspended', reason?: string) => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: User }>(
      `/admin/users/${id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, reason }),
      }
    );
    if (serverResult) return serverResult;

    let updated: User | undefined;
    clientDb.update((db) => {
      const u = db.users.find((item) => item.id === id);
      if (u) {
        u.accountStatus = status;
        updated = u;
      }
    });

    return { success: true, message: `User status set to ${status}.`, data: updated! };
  },

  getAdminProviders: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: ProviderProfile[] }>('/admin/providers');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().providers };
  },

  updateProviderVerification: async (id: string, status: 'verified' | 'pending' | 'rejected') => {
    const serverResult = await tryServerRequest<{ success: boolean; message: string; data: ProviderProfile }>(
      `/admin/providers/${id}/verification`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }
    );
    if (serverResult) return serverResult;

    let updated: ProviderProfile | undefined;
    clientDb.update((db) => {
      const p = db.providers.find((item) => item.id === id || item.userId === id);
      if (p) {
        p.verificationStatus = status;
        updated = p;
      }
    });

    return { success: true, message: `Provider status set to ${status}.`, data: updated! };
  },

  getAdminBookings: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: Booking[] }>('/admin/bookings');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().bookings };
  },

  // Notifications
  getNotifications: async () => {
    const serverResult = await tryServerRequest<{ success: boolean; data: NotificationItem[] }>('/notifications');
    if (serverResult) return serverResult;
    return { success: true, data: clientDb.get().notifications };
  },

  markNotificationRead: async (id: string) => {
    const serverResult = await tryServerRequest<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
    if (serverResult) return serverResult;

    clientDb.update((db) => {
      const n = db.notifications.find((item) => item.id === id);
      if (n) n.isRead = true;
    });
    return { success: true };
  },

  markAllNotificationsRead: async () => {
    const serverResult = await tryServerRequest<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH',
    });
    if (serverResult) return serverResult;

    clientDb.update((db) => {
      db.notifications.forEach((n) => (n.isRead = true));
    });
    return { success: true };
  },
};
