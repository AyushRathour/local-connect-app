import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailsPage } from './pages/ServiceDetailsPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { ProviderDashboard } from './pages/ProviderDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

// Layout wrapper for public pages with standard Navbar & Footer
const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

// Route redirector for generic /dashboard path
const DashboardRedirector: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  return <Navigate to="/customer/dashboard" replace />;
};

// Protected route wrapper
const ProtectedDashboardRoute: React.FC<{
  allowedRoles: Array<'customer' | 'provider' | 'admin'>;
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-950 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If provider tries customer dashboard, redirect them to provider dashboard, etc.
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/customer/dashboard" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Public Pages with Top Bar and Footer */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/services"
            element={
              <PublicLayout>
                <ServicesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/services/:id"
            element={
              <PublicLayout>
                <ServiceDetailsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <ContactPage />
              </PublicLayout>
            }
          />

          {/* Authentication Two-Column Screens matching reference */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Dashboards with Dark Left Sidebar */}
          <Route path="/dashboard" element={<DashboardRedirector />} />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedDashboardRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedDashboardRoute allowedRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedDashboardRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedDashboardRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedDashboardRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}
