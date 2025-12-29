import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { RefObject } from 'react';

interface ScrollAnimationOptions {
  target?: RefObject<HTMLElement>;
  offset?: ["start end", "end start"] | ["start start", "end end"];
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
  const { scrollYProgress } = useScroll({
    target: options.target,
    offset: (options.offset || ['start end', 'end start']) as any,
  });

  return scrollYProgress;
}

export function useParallax(scrollYProgress: MotionValue<number>, distance: number = 50) {
  return useTransform(scrollYProgress, [0, 1], [-distance, distance]);
}

export function useScrollOpacity(scrollYProgress: MotionValue<number>) {
  return useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
}

export function useScrollScale(scrollYProgress: MotionValue<number>) {
  return useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);
}
