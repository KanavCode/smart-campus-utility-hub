import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { fadeIn } from '../lib/animations';

/**
 * AuthLayout Component
 * 
 * Clean layout for authentication pages (login, register)
 * - No navbar/sidebar
 * - Full-screen content
 * - Simple and focused
 */

export const AuthLayout = () => {
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-bg-primary"
    >
      <Outlet />
    </motion.div>
  );
};
