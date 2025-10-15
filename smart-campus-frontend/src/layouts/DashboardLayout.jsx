import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';
import { fadeIn } from '../lib/animations';

/**
 * DashboardLayout Component
 * 
 * Main layout for authenticated pages with:
 * - Fixed navbar at top
 * - Collapsible sidebar on left
 * - Main content area
 * - Footer at bottom
 * - Responsive padding and spacing
 */

export const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Navbar - Fixed at top */}
      <Navbar />

      <div className="flex flex-1 pt-16">
        {/* Sidebar - Fixed on left (hidden on mobile) */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        {/* Main Content Area */}
        <motion.main
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="flex-1 lg:ml-64 transition-all duration-300"
        >
          <div className="min-h-[calc(100vh-4rem)] p-6">
            <Outlet />
          </div>
          
          {/* Footer */}
          <Footer />
        </motion.main>
      </div>
    </div>
  );
};
