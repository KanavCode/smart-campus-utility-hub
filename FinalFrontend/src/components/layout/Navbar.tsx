import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export const Navbar = () => {
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <motion.div 
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.02 }}
          onClick={() => navigate('/')}
        >
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">Smart Campus Hub</span>
        </motion.div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button
            onClick={() => navigate('/auth')}
            className="bg-primary text-primary-foreground font-medium glow-primary-hover"
            asChild
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Login / Signup
            </motion.button>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};
