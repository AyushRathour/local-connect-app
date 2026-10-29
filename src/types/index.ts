export type UserRole = 'customer' | 'provider' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  accountStatus: 'active' | 'suspended';
  avatar?: string;
  createdAt: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  categoryId: string;
  categoryName: string;
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  serviceArea: string;
  rating: number;
  reviewsCount: number;
  image: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceTitle: string;
  categoryName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  address: string;
  city: string;
  notes?: string;
  agreedPrice: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
  paymentStatus: 'unpaid' | 'paid_on_completion' | 'paid';
  hasReview: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  providerId: string;
  serviceId: string;
  serviceTitle: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  businessName: string;
  bio: string;
  experienceYears: number;
  serviceAreas: string[];
  verificationStatus: 'verified' | 'pending' | 'rejected';
  rating: number;
  reviewsCount: number;
  completedJobs: number;
  hourlyRate: number;
  profileImage: string;
  phone: string;
  email: string;
  availability: {
    days: string[];
    slots: string[];
    unavailableDates: string[];
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'resolved';
  createdAt: string;
}
