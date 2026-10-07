"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, useCursor } from "@react-three/drei";
import * as THREE from "three";

export interface TributeData {
  id: string;
  name: string;
  birthDate: string;
  passingDate: string;
  audioUrl: string | null;
  photoUrl: string | null;
}

interface StarProps {
  position: [number, number, number];
  tribute: TributeData;
  onClick: (tribute: TributeData, position: [number, number, number]) => void;
}

export function Star({ position, tribute, onClick }: StarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle pulsing effect
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onClick(tribute, position);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);

        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);

        }}
      >
        <sphereGeometry args={[hovered ? 0.8 : 0.5, 16, 16]} />
        <meshBasicMaterial
          color={hovered ? "#00ffcc" : "#ffffff"}
          transparent
          opacity={0.8}
        />
      </mesh>
      {hovered && (
        <Html distanceFactor={15} center>
          <div className="bg-space-900/80 backdrop-blur-sm border border-aurora/50 text-white px-3 py-1 rounded-full text-sm whitespace-nowrap pointer-events-none">
            {tribute.name}
          </div>
        </Html>
      )}
    </group>
  );
}
