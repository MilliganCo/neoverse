import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  TransformControls,
  MeshDistortMaterial,
  useCursor,
} from '@react-three/drei';
import * as THREE from 'three';
import { Object3D, SpaceObject } from '@/types';

const GEOMETRY_MAP: Record<string, React.ReactNode> = {
  cube: <boxGeometry args={[1, 1, 1]} />,
  sphere: <sphereGeometry args={[0.7, 32, 32]} />,
  torus: <torusGeometry args={[0.5, 0.2, 16, 32]} />,
  cylinder: <cylinderGeometry args={[0.5, 0.5, 1, 32]} />,
  cone: <coneGeometry args={[0.5, 1, 32]} />,
  dodecahedron: <dodecahedronGeometry args={[0.7]} />,
  octahedron: <octahedronGeometry args={[0.7]} />,
  icosahedron: <icosahedronGeometry args={[0.7]} />,
};

type TransformMode = 'translate' | 'rotate' | 'scale';

interface SceneObjectProps {
  spaceObj: SpaceObject;
  objDef: Object3D | undefined;
  isSelected: boolean;
  transformMode: TransformMode;
  onSelect: () => void;
  onTransform: (position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  isPlayMode?: boolean;
}

const DynamicSimObject: React.FC<{
  spaceObj: SpaceObject;
  objDef: Object3D;
  children: React.ReactNode;
}> = ({ spaceObj, objDef, children }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const impulse = useRef([0.02, 0.015, 0.01]);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += impulse.current[0] * delta * 60;
      meshRef.current.rotation.y += impulse.current[1] * delta * 60;
      meshRef.current.rotation.z += impulse.current[2] * delta * 60;
    }
  });
  return (
    <mesh ref={meshRef} position={spaceObj.position} rotation={spaceObj.rotation} scale={spaceObj.scale}>
      {children}
    </mesh>
  );
};

const SceneObject: React.FC<SceneObjectProps> = ({
  spaceObj,
  objDef,
  isSelected,
  transformMode,
  onSelect,
  onTransform,
  isPlayMode = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered && !isPlayMode);

  if (!objDef) return null;

  const geom = GEOMETRY_MAP[objDef.geometry] || GEOMETRY_MAP.cube;
  const material = objDef.type === 'dynamic' ? (
    <MeshDistortMaterial color={objDef.color} distort={isPlayMode ? 0.4 : 0.2} speed={isPlayMode ? 3 : 1.5} roughness={0.2} metalness={0.8} />
  ) : (
    <meshStandardMaterial color={objDef.color} roughness={0.2} metalness={0.8} />
  );

  if (isPlayMode && objDef.type === 'dynamic') {
    return (
      <DynamicSimObject spaceObj={spaceObj} objDef={objDef}>
        {geom}
        {material}
      </DynamicSimObject>
    );
  }

  const mesh = (
    <mesh
      ref={meshRef}
      position={spaceObj.position}
      rotation={spaceObj.rotation}
      scale={spaceObj.scale}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {geom}
      {material}
    </mesh>
  );

  if (isSelected && !isPlayMode) {
    return (
      <TransformControls
        mode={transformMode}
        onObjectChange={(e) => {
          if (e.target.object && e.target.object instanceof THREE.Mesh) {
            const o = e.target.object;
            const p = o.position;
            const r = o.rotation;
            const s = o.scale;
            onTransform([p.x, p.y, p.z], [r.x, r.y, r.z], [s.x, s.y, s.z]);
          }
        }}
      >
        {mesh}
      </TransformControls>
    );
  }

  return mesh;
};

interface EditorSceneProps {
  spaceObjects: SpaceObject[];
  objectLookup: Record<string, Object3D>;
  selectedId: string | null;
  transformMode: TransformMode;
  onSelect: (id: string | null) => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  isPlayMode?: boolean;
}

const EditorSceneInner: React.FC<EditorSceneProps> = ({
  spaceObjects,
  objectLookup,
  selectedId,
  transformMode,
  onSelect,
  onTransform,
  isPlayMode = false,
}) => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[5, -5, 5]} intensity={0.3} color="#06b6d4" />
      {spaceObjects.map((so) => {
        const soId = so.id || `legacy-${so.objectId}`;
        return (
          <SceneObject
            key={soId}
            spaceObj={so}
            objDef={objectLookup[so.objectId]}
            isSelected={selectedId === soId}
            transformMode={transformMode}
            onSelect={() => onSelect(selectedId === soId ? null : soId)}
            onTransform={(pos, rot, scl) => onTransform(soId, pos, rot, scl)}
            isPlayMode={isPlayMode}
          />
        );
      })}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={20}
      />
    </>
  );
};

interface EditorSceneWrapperProps {
  spaceObjects: SpaceObject[];
  objectLookup: Record<string, Object3D>;
  selectedId: string | null;
  transformMode: TransformMode;
  onSelect: (id: string | null) => void;
  onTransform: (id: string, position: [number, number, number], rotation: [number, number, number], scale: [number, number, number]) => void;
  isPlayMode?: boolean;
}

const EditorScene: React.FC<EditorSceneWrapperProps> = (props) => {
  return (
    <div className="w-full h-full bg-background/50 rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 50 }}
        gl={{ antialias: true }}
        onPointerMissed={() => props.onSelect(null)}
      >
        <EditorSceneInner {...props} />
      </Canvas>
    </div>
  );
};

export default EditorScene;
