import * as React from "react";
import { useRef, useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends ButtonProps {
  glowColor?: string;
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ children, className, variant = "default", size = "lg", glowColor, ...props }, ref) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const localRef = useRef<HTMLButtonElement>(null);
    
    const combinedRef = (ref as React.MutableRefObject<HTMLButtonElement>) || localRef;

    const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
      if (!combinedRef.current) return;
      const rect = combinedRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const isDefault = variant === "default";

    return (
        <motion.div className="inline-block" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
            <Button ref={combinedRef} variant={variant} size={size} onMouseMove={handleMouseMove}
                className={cn(
                "relative overflow-hidden transition-all duration-300 group rounded-xl",
                isDefault && "glow-primary glow-primary-hover hover:scale-[1.02] active:scale-[0.98]",
                className)}
                {...props}
            >
            <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{
              background: `radial-gradient(circle 120px at ${mousePosition.x}px ${mousePosition.y}px, ${
                glowColor || (isDefault ? 'rgba(255, 255, 255, 0.35)' : 'hsla(var(--primary) / 0.15)')
              }, transparent)`,
            }}/>
        
            <span className="relative z-10 flex items-center justify-center gap-2">
            {children}
            </span>
        </Button>
      </motion.div>
    );
  }
);

MagneticButton.displayName = "MagneticButton";

export { MagneticButton };