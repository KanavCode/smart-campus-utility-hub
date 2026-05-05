import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { RegisterRequest } from '@/services/authService';
import AuthBackground from '@/components/animations/AuthBackground';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register, loginWithToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error) {
      toast.error(`SSO Error: ${error}`);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token) {
      const handleSSO = async () => {
        try {
          setIsLoading(true);
          const user = await loginWithToken(token);
          toast.success('SSO Login successful!');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (user?.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (user?.role === 'student') {
            navigate('/student/dashboard');
          } else {
            navigate('/dashboard');
          }
        } catch (err: unknown) {
          const apiErr = err as { message?: string };
          toast.error(apiErr?.message || 'SSO Login failed.');
        } finally {
          setIsLoading(false);
        }
      };
      handleSSO();
    }
  }, [loginWithToken, navigate]);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '',
    confirmPassword: '',
    role: 'student' as 'student' | 'admin',
    department: '',
    cgpa: '',
    semester: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(loginData.email, loginData.password);
      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      toast.success('Login successful!');
      
      // Redirect based on user role
      if (user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user?.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password match
    if (signupData.password !== signupData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    // Validate student-specific fields
    if (signupData.role === 'student') {
      if (!signupData.cgpa || !signupData.semester) {
        toast.error('CGPA and Semester are required for students');
        return;
      }
      const cgpa = parseFloat(signupData.cgpa);
      const semester = parseInt(signupData.semester);
      if (cgpa < 0 || cgpa > 10) {
        toast.error('CGPA must be between 0 and 10');
        return;
      }
      if (semester < 1 || semester > 8) {
        toast.error('Semester must be between 1 and 8');
        return;
      }
    }
    
    setIsLoading(true);
    
    try {
      // Build payload based on schema
      const payload: RegisterRequest = {
        full_name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
        department: signupData.department || undefined,
      };

      // Add student-specific fields only for students
      if (signupData.role === 'student') {
        payload.cgpa = parseFloat(signupData.cgpa);
        payload.semester = parseInt(signupData.semester);
      }
      // For admin, don't include cgpa and semester at all
      
      await register(payload);
      toast.success('Account created successfully! Please login with your credentials.');
      
      // Show success message and switch to login tab
      setSignupSuccess(true);
      
      // Auto-switch to login tab after 2 seconds
      setTimeout(() => {
        setSignupSuccess(false);
        setActiveTab('login');
      }, 2000);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated 3D Background */}
<AuthBackground className="opacity-75" />
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 glow-accent">
          <motion.div 
            className="flex items-center justify-center gap-2 mb-8"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GraduationCap className="h-10 w-10 text-primary" />
            <h1 className="text-2xl font-bold">Smart Campus Hub</h1>
          </motion.div>

          <Tabs value={activeTab} onValueChange={(value: 'login' | 'signup') => setActiveTab(value)} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Signup</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="sync">
              {signupSuccess ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4 py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  </motion.div>
                  <h2 className="text-2xl font-bold">Account Created!</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your account has been created successfully.
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Switching to login page in 2 seconds...
                  </p>
                </motion.div>
              ) : (
                <>
                  <TabsContent value="login" key="login">
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="student@campus.edu"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-semibold glow-primary-hover"
                        disabled={isLoading}
                        asChild
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? 'Logging in...' : 'Login'}
                        </motion.button>
                      </Button>

                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300 dark:border-gray-700" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" asChild className="w-full">
                          <a href="http://localhost:5000/api/auth/sso/google">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                          </a>
                        </Button>
                        <Button variant="outline" asChild className="w-full">
                          <a href="http://localhost:5000/api/auth/sso/microsoft">
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 21 21">
                              <path fill="#f25022" d="M1 1h9v9H1z"/>
                              <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                              <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                              <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                            </svg>
                            Microsoft
                          </a>
                        </Button>
                      </div>
                    </motion.form>
                  </TabsContent>

                  <TabsContent value="signup" key="signup">
                    <motion.form
                      key="signup-form"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onSubmit={handleSignup}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Full Name</Label>
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="John Doe"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="student@campus.edu"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-role">I am a</Label>
                        <Select 
                          value={signupData.role} 
                          onValueChange={(value: 'student' | 'admin') => setSignupData({ ...signupData, role: value })}
                        >
                          <SelectTrigger className="focus:ring-2 focus:ring-accent glow-accent">
                            <SelectValue placeholder="Select your role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="admin">Administrator</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-department">Department</Label>
                        <Input
                          id="signup-department"
                          type="text"
                          placeholder="e.g., Computer Science"
                          value={signupData.department}
                          onChange={(e) => setSignupData({ ...signupData, department: e.target.value })}
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      {signupData.role === 'student' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="signup-cgpa">CGPA (0-10)</Label>
                            <Input
                              id="signup-cgpa"
                              type="number"
                              step="0.1"
                              min="0"
                              max="10"
                              placeholder="8.5"
                              value={signupData.cgpa}
                              onChange={(e) => setSignupData({ ...signupData, cgpa: e.target.value })}
                              required
                              className="focus:ring-2 focus:ring-accent glow-accent"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="signup-semester">Semester (1-8)</Label>
                            <Input
                              id="signup-semester"
                              type="number"
                              min="1"
                              max="8"
                              placeholder="4"
                              value={signupData.semester}
                              onChange={(e) => setSignupData({ ...signupData, semester: e.target.value })}
                              required
                              className="focus:ring-2 focus:ring-accent glow-accent"
                            />
                          </div>
                        </>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                        <Input
                          id="signup-confirm-password"
                          type="password"
                          value={signupData.confirmPassword}
                          onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                          required
                          className="focus:ring-2 focus:ring-accent glow-accent"
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-primary text-primary-foreground font-semibold glow-primary-hover"
                        disabled={isLoading}
                        asChild
                      >
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {isLoading ? 'Creating account...' : 'Create Account'}
                        </motion.button>
                      </Button>
                    </motion.form>
                  </TabsContent>
                </>
              )}
            </AnimatePresence>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
