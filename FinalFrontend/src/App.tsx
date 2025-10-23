import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import StudentDashboard from "./pages/student/Dashboard";
import Timetable from "./pages/student/Timetable";
import EventsPage from "./pages/student/Events";
import Electives from "./pages/student/Electives";
import StudentProfile from "./pages/student/Profile";
import SavedEvents from "./pages/student/SavedEvents";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/Profile";
import Users from "./pages/admin/Users";
import Events from "./pages/admin/Events";
import AdminElectives from "./pages/admin/AdminElectives";
import TimetableManagement from "./pages/admin/Timetable";
import Subjects from "./pages/admin/Subjects";
import Clubs from "./pages/admin/Clubs";
import Teachers from "./pages/admin/Teachers";
import Rooms from "./pages/admin/Rooms";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />

              {/* Student Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <StudentDashboard />
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
                path="/events"
                element={
                  <ProtectedRoute>
                    <EventsPage />
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
                path="/profile"
                element={
                  <ProtectedRoute>
                    <StudentProfile />
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
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
