import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Calendar,
  Briefcase,
  BookOpen,
  User,
  LogOut,
} from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";
import useAuthStore from "../../hooks/useAuthStore";
import { fadeInDown } from "../../utils/animations";

/**
 * Navbar Component
 * Responsive navigation bar with theme toggle and user menu
 */
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navigationLinks = [
    { name: "Events", path: "/events", icon: Calendar },
    { name: "Electives", path: "/electives", icon: BookOpen },
    { name: "Timetable", path: "/timetable", icon: Briefcase },
  ];

  const isActivePath = (path) => location.pathname.startsWith(path);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <motion.nav
      className="sticky top-0 z-40 bg-white/80 dark:bg-background-dark/80 backdrop-blur-lg border-b border-border dark:border-border-dark"
      variants={fadeInDown}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-xl">SC</span>
            </div>
            <span className="font-display font-bold text-xl text-textPrimary dark:text-textPrimary-dark">
              Smart Campus
            </span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-1">
              {navigationLinks.map((link) => {
                const Icon = link.icon;
                const isActive = isActivePath(link.path);

                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`
                      px-4 py-2 rounded-lg font-medium transition-all duration-200
                      flex items-center gap-2
                      ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-textPrimary dark:text-textPrimary-dark hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {link.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-textPrimary dark:text-textPrimary-dark">
                    {user?.name}
                  </span>
                </button>

                {/* User Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      <motion.div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsUserMenuOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      />
                      <motion.div
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-backgroundAlt-dark rounded-lg shadow-xl border border-border dark:border-border-dark overflow-hidden z-20"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2 px-4 py-3 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark/50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          to="/profile"
                          className="flex items-center gap-2 px-4 py-3 hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark/50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-error hover:bg-error/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate("/login")}>
                  Login
                </Button>
                <Button variant="primary" onClick={() => navigate("/register")}>
                  Sign Up
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden border-t border-border dark:border-border-dark bg-white dark:bg-background-dark"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated &&
                navigationLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = isActivePath(link.path);

                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all
                      ${
                        isActive
                          ? "bg-primary text-white"
                          : "text-textPrimary dark:text-textPrimary-dark hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark"
                      }
                    `}
                    >
                      <Icon className="w-5 h-5" />
                      {link.name}
                    </Link>
                  );
                })}

              {isAuthenticated ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-all"
                  >
                    <User className="w-5 h-5" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-backgroundAlt dark:hover:bg-backgroundAlt-dark transition-all"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error/10 transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Button
                    variant="outline"
                    fullWidth
                    onClick={() => {
                      navigate("/login");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => {
                      navigate("/register");
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
