import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Points, PointMaterial } from '@react-three/drei';

const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function Core() {
  const group = useRef();
  // Place the object relative to the visible area: to the right of the text on
  // wide screens, above the text on narrow ones.
  const { viewport } = useThree();
  const narrow = viewport.width < 6;
  const baseX = narrow ? 0 : viewport.width * 0.24;
  const baseY = narrow ? viewport.height * 0.2 : 0;
  const scale = narrow ? Math.min(0.62, viewport.width / 7) : 0.9;
  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reduceMotion) group.current.rotation.y += delta * 0.15;
    // Gentle parallax following the pointer.
    group.current.rotation.x += (state.pointer.y * 0.3 - group.current.rotation.x) * 0.05;
    group.current.position.x += (baseX + state.pointer.x * 0.3 - group.current.position.x) * 0.05;
  });

  return (
    <group ref={group} position={[baseX, baseY, 0]} scale={scale}>
      <Float speed={reduceMotion ? 0 : 1.5} rotationIntensity={0.6} floatIntensity={1.2}>
        <mesh>
          <icosahedronGeometry args={[1.4, 8]} />
          <MeshDistortMaterial
            color="#6d4dff"
            emissive="#1a0b55"
            roughness={0.25}
            metalness={0.15}
            distort={reduceMotion ? 0 : 0.35}
            speed={1.6}
          />
        </mesh>
        <mesh scale={1.75}>
          <icosahedronGeometry args={[1, 1]} />
          <meshBasicMaterial color="#22d3ee" wireframe transparent opacity={0.25} />
        </mesh>
      </Float>
      <Ring radius={2.6} color="#22d3ee" tilt={[1.2, 0.2, 0]} speed={0.3} />
      <Ring radius={3.1} color="#a78bfa" tilt={[1.4, -0.4, 0.3]} speed={-0.2} />
    </group>
  );
}

function Ring({ radius, color, tilt, speed }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current && !reduceMotion) ref.current.rotation.z += delta * speed;
  });
  return (
    <mesh ref={ref} rotation={tilt}>
      <torusGeometry args={[radius, 0.012, 16, 160]} />
      <meshBasicMaterial color={color} transparent opacity={0.6} />
    </mesh>
  );
}

function Particles({ count }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      arr[i * 3 + 2] = r * Math.cos(phi);
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (ref.current && !reduceMotion) ref.current.rotation.y -= delta * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#9fb4ff" size={0.035} sizeAttenuation depthWrite={false} />
    </Points>
  );
}

function Shapes() {
  const items = useMemo(
    () => [
      { pos: [-5.5, 2.6, -3], geo: 'oct', color: '#22d3ee' },
      { pos: [-4.8, -2.4, -2], geo: 'box', color: '#a78bfa' },
      { pos: [3.6, 2.2, -3], geo: 'tet', color: '#f472b6' },
      { pos: [1.2, -2.9, -1], geo: 'oct', color: '#a78bfa' },
    ],
    []
  );
  return items.map((s, i) => (
    <Float key={i} speed={reduceMotion ? 0 : 2} rotationIntensity={2} floatIntensity={2}>
      <mesh position={s.pos} scale={0.35}>
        {s.geo === 'oct' && <octahedronGeometry />}
        {s.geo === 'box' && <boxGeometry />}
        {s.geo === 'tet' && <tetrahedronGeometry />}
        <meshStandardMaterial color={s.color} roughness={0.3} metalness={0.5} flatShading />
      </mesh>
    </Float>
  ));
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 50 }}
      dpr={[1, isMobile ? 1.5 : 2]}
      gl={{ antialias: !isMobile, alpha: true, powerPreference: 'high-performance' }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.6} />
      <pointLight position={[-5, -3, 2]} intensity={45} color="#22d3ee" />
      <pointLight position={[4, 3, 3]} intensity={40} color="#f472b6" />
      <Core />
      {!isMobile && <Shapes />}
      <Particles count={isMobile ? 500 : 1400} />
    </Canvas>
  );
}
