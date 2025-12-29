import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Props for TiltCard
 * - children: content inside the tilting card
 * - className: pass Tailwind or other classes to size/position the card
 * - maxTilt: maximum rotation in degrees on each axis (default 10)
 *
 * You can change `maxTilt` at usage time, e.g. <TiltCard maxTilt={18}> to make it more dramatic.
 */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}

/**
 * TiltCard
 * A simple mouse-driven 3D tilt wrapper using Framer Motion.
 *
 * Notes for customization (high level):
 * - maxTilt controls the maximum degrees of rotation on X/Y.
 * - The mapping from pointer position -> normalized [-0.5,0.5] determines the sensitivity.
 * - Springs control the "snappiness" and bounciness (stiffness/damping).
 * - You can add perspective on the parent container (via CSS) to change depth perception.
 * - For mobile/touch: consider adding touch event handlers or disabling tilt for small screens.
 */
export default function TiltCard({ children, className = '', maxTilt = 10 }: TiltCardProps) {
  // Reference to the wrapper element so we can calculate size/position
  const ref = useRef<HTMLDivElement>(null);

  // Motion values store the raw pointer position in normalized form (-0.5 .. 0.5)
  // We map horizontal pointer -> x and vertical pointer -> y
  // These are intentionally small ranges and then transformed below to degrees
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Transform the normalized motion values into rotation degrees.
  // useTransform maps the input domain [-0.5, 0.5] to the output range [maxTilt, -maxTilt]
  // (note the vertical axis is inverted so moving down rotates the card forward).
  // If you want the card to be less/ more reactive, change the input range or the mapping.
  const rotateXRaw = useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateYRaw = useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Wrap the transformed values in springs for smooth motion.
  // stiffness: higher = quicker/snappier. damping: higher = less oscillation.
  // Tweak these two numbers to change feel. Examples:
  // - More floaty: lower stiffness (e.g. 120) and lower damping (e.g. 14)
  // - Snappier: higher stiffness (e.g. 600) and higher damping (e.g. 40)
  const rotateX = useSpring(rotateXRaw, { stiffness: 620, damping: 30 });
  const rotateY = useSpring(rotateYRaw, { stiffness: 120, damping: 30 });

  /**
   * Pointer move handler
   * - Computes pointer position relative to the element's bounding rect
   * - Normalizes to [-0.5, 0.5] where 0 is center
   * - Sets the motion values which drive the transforms
   *
   * Customization tips:
   * - To make tilt less sensitive, divide xPct/yPct by a constant (e.g. xPct * 0.7)
   * - To change the "dead zone" around center, you can clamp values to a smaller range
   * - For touch support, add onTouchMove with similar logic (use touches[0].clientX etc.)
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return; // safety

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = event.clientX - rect.left; // x relative to element
    const mouseY = event.clientY - rect.top; // y relative to element

    // Normalize to 0..1 then center to -0.5..0.5
    const xPct = mouseX / width - 0.05;
    const yPct = mouseY / height - 0.005;

    // Set motion values. If you want lower sensitivity, multiply these by a factor < 1.
    x.set(xPct);
    y.set(yPct);
  };

  /**
   * Reset on mouse leave: animate back to center (0,0)
   * If you'd prefer an instant snap, replace x.set(0) with x.set(0, { immediate: true })
   */
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Render: motion.div accepts the rotateX/rotateY motion values directly via style
  // Important CSS tips for best visual results (set these on the parent or via className):
  // - perspective: e.g. `perspective: 1000px` on the parent to create depth
  // - transform-style: 'preserve-3d' (keeps child transforms in 3D space)
  // - backface-visibility: 'hidden' on 3D children if you have visible backs
  // Example `className` you can pass: "relative w-80 h-48 perspective-1000"
  // (Tailwind doesn't include perspective by default; you can add it via custom utilities or inline style)
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
