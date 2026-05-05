import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ConnectivityProvider } from "@/contexts/ConnectivityContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

const StudentDashboard = lazy(() => import("./pages/student/Dashboard"));
const Timetable = lazy(() => import("./pages/student/Timetable"));
const EventsPage = lazy(() => import("./pages/student/Events"));
const Electives = lazy(() => import("./pages/student/Electives"));
const StudentProfile = lazy(() => import("./pages/student/Profile"));
const SavedEvents = lazy(() => import("./pages/student/SavedEvents"));
const StudentClubs = lazy(() => import("./pages/student/Clubs"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminProfile = lazy(() => import("./pages/admin/Profile"));
const Users = lazy(() => import("./pages/admin/Users"));
const Events = lazy(() => import("./pages/admin/Events"));
const AdminElectives = lazy(() => import("./pages/admin/AdminElectives"));
const TimetableManagement = lazy(() => import("./pages/admin/Timetable"));
const Subjects = lazy(() => import("./pages/admin/Subjects"));
const Clubs = lazy(() => import("./pages/admin/Clubs"));
const Teachers = lazy(() => import("./pages/admin/Teachers"));
const Rooms = lazy(() => import("./pages/admin/Rooms"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const Chatbot = lazy(() => import("./components/chatbot/Chatbot"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
    Loading...
  </div>
);

const RoutePreloader = () => {
  useEffect(() => {
    const preloadRoutes = () => {
      void import("./pages/student/Dashboard");
      void import("./pages/student/Timetable");
      void import("./pages/admin/AdminDashboard");
      void import("./pages/admin/Users");
      void import("./components/chatbot/Chatbot");
    };

    if (typeof window.requestIdleCallback === "function") {
      const callbackId = window.requestIdleCallback(preloadRoutes);
      return () => window.cancelIdleCallback(callbackId);
    }

    const timeoutId = window.setTimeout(preloadRoutes, 1200);
    return () => window.clearTimeout(timeoutId);
  }, []);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <ConnectivityProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <OfflineBanner />
              <RoutePreloader />
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Student Routes */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/my-timetable"
                  element={
                    <ProtectedRoute>
                      <Timetable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-timetable"
                  element={
                    <ProtectedRoute>
                      <Timetable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/events"
                  element={
                    <ProtectedRoute>
                      <EventsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/electives"
                  element={
                    <ProtectedRoute>
                      <Electives />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/electives"
                  element={
                    <ProtectedRoute>
                      <Electives />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/profile"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <StudentProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/saved-events"
                  element={
                    <ProtectedRoute>
                      <SavedEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/saved-events"
                  element={
                    <ProtectedRoute>
                      <SavedEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/student/clubs"
                  element={
                    <ProtectedRoute>
                      <StudentClubs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/clubs"
                  element={
                    <ProtectedRoute>
                      <StudentClubs />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <Users />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/events"
                  element={
                    <ProtectedRoute adminOnly>
                      <Events />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/electives"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminElectives />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/timetable"
                  element={
                    <ProtectedRoute adminOnly>
                      <TimetableManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/subjects"
                  element={
                    <ProtectedRoute adminOnly>
                      <Subjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/clubs"
                  element={
                    <ProtectedRoute adminOnly>
                      <Clubs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/teachers"
                  element={
                    <ProtectedRoute adminOnly>
                      <Teachers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/rooms"
                  element={
                    <ProtectedRoute adminOnly>
                      <Rooms />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <ProtectedRoute adminOnly>
                      <Settings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Chatbot />
            </Suspense>
          </BrowserRouter>
          </TooltipProvider>
        </ConnectivityProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
