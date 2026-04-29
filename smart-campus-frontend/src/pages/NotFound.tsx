import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion"; 
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { MagneticButton } from "@/components/ui/magnetic-button";
import NotFoundBackground from "@/components/animations/NotFoundBackground";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const handleBack = () => {
   if (location.key !== "default") {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };
 
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "404 - Page Not Found"; 
    headingRef.current?.focus();
    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col overflow-hidden">
      <Navbar />
      <NotFoundBackground />

      <main role="main" aria-label="Page not found" tabIndex={-1} className="relative z-10 flex-grow flex items-center justify-center px-6 pt-20 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full max-w-lg">
          <div className="space-y-4 mb-12">
            <h1 ref={headingRef} tabIndex={-1} aria-live="polite" className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight text-foreground outline-none">
              Nothing Here!
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-medium text-muted-foreground/80 leading-relaxed">
              The resource you are looking for is not available at the moment. Hop in later!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <MagneticButton variant="outline" onClick={handleBack} aria-label="Go back to previous page" className="w-full sm:w-auto">
              <ArrowLeft className="mr-1 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-2" /> Go Back
            </MagneticButton>
            <MagneticButton onClick={() => navigate('/')} aria-label="Go to Home page" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" /> Go Home
            </MagneticButton>
            <MagneticButton variant="outline" onClick={() => navigate('/student/dashboard')} aria-label="Go to dashboard" className="w-full sm:w-auto">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
            </MagneticButton>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default NotFound;
