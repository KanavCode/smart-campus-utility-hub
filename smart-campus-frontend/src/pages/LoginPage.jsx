import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  pageTransition,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
} from "../utils/animations";
import { authService } from "../lib/api";
import useAuthStore from "../hooks/useAuthStore";

// Validation schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/**
 * LoginPage Component - Phase 2
 * Split-screen premium login with animations, validation, and API integration
 * Features: React Hook Form, Zod validation, password toggle, error handling
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(`Welcome back, ${data.user.full_name || data.user.name}!`);
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    },
  });

  const onSubmit = (data) => {
    loginMutation.mutate(data);
  };

  return (
    <motion.div
      className="min-h-screen grid lg:grid-cols-2"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Left Side - Login Form */}
      <motion.div
        className="flex items-center justify-center p-6 md:p-12"
        variants={fadeInLeft}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-6"
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-2">
              Welcome <span className="gradient-text">Back</span>
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              Sign in to continue to your dashboard
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="student@campus.edu"
                leftIcon={<Mail size={18} />}
                error={errors.email?.message}
                {...register("email")}
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-text-secondary dark:text-text-secondary-dark hover:text-primary transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border dark:border-border-dark text-primary focus:ring-2 focus:ring-primary/20"
                />
                <span className="text-sm">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary hover:text-primary-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loginMutation.isPending}
              leftIcon={<LogIn size={20} />}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign In"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border dark:border-border-dark" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background dark:bg-background-dark text-text-secondary dark:text-text-secondary-dark">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Register Link */}
            <Link to="/register">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
                rightIcon={<ArrowRight size={20} />}
              >
                Create Account
              </Button>
            </Link>
          </form>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 p-4 rounded-lg bg-accent/10 dark:bg-accent/20 border border-accent/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Demo Credentials</p>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  Email:{" "}
                  <code className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded">
                    demo@campus.edu
                  </code>
                  <br />
                  Password:{" "}
                  <code className="px-1.5 py-0.5 bg-black/10 dark:bg-white/10 rounded">
                    password123
                  </code>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Visual Content */}
      <motion.div
        className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-primary/20 via-accent/10 to-primary/20 dark:from-primary/30 dark:via-accent/20 dark:to-primary/30 relative overflow-hidden"
        variants={fadeInRight}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, currentColor 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Shapes */}
        <motion.div
          className="absolute top-20 right-20 w-32 h-32 rounded-full bg-primary/20 blur-3xl"
          animate={{
            y: [0, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-40 h-40 rounded-full bg-accent/20 blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="text-5xl font-bold mb-6 leading-tight">
              Your Campus Journey
              <br />
              <span className="gradient-text">Continues Here</span>
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Access your personalized dashboard with all your campus
              activities, events, and academic tools in one place.
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div
            className="space-y-4 text-left"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="initial"
            animate="animate"
          >
            {[
              "📅 Smart Timetable Management",
              "🎉 Discover Campus Events",
              "📚 Easy Elective Selection",
              "🔔 Real-time Notifications",
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg glass backdrop-blur-sm"
                variants={fadeInUp}
              >
                <div className="w-2 h-2 rounded-full bg-accent" />
                <span className="text-lg font-medium">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
