import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const response = await authService.forgotPassword(email);

      if (response.success) {
        setSubmitted(true);
        // Clear form
        setEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset link sent successfully</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-900">
                We've sent a password reset link to <strong>{email}</strong>. The link will expire in 15 minutes.
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-gray-600">
              <p>
                <strong>Didn't receive it?</strong> Check your spam or junk folder, or try requesting a new link below.
              </p>
            </div>

            <div className="space-y-2 pt-4">
              <Button
                onClick={() => {
                  setSubmitted(false);
                  setEmail('');
                  setError(null);
                }}
                className="w-full"
                variant="outline"
              >
                Send Another Link
              </Button>

              <Button onClick={handleBackToLogin} className="w-full" variant="default">
                Back to Login
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <p>For security, this link can only be used once and expires in 15 minutes.</p>
            </div>
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
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
          </div>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-900">{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full"
              />
              <p className="text-xs text-gray-500">
                Use the email address you registered with Smart Campus.
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading} size="lg">
              {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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
            onClick={handleBackToLogin}
            variant="outline"
            className="w-full"
            disabled={loading}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </CardContent>

        <div className="px-6 py-4 bg-gray-50 border-t text-center text-xs text-gray-600 rounded-b-lg">
          <p>
            Remember your password?{' '}
            <button
              type="button"
              onClick={handleBackToLogin}
              className="font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Sign In
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;
