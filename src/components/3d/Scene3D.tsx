import React from 'react';
import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';

interface GeometryRendererProps {
  geometry: string;
  color: string;
  scale?: [number, number, number];
  autoRotate?: boolean;
  distort?: boolean;
}

const GeometryMesh: React.FC<GeometryRendererProps> = ({ geometry, color, scale = [1,1,1], autoRotate = true, distort = false }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.5;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  const renderGeometry = () => {
    switch (geometry) {
      case 'cube': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.7]} />;
      case 'octahedron': return <octahedronGeometry args={[0.7]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.7]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <Float speed={2} rotationIntensity={autoRotate ? 0 : 0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} scale={scale}>
        {renderGeometry()}
        {distort ? (
          <MeshDistortMaterial color={color} distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
        ) : (
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
        )}
      </mesh>
    </Float>
  );
};

interface Scene3DProps {
  geometry: string;
  color: string;
  scale?: [number, number, number];
  autoRotate?: boolean;
  distort?: boolean;
  className?: string;
}

const Scene3D: React.FC<Scene3DProps> = ({ geometry, color, scale, autoRotate = true, distort = false, className = '' }) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
        <pointLight position={[5, -5, 5]} intensity={0.3} color="#06b6d4" />
        <GeometryMesh geometry={geometry} color={color} scale={scale} autoRotate={autoRotate} distort={distort} />
      </Canvas>
    </div>
  );
};

export default Scene3D;
