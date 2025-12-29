import { useRef, useMemo, Suspense } from 'react'; // Added Suspense
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MotionValue } from 'framer-motion';

// --- Configuration for the Animation ---
const PARTICLE_COUNT = 450; // ---> ADJUST: Number of particles (dots) (e.g., 200, 500)
const PATH_POINTS = 18; // ---> ADJUST: Smoothness of the curves (higher = smoother but more calculation) (e.g., 64, 256)
const NUM_PATHS = 5; // ---> ADJUST: Number of distinct orbital paths (e.g., 5, 12)
const PATH_BASE_RADIUS_FACTOR = 0.19; // ---> ADJUST: Base size of orbits relative to viewport width (e.g., 0.2, 0.3)
const PATH_RANDOM_RADIUS_FACTOR = 0.11; // ---> ADJUST: Random variation in orbit size (e.g., 0.1, 0.4)
const PATH_VERTICAL_VARIATION = 2.9; // ---> ADJUST: How much paths move up/down vertically (e.g., 1, 3)
const PARTICLE_BASE_SPEED = 0.0002; // ---> ADJUST: Base speed of particles along path
const PARTICLE_RANDOM_SPEED = 0.0005; // ---> ADJUST: Random variation in particle speed
const SCROLL_SPEED_MULTIPLIER = 15; // ---> ADJUST: How much scrolling affects particle speed (e.g., 3, 7)
const ROTATION_SPEED = 0.23; // ---> ADJUST: Speed at which the whole scene rotates (e.g., 0.02, 0.1)
const PARTICLE_SIZE = 0.25; // ---> ADJUST: Size of the particle dots (e.g., 0.1, 0.2)
const PARTICLE_COLOR = "#bfea3fff"; // ---> ADJUST: Color of the particle dots (e.g., "#ffffff", "#88ddff")
const LINE_COLOR = "#6366f1"; // ---> ADJUST: Color of the faint path lines
const LINE_OPACITY = 0.0; // ---> ADJUST: Opacity of the faint path lines (0.0 to 1.0)


// --- The Main Particle System Component ---
function Particles({ scrollYProgress }: { scrollYProgress: MotionValue<number> }) {
  // Access Three.js state like viewport size
  const { viewport } = useThree();
  // Refs to hold references to Three.js objects (points for particles, group for lines)
  const pointsRef = useRef<THREE.Points>(null!); // Use null! to assert it will be non-null after mount
  const linesGroupRef = useRef<THREE.Group>(null!);

  // 1. Create the orbital paths (the faint lines)
  // useMemo ensures these complex calculations only run when viewport dimensions change
  const paths = useMemo(() => {
    console.log("Recalculating paths..."); // Debug log
    const curves = [];
    // Loop to create NUM_PATHS curves
    for (let i = 0; i < NUM_PATHS; i++) {
      const angle = (i / NUM_PATHS) * Math.PI * 2; // Distribute paths evenly around a circle
      // Calculate radius with base size + random variation, based on viewport width
      const radius = viewport.width * PATH_BASE_RADIUS_FACTOR + Math.random() * (viewport.width * PATH_RANDOM_RADIUS_FACTOR);
      const points = [];
      // Random starting vertical position for the path
      const yStart = (Math.random() - 0.5) * viewport.height;

      // Generate points along the curve
      for (let j = 0; j < PATH_POINTS; j++) {
        const t = j / (PATH_POINTS - 1); // Progress along the path (0 to 1)
        // Calculate X and Z coordinates for an elliptical orbit with some variation
        const x = Math.cos(t * Math.PI * 2 + angle) * radius * (1 + (Math.sin(t * Math.PI * 4 + angle)) * 0.1);
        // Calculate Y coordinate with vertical movement along the path
        const y = yStart + Math.sin(t * Math.PI * 2) * PATH_VERTICAL_VARIATION;
        const z = Math.sin(t * Math.PI * 2 + angle) * radius * (1 + (Math.cos(t * Math.PI * 4 + angle)) * 0.1);
        points.push(new THREE.Vector3(x, y, z));
      }
      // Create a smooth, closed curve (CatmullRomCurve3) from the generated points
      curves.push(new THREE.CatmullRomCurve3(points, true)); // true makes it a closed loop
    }
    return curves;
  }, [viewport.width, viewport.height]); // Dependencies: Recalculate if viewport changes

  // 2. Create the particle data (position, speed, assigned path)
  // useMemo ensures this runs only when the paths array changes
  const particleData = useMemo(() => {
    console.log("Recalculating particle data..."); // Debug log
    const data = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const path = paths[i % NUM_PATHS]; // Assign a path to the particle (cycles through paths)
      data.push({
        path, // The curve object the particle will follow
        progress: Math.random(), // Random starting position on the path (0 to 1)
        // Random speed, with random direction (positive or negative)
        speed: (Math.random() * PARTICLE_RANDOM_SPEED + PARTICLE_BASE_SPEED) * (Math.random() > 0.5 ? 1 : -1),
      });
    }
    return data;
  }, [paths]); // Dependency: Recalculate if paths change

  // 3. Set the initial positions buffer for the particles geometry
  // useMemo ensures this runs only when particleData changes
  const initialPositions = useMemo(() => {
    console.log("Calculating initial positions..."); // Debug log
    // Create a Float32Array to hold x, y, z for each particle
    const buffer = new Float32Array(PARTICLE_COUNT * 3);
    particleData.forEach((p, i) => {
      // Get the 3D point on the assigned path at the random starting progress
      const pos = p.path.getPointAt(p.progress);
      // Set the x, y, z coordinates in the buffer
      buffer[i * 3] = pos.x;
      buffer[i * 3 + 1] = pos.y;
      buffer[i * 3 + 2] = pos.z;
    });
    return buffer;
  }, [particleData]); // Dependency: Recalculate if particleData changes

  // 4. The Animation Loop (runs every frame)
  useFrame((_state, delta) => {
    // Ensure the refs are populated before proceeding
    if (!pointsRef.current || !linesGroupRef.current) return;

    // Get direct access to the position attribute of the particles' geometry
    const positionAttribute = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    // Get the current scroll progress value from the Framer Motion value
    const scroll = scrollYProgress.get();

    // Update each particle's position
    particleData.forEach((p, i) => {
      // Update the progress along the path based on speed, delta time, and scroll effect
      // Modulo 1 keeps progress between 0 and 1 (looping)
      p.progress = (p.progress + p.speed * delta * 60 * (1 + scroll * SCROLL_SPEED_MULTIPLIER)) % 1; // delta * 60 approximates speed per second
      // Handle negative progress from moving backwards
      if (p.progress < 0) p.progress += 1;

      // Calculate the new 3D position on the path based on the updated progress
      const newPos = p.path.getPointAt(p.progress);
      // Update the x, y, z values in the geometry's position buffer attribute
      positionAttribute.setXYZ(i, newPos.x, newPos.y, newPos.z);
    });

    // Tell Three.js that the position attribute has changed and needs to be re-rendered
    positionAttribute.needsUpdate = true;

    // Rotate the entire scene (both particles and lines) slowly for a dynamic feel
    const rotationAmount = delta * ROTATION_SPEED;
    if (pointsRef.current) {
      pointsRef.current.rotation.y += rotationAmount;
    }
    if (linesGroupRef.current) {
      linesGroupRef.current.rotation.y += rotationAmount;
    }
  });

  // --- Render JSX for the Three.js objects ---
  return (
    <>
      {/* Group to hold and rotate all the path lines together */}
      <group ref={linesGroupRef}>
        {/* Map through the calculated paths and render each as a line */}
        {paths.map((curve, index) => (
          // The <line> component takes a geometry defining the line's points
          <line key={index} geometry={new THREE.BufferGeometry().setFromPoints(curve.getPoints(PATH_POINTS))}>
            {/* Material defines the appearance (color, opacity) */}
            <lineBasicMaterial color={LINE_COLOR} transparent opacity={LINE_OPACITY} />
          </line>
        ))}
      </group>

      {/* The <points> object represents all particles */}
      <points ref={pointsRef}>
        {/* BufferGeometry holds the vertex data (positions, colors, etc.) */}
        <bufferGeometry>
          {/* Define the position attribute using the initialPositions buffer */}
          {/* 'attach="attributes-position"' links it to the shader's position input */}
          <bufferAttribute
             attach="attributes-position" // Connects to the shader's 'position' attribute
             count={PARTICLE_COUNT} // Number of vertices
             array={initialPositions} // The Float32Array containing vertex data
             itemSize={3} // Number of values per vertex (x, y, z)
          />
        </bufferGeometry>
        {/* PointsMaterial defines how the individual points look */}
        <pointsMaterial
          color={PARTICLE_COLOR} // Color of the dots
          size={PARTICLE_SIZE} // Base size of the dots
          transparent // Allow transparency
          blending={THREE.AdditiveBlending} // ---> EXPERIMENT: Makes overlapping points brighter (can be NormalBlending)
          depthWrite={false} // ---> PERFORMANCE: Improves rendering performance for transparent objects
          sizeAttenuation // Makes points smaller further away (perspective effect)
        />
      </points>
    </>
  );
}

// --- Main Export Component: Sets up the R3F Canvas ---
export default function AnimatedBackground({
  className = '',
  scrollYProgress, // Accept scroll progress as a prop
}: {
  className?: string;
  scrollYProgress: MotionValue<number>; // Type for Framer Motion value
}) {
  return (
    // Fixed div to contain the canvas, positioned behind other content (-z-10)
    <div className={`fixed inset-0 -z-10 ${className}`}>
      {/* Canvas is the root R3F component where the 3D scene lives */}
      <Canvas
        dpr={[1, 1.5]} // ---> PERFORMANCE: Device Pixel Ratio (lower max value like 1.5 improves performance on high-res screens)
        camera={{ position: [0, 0, 15], fov: 75 }} // ---> ADJUST: Camera position (z=15 units away) and field of view
        style={{ background: 'transparent' }} // Make canvas background transparent
      >
        {/* Basic ambient light to illuminate the scene evenly */}
        <ambientLight intensity={0.8} /> {/* ---> ADJUST: Brightness of ambient light (0.0 to 1.0+) */}
        {/* Suspense is needed for components that might load asynchronously (though not strictly required here) */}
        <Suspense fallback={null}>
            {/* Render the Particles component, passing the scroll progress */}
            <Particles scrollYProgress={scrollYProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}