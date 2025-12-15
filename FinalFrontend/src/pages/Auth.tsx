import { useState } from 'react';
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
import AuthBackground from '@/components/animations/AuthBackground';

export default function Auth() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

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
    } catch (error: any) {
      toast.error(error?.message || 'Login failed. Please try again.');
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
      const payload: any = {
        full_name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        role: signupData.role,
        department: signupData.department || null
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
    } catch (error: any) {
      toast.error(error?.message || 'Signup failed. Please try again.');
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

          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
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
