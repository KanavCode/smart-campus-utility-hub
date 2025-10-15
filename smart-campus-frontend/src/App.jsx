import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import useAuthStore from "./hooks/useAuthStore";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ElectivesPage = lazy(() => import("./pages/ElectivesPage"));
const TimetablePage = lazy(() => import("./pages/TimetablePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

// Loading component
function PageLoader() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-primary-500/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-white/70 font-medium">Loading...</p>
      </div>
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
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
                        <RegisterPage />
                      </PublicRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <DashboardPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/events"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <EventsPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/electives"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <ElectivesPage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/timetable"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <TimetablePage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <ErrorBoundary>
                          <ProfilePage />
                        </ErrorBoundary>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="*"
                    element={
                      <div className="container mx-auto px-4 py-12 text-center">
                        <h1 className="text-6xl font-display font-bold mb-4">
                          404
                        </h1>
                        <p className="text-xl text-textSecondary dark:text-textSecondary-dark">
                          Page not found
                        </p>
                      </div>
                    }
                  />
                </Routes>
              </Suspense>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
