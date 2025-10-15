/**
 * Application Routes
 * Engineer 💻: Centralized routing configuration with layouts
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import useAuthStore from './hooks/useAuth';
import { Skeleton } from './components/ui/SkeletonLoader';

// Layouts
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Pages
import { LoginPage } from './pages/LoginPage';

// Lazy loaded pages
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const TimetablePage = lazy(() => import('./pages/TimetablePage'));
const ElectivesPage = lazy(() => import('./pages/ElectivesPage'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <Skeleton variant="circle" width={80} height={80} className="mx-auto" />
      <Skeleton variant="text" className="w-48 mx-auto" />
      <Skeleton variant="text" className="w-32 mx-auto" />
    </div>
  </div>
);

/**
 * Protected Route wrapper
 * Redirects to login if not authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

/**
 * Public Route wrapper
 * Redirects to dashboard if already authenticated
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

export const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Landing Page - No Layout */}
        <Route
          path="/"
          element={
            <Suspense fallback={<PageLoader />}>
              <LandingPage />
            </Suspense>
          }
        />

        {/* Auth Routes - Using AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Suspense fallback={<PageLoader />}>
                  <RegisterPage />
                </Suspense>
              </PublicRoute>
            }
          />
        </Route>

        {/* Protected Routes - Using DashboardLayout */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/dashboard"
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          
          {/* Placeholder routes for future tasks */}
          <Route
            path="/events"
            element={
              <Suspense fallback={<PageLoader />}>
                <EventsPage />
              </Suspense>
            }
          />
          <Route
            path="/timetable"
            element={
              <Suspense fallback={<PageLoader />}>
                <TimetablePage />
              </Suspense>
            }
          />
          <Route
            path="/electives"
            element={
              <Suspense fallback={<PageLoader />}>
                <ElectivesPage />
              </Suspense>
            }
          />
          
          {/* Profile & Settings Pages */}
          <Route
            path="/profile"
            element={
              <Suspense fallback={<PageLoader />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path="/settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
          
          <Route path="/help" element={<div className="p-6 heading-2">Help Center (Coming Soon)</div>} />
        </Route>

        {/* Catch all - redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};
