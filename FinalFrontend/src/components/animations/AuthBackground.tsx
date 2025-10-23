import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MathUtils } from 'three';

// --- Configuration ---
const PARTICLE_COUNT = 590; // ---> ADJUST: Number of dots (e.g., 100, 200)
const MAX_LIFESPAN = 15.0; // ---> ADJUST: How long particles live in seconds (e.g., 2.0, 4.0)
const INITIAL_SPEED_MIN = 4.9; // ---> ADJUST: Minimum initial outward speed
const INITIAL_SPEED_MAX = 0.01; // ---> ADJUST: Maximum initial outward speed
const GRAVITY = -0.03; // ---> ADJUST: Downward pull (e.g., -0.1 for less, -0.5 for more)
const BASE_DOT_SIZE = 0.2; // ---> ADJUST: Base size of the dots (e.g., 1.0, 2.0)
const PERSPECTIVE_SCALING = 250.0; // ---> ADJUST: How much dots shrink with distance (e.g., 100.0, 250.0)

// --- Particle System Component ---
function Particles() {
  const pointsRef = useRef<THREE.Points>(null!);
  const [particleData, setParticleData] = useState<any[]>([]);
  const [attributesNeedUpdate, setAttributesNeedUpdate] = useState(false);

  // Buffer attributes stored in refs
  const positionAttribRef = useRef<THREE.Float32BufferAttribute>();
  const colorAttribRef = useRef<THREE.Float32BufferAttribute>();
  const opacityAttribRef = useRef<THREE.Float32BufferAttribute>();
  const sizeAttribRef = useRef<THREE.Float32BufferAttribute>(); // For size variation/fade

  // Initialize particles only once
  useMemo(() => {
    const data = [];
    // Initialize all attributes, even if starting at 0,0,0
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const opacities = new Float32Array(PARTICLE_COUNT);
    const sizes = new Float32Array(PARTICLE_COUNT);

    // Particle color palette: two existing + two new colors
    const colorPalette = [
      new THREE.Color('#B5FF00'), // Lime/green
      new THREE.Color('#0c1f63ff'), // Indigo/blue (original)
      new THREE.Color('#d046dcff'), // Soft red/pink (new)
      new THREE.Color('#fbfefeff'), // Cyan/teal (new)
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      // Initialize position at center
      positions[i3] = 0;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = -2; // Start slightly behind center

      // Store initial animation state
      data.push({
        id: i,
        velocity: new THREE.Vector3(), // Will be set on reset
        lifespan: 0, // Will be set on reset
        maxLife: MathUtils.randFloat(MAX_LIFESPAN * 0.7, MAX_LIFESPAN * 1.3), // Vary lifespan
        // Pick a random color from the palette
        baseColor: colorPalette[Math.floor(Math.random() * colorPalette.length)],
        baseSize: MathUtils.randFloat(0.8, 1.2), // Slight random base size variation
      });

      // Initialize other attributes (will be updated in resetParticle)
      colors[i3] = data[i].baseColor.r;
      colors[i3 + 1] = data[i].baseColor.g;
      colors[i3 + 2] = data[i].baseColor.b;
      opacities[i] = 0;
      sizes[i] = 0;
    }

    setParticleData(data); // Store animation data

    // Create BufferAttributes (only once)
    positionAttribRef.current = new THREE.Float32BufferAttribute(positions, 3);
    colorAttribRef.current = new THREE.Float32BufferAttribute(colors, 3);
    opacityAttribRef.current = new THREE.Float32BufferAttribute(opacities, 1);
    sizeAttribRef.current = new THREE.Float32BufferAttribute(sizes, 1);

    setAttributesNeedUpdate(true); // Signal initial update needed

  }, []); // Empty dependency array ensures this runs only once on mount

  // Function to reset a particle's state
  const resetParticle = (p: any, i: number) => {
    p.lifespan = p.maxLife; // Reset lifespan

    // Set initial position (slightly offset from exact center for variety)
    const x = MathUtils.randFloatSpread(0.1);
    const y = MathUtils.randFloatSpread(0.1);
    const z = -2 + MathUtils.randFloatSpread(0.1);
    positionAttribRef.current?.setXYZ(i, x, y, z);

    // Set random outward velocity
    const speed = MathUtils.randFloat(INITIAL_SPEED_MIN, INITIAL_SPEED_MAX);
    // Create a random direction vector (spherical)
    const theta = Math.random() * Math.PI * 2; // Angle around Z
    const phi = Math.acos(Math.random() * 2 - 1); // Angle from Z axis (corrected distribution)
    p.velocity.set(
      Math.sin(phi) * Math.cos(theta) * speed,
      Math.sin(phi) * Math.sin(theta) * speed,
      Math.cos(phi) * speed * 0.5 // Reduce Z speed slightly if desired
    );

     // Reset color (in case you want it to change on reset)
     // const i3 = i * 3;
     // colorAttribRef.current?.setXYZ(i3, p.baseColor.r, p.baseColor.g, p.baseColor.b);

    // Reset size and opacity (handled in useFrame fade)
     opacityAttribRef.current?.setX(i, 1.0); // Start fully opaque
     sizeAttribRef.current?.setX(i, p.baseSize); // Start at base size
  };

  // Initialize all particles on first frame after attributes are ready
  useEffect(() => {
    if(particleData.length > 0 && positionAttribRef.current) {
        particleData.forEach((p, i) => resetParticle(p, i));
        setAttributesNeedUpdate(true);
    }
  }, [particleData]); // Run when particleData is initialized

  useFrame((_state, delta) => {
    if (!pointsRef.current || particleData.length === 0 || !positionAttribRef.current || !opacityAttribRef.current || !sizeAttribRef.current) return;

    // Clamp delta to prevent large jumps if frame rate drops
    const dt = Math.min(delta, 0.1);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = particleData[i];

      // Decrease lifespan
      p.lifespan -= dt;

      // --- Reset if lifespan ended ---
      if (p.lifespan <= 0) {
        resetParticle(p, i);
      }

      // --- Update Velocity (Apply Gravity) ---
      p.velocity.y += GRAVITY * dt;

      // --- Update Position ---
      const currentPos = positionAttribRef.current;
      currentPos.setXYZ(
        i,
        currentPos.getX(i) + p.velocity.x * dt,
        currentPos.getY(i) + p.velocity.y * dt,
        currentPos.getZ(i) + p.velocity.z * dt
      );

      // --- Update Opacity & Size based on lifespan ---
      // Fade out smoothly in the last third of life
      const lifeRatio = Math.max(0, p.lifespan / p.maxLife); // 1 (new) -> 0 (dead)
      const fadeThreshold = 0.3; // ---> ADJUST: Start fade out when lifeRatio < this (e.g., 0.5)
      let currentOpacity = 1.0;
      let currentSize = p.baseSize;

      if (lifeRatio < fadeThreshold) {
          const fadeRatio = lifeRatio / fadeThreshold; // 1 -> 0 during fade phase
          currentOpacity = fadeRatio;
          currentSize = p.baseSize * fadeRatio; // Shrink as it fades
      }

      opacityAttribRef.current.setX(i, currentOpacity);
      sizeAttribRef.current.setX(i, currentSize);
    }
    setAttributesNeedUpdate(true); // Signal update needed
  });

   // Apply attribute updates
   useFrame(() => {
        if (attributesNeedUpdate && pointsRef.current?.geometry) {
             if (positionAttribRef.current) pointsRef.current.geometry.attributes.position.needsUpdate = true;
             if (colorAttribRef.current) pointsRef.current.geometry.attributes.color.needsUpdate = true;
             if (opacityAttribRef.current) pointsRef.current.geometry.attributes.opacity.needsUpdate = true;
             if (sizeAttribRef.current) pointsRef.current.geometry.attributes.size.needsUpdate = true; // Use 'size' attribute now
             setAttributesNeedUpdate(false);
        }
   });

  // Only render points if attributes are ready
  if (!positionAttribRef.current || !colorAttribRef.current || !opacityAttribRef.current || !sizeAttribRef.current) {
        return null;
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* Attach initial attribute refs */}
        <primitive attach="attributes-position" object={positionAttribRef.current} />
        <primitive attach="attributes-color" object={colorAttribRef.current} />
        <primitive attach="attributes-opacity" object={opacityAttribRef.current} />
        <primitive attach="attributes-size" object={sizeAttribRef.current} /> {/* Use 'size' not 'scale' */}
      </bufferGeometry>
      {/* Custom ShaderMaterial */}
       <shaderMaterial
          depthWrite={false}
          transparent
          vertexShader={`
            attribute float size; // Use 'size' attribute
            attribute vec3 color;
            attribute float opacity;

            varying vec3 vColor;
            varying float vOpacity;

            void main() {
              vColor = color;
              vOpacity = opacity;
              vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
              gl_Position = projectionMatrix * mvPosition;
              // Use size attribute, BASE_DOT_SIZE, and perspective scaling
              gl_PointSize = size * ${BASE_DOT_SIZE.toFixed(1)} * (${PERSPECTIVE_SCALING.toFixed(1)} / -mvPosition.z);
            }
          `}
          fragmentShader={`
            varying vec3 vColor;
            varying float vOpacity;

            void main() {
              float distanceToCenter = length(gl_PointCoord - vec2(0.5));
              // Soft circle edge
              float strength = smoothstep(0.5, 0.45, distanceToCenter); // Slightly softer edge

              if (strength < 0.01) discard; // Discard fully transparent pixels

              gl_FragColor = vec4(vColor, vOpacity * strength);
            }
          `}
        />
    </points>
  );
}

// --- Main Export Component ---
export default function AuthBackground({ className = '' }: { className?: string }) {
  return (
    <div className={`fixed inset-0 -z-10 ${className}`}>
      <Canvas
        // Performance optimization: Lower pixel ratio slightly if needed
        // dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 10], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        {/* Minimal lighting needed */}
        <ambientLight intensity={1.0} />
        <Suspense fallback={null}>
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}