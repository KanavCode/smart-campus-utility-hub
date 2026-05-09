import { useRef, useMemo, Suspense, useEffect, useState, memo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const useTheme = (variableName: string, mounted: boolean) => {
  const [theme, setTheme] = useState({
    color: new THREE.Color(),
    isDark: true,
  });

  const updateTheme = useCallback(() => {
    if (typeof window === 'undefined' || !mounted) return;
    const styles = getComputedStyle(document.documentElement);
    let rawColor = styles.getPropertyValue(variableName).trim();
    if (!rawColor) {
      rawColor = styles.getPropertyValue('--foreground')?.trim() || styles.getPropertyValue('--background')?.trim();
    }
    const isDarkMode = document.documentElement.classList.contains('dark');
    try {
      const newColor = new THREE.Color(
        rawColor.startsWith('hsl') || rawColor.startsWith('rgb') || rawColor.startsWith('#')
          ? rawColor
          : `hsl(${rawColor.replace(/ /g, ',')})`
      );
      setTheme({ color: newColor, isDark: isDarkMode });
    } catch {
      setTheme({ color: new THREE.Color(), isDark: isDarkMode });
    }
  }, [variableName, mounted]);

  useEffect(() => {
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [updateTheme]);

  return theme;
};

interface Particle { radius: number; z: number; baseAngle: number; speed: number; size: number; }

function PixelVortex() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { viewport } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (meshRef.current) {
        meshRef.current.geometry.dispose();
        if (Array.isArray(meshRef.current.material)) {
          meshRef.current.material.forEach(m => m.dispose());
        } else {
          meshRef.current.material.dispose();
        }
      }
    };
  }, []);

  const themeData = useTheme('--primary', mounted);
  const { color, isDark } = themeData;
  
  const MAX_COUNT = 850;
  const [activeCount, setActiveCount] = useState(MAX_COUNT);

  useEffect(() => {
    if (!mounted) return;
    const handleResize = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const width = window.innerWidth;
        const newCount = width < 480 ? 200 : width < 768 ? 400 : MAX_COUNT;
        setActiveCount((prev) => (prev !== newCount ? newCount : prev));
      }, 100);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [mounted]);

  const aspectScale = useMemo(() => 
    Math.max(viewport.width, viewport.height) / 22, 
    [viewport.width, viewport.height]
  );

  const particlesData = useMemo(() => {
    const temp: Particle[] = [];
    for (let i = 0; i < MAX_COUNT; i++) {
      const t = i / MAX_COUNT;
      temp.push({
        radius: (4 + Math.sqrt(t) * 18) + (Math.random() - 0.5) * 4,
        z: (Math.random() - 0.5) * 2,
        baseAngle: Math.random() * Math.PI * 2,
        speed: 0.03 + Math.random() * 0.05,
        size: 0.15 + Math.random() * 0.2,
      });
    }
    return temp;
  }, [MAX_COUNT]);

  useFrame((state) => {
    if (!mounted || !meshRef.current) return;
    const t = state.clock.getElapsedTime();

    for (let i = 0; i < activeCount; i++) {
      const p = particlesData[i];
      const currentAngle = p.baseAngle + (t * p.speed);
      const r = p.radius * aspectScale;
      dummy.position.set(Math.cos(currentAngle) * r, Math.sin(currentAngle) * r, p.z);
      dummy.scale.setScalar(p.size * aspectScale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.count = activeCount;
  });

  if (!mounted) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MAX_COUNT]} frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial 
        transparent 
        color={color}
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
        opacity={isDark ? 0.4 : 0.7}
        depthWrite={false}
      />
    </instancedMesh>
  );
}

const NotFoundBackground = memo(({ className = '' }: { className?: string }) => {
  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`} style={{ zIndex: -1 }}>
      <Canvas 
        camera={{ position: [0, 0, 25], fov: 60 }}
        gl={{ alpha: true, antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <PixelVortex />
        </Suspense>
      </Canvas>
    </div>
  );
});

export default NotFoundBackground;