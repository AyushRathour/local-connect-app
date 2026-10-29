import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, NotificationItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; phone?: string; password: string; role: string }) => Promise<void>;
  logout: () => Promise<void>;
  switchDemoRole: (role: 'customer' | 'provider' | 'admin') => Promise<void>;
  notifications: NotificationItem[];
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('local_connect_token');
    if (!token) {
      // Default to demo John Doe customer for instant review if no token
      api
        .switchDemo('customer')
        .then((res) => {
          localStorage.setItem('local_connect_token', res.token);
          setUser(res.user);
        })
        .catch(() => setUser(null))
        .finally(() => setIsLoading(false));
      return;
    }

    api
      .getMe()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        localStorage.removeItem('local_connect_token');
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Sync notifications periodically or when user changes
  const refreshNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const res = await api.getNotifications();
      if (res.success && res.data) {
        setNotifications(res.data);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user?.id]);

  const login = async (emailOrPhone: string, password: string) => {
    const res = await api.login({ emailOrPhone, password });
    localStorage.setItem('local_connect_token', res.token);
    setUser(res.user);
    await refreshNotifications();
  };

  const register = async (payload: { name: string; email: string; phone?: string; password: string; role: string }) => {
    const res = await api.register(payload);
    localStorage.setItem('local_connect_token', res.token);
    setUser(res.user);
    await refreshNotifications();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    localStorage.removeItem('local_connect_token');
    setUser(null);
    setNotifications([]);
  };

  const switchDemoRole = async (role: 'customer' | 'provider' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.switchDemo(role);
      localStorage.setItem('local_connect_token', res.token);
      setUser(res.user);
      await refreshNotifications();
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        switchDemoRole,
        notifications,
        unreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
