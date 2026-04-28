import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { AlertCircle, Home, LogOut } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleGoHome = () => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 mb-4">
            You don't have permission to access this page. Please contact your administrator if you believe this is a mistake.
          </p>

          {/* Error Code */}
          <div className="bg-slate-50 dark:bg-slate-700 rounded p-3 mb-6">
            <p className="text-sm font-mono text-slate-600 dark:text-slate-300">
              Error Code: 403 Forbidden
            </p>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 mb-6">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                <span className="font-semibold">Current Role:</span>{' '}
                <span className="capitalize font-mono bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {user.role}
                </span>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 flex flex-col">
            <Button
              onClick={handleGoHome}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>

            {isAuthenticated && (
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}

            {!isAuthenticated && (
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="w-full"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Help Text */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
            If you continue to experience issues, please contact support at support@campus.edu
          </p>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
