import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { authService } from '@/services/authService';
import {
  validatePasswordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthBarColor,
  getPasswordRequirements,
  isValidPassword,
} from '@/lib/passwordValidation';
import {
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowLeft,
} from 'lucide-react';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invalidToken, setInvalidToken] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
      setError('No reset token provided. Please use the link from your email.');
    }
  }, [token]);

  const passwordStrength = validatePasswordStrength(password);
  const requirements = getPasswordRequirements(password);
  const strengthColor = getPasswordStrengthColor(passwordStrength.score);
  const strengthBarColor = getPasswordStrengthBarColor(passwordStrength.score);
  const passwordsMatch = password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password does not meet security requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.resetPassword(token, password, confirmPassword);

      if (response.success) {
        setSubmitted(true);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      }
    } catch (err: any) {
      if (err.message?.includes('expired')) {
        setError('Reset link has expired. Please request a new one.');
        setInvalidToken(true);
      } else {
        setError(err.message || 'Failed to reset password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToForgot = () => {
    navigate('/forgot-password');
  };

  // Success screen
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Password Reset Successful!</CardTitle>
            <CardDescription>Your password has been changed securely.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                Redirecting to login page... You can now sign in with your new password.
              </AlertDescription>
            </Alert>

            <Button onClick={() => navigate('/auth')} className="w-full" size="lg">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token screen
  if (invalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <CardDescription>The password reset link is invalid or has expired.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">
                Reset links are only valid for 15 minutes. Please request a new one.
              </AlertDescription>
            </Alert>

            <Button onClick={handleBackToForgot} className="w-full" size="lg">
              Request New Link
            </Button>

            <Button onClick={() => navigate('/auth')} variant="outline" className="w-full">
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="rounded-lg bg-indigo-100 p-2">
              <Lock className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          </div>
          <CardDescription>Enter a strong new password for your account.</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-medium text-gray-700">Password Strength</p>
                  <p className={`text-xs font-semibold ${strengthColor}`}>
                    {passwordStrength.message}
                  </p>
                </div>
                <Progress value={(passwordStrength.score / 4) * 100} className="h-2" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  {requirements.map((req, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <div
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                          req.met
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}
                      >
                        {req.met && <CheckCircle2 className="h-3 w-3 text-green-600" />}
                      </div>
                      <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-600'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className={`pr-10 ${
                    confirmPassword && passwordsMatch
                      ? 'border-green-500'
                      : confirmPassword
                        ? 'border-red-500'
                        : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600">Passwords match!</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isValidPassword(password) || !passwordsMatch}
              size="lg"
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or</span>
            </div>
          </div>

          <Button
            onClick={handleBackToForgot}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forgot Password
          </Button>
        </CardContent>

        <div className="px-6 py-4 bg-gray-50 border-t text-center text-xs text-gray-600 rounded-b-lg">
          <p className="font-semibold mb-2">Password Requirements:</p>
          <ul className="text-left space-y-1">
            <li>• At least 8 characters</li>
            <li>• One uppercase letter</li>
            <li>• One lowercase letter</li>
            <li>• One number</li>
            <li>• One special character</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;
