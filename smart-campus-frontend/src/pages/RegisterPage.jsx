import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import {
  pageTransition,
  fadeInLeft,
  fadeInRight,
  fadeInUp,
} from "../utils/animations";
import { authService } from "../lib/api";
import useAuthStore from "../hooks/useAuthStore";

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: "", color: "" };

  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z\d]/.test(password)) strength++;

  const levels = [
    { strength: 0, label: "Very Weak", color: "bg-red-500" },
    { strength: 1, label: "Weak", color: "bg-orange-500" },
    { strength: 2, label: "Fair", color: "bg-yellow-500" },
    { strength: 3, label: "Good", color: "bg-blue-500" },
    { strength: 4, label: "Strong", color: "bg-green-500" },
    { strength: 5, label: "Very Strong", color: "bg-green-600" },
  ];

  return levels[strength];
};

// Validation schema
const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name is too long"),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    role: z.string().default("student"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

/**
 * RegisterPage Component - Phase 2
 * Split-screen premium registration with animations, validation, and password strength
 * Features: React Hook Form, Zod validation, password strength indicator, real-time validation
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    strength: 0,
    label: "",
    color: "",
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  });

  const password = watch("password");

  // Update password strength on password change
  useState(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password") {
        setPasswordStrength(getPasswordStrength(value.password));
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      toast.success(
        `Welcome to Smart Campus, ${data.user.full_name || data.user.name}!`
      );
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    },
  });

  const onSubmit = (data) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  // Password requirements checker
  const passwordRequirements = [
    { label: "At least 6 characters", met: password?.length >= 6 },
    {
      label: "Contains uppercase & lowercase",
      met: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    { label: "Contains a number", met: /\d/.test(password) },
    { label: "Contains special character", met: /[^a-zA-Z\d]/.test(password) },
  ];

  return (
    <motion.div
      className="min-h-screen grid lg:grid-cols-2"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Left Side - Visual Content */}
      <motion.div
        className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-br from-accent/20 via-primary/10 to-accent/20 dark:from-accent/30 dark:via-primary/20 dark:to-accent/30 relative overflow-hidden"
        variants={fadeInLeft}
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
          className="absolute top-20 left-20 w-32 h-32 rounded-full bg-accent/20 blur-3xl"
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
          className="absolute bottom-20 right-20 w-40 h-40 rounded-full bg-primary/20 blur-3xl"
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
              Begin Your
              <br />
              <span className="gradient-text">Smart Campus</span>
              <br />
              Journey
            </h2>
            <p className="text-xl text-text-secondary dark:text-text-secondary-dark mb-8">
              Join thousands of students who are already transforming their
              campus experience with our all-in-one platform.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-3 gap-4"
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
              { value: "5,000+", label: "Students" },
              { value: "200+", label: "Events" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="p-4 rounded-lg glass backdrop-blur-sm text-center"
                variants={fadeInUp}
              >
                <div className="text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary dark:text-text-secondary-dark">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side - Registration Form */}
      <motion.div
        className="flex items-center justify-center p-6 md:p-12"
        variants={fadeInRight}
      >
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-primary mb-6"
              whileHover={{ scale: 1.05, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>

            <h1 className="text-4xl font-bold mb-2">
              Create <span className="gradient-text">Account</span>
            </h1>
            <p className="text-text-secondary dark:text-text-secondary-dark">
              Get started with your Smart Campus account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name Field */}
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium mb-2"
              >
                Full Name
              </label>
              <Input
                id="full_name"
                type="text"
                placeholder="John Doe"
                leftIcon={<User size={18} />}
                error={errors.full_name?.message}
                {...register("full_name")}
              />
            </div>

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
                placeholder="Create a strong password"
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
                onChange={(e) => {
                  register("password").onChange(e);
                  setPasswordStrength(getPasswordStrength(e.target.value));
                }}
              />

              {/* Password Strength Indicator */}
              {password && (
                <motion.div
                  className="mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.strength / 5) * 100}%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <span className="text-xs font-medium">
                      {passwordStrength.label}
                    </span>
                  </div>

                  {/* Password Requirements */}
                  <div className="space-y-1">
                    {passwordRequirements.map((req, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-xs"
                      >
                        {req.met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-gray-400" />
                        )}
                        <span
                          className={
                            req.met
                              ? "text-green-600 dark:text-green-400"
                              : "text-text-secondary dark:text-text-secondary-dark"
                          }
                        >
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
              >
                Confirm Password
              </label>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter your password"
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-text-secondary dark:text-text-secondary-dark hover:text-primary transition-colors"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register("confirmPassword")}
              />
            </div>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 rounded border-border dark:border-border-dark text-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </span>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={registerMutation.isPending}
              leftIcon={<UserPlus size={20} />}
            >
              {registerMutation.isPending
                ? "Creating Account..."
                : "Create Account"}
            </Button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border dark:border-border-dark" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-background dark:bg-background-dark text-text-secondary dark:text-text-secondary-dark">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Login Link */}
            <Link to="/login">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full"
              >
                Sign In Instead
              </Button>
            </Link>
          </form>

          {/* Info Box */}
          <motion.div
            className="p-4 rounded-lg bg-primary/10 dark:bg-primary/20 border border-primary/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">Free Forever</p>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  No credit card required. Start managing your campus life
                  today!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
