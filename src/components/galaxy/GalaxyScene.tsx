"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars as BackgroundStars } from "@react-three/drei";
import * as THREE from "three";
import { Star, TributeData } from "./Star";
import { calculateStarPosition } from "./utils";
import { useMemo } from "react";

interface GalaxySceneProps {
  tributes: TributeData[];
  onStarClick: (tribute: TributeData, position: [number, number, number]) => void;
  targetPosition: [number, number, number] | null;
}

function CameraController({ targetPosition }: { targetPosition: [number, number, number] | null }) {
  const { camera } = useThree();

  useFrame(() => {
    if (targetPosition) {
      // Calculate target camera position (slightly offset from the star)
      const target = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2] + 15);
      camera.position.lerp(target, 0.05);
      camera.lookAt(targetPosition[0], targetPosition[1], targetPosition[2]);
    }
  });

  return null;
}

export function GalaxyScene({ tributes, onStarClick, targetPosition }: GalaxySceneProps) {
  const stars = useMemo(() => {
    return tributes.map((tribute, index) => ({
      tribute,
      position: calculateStarPosition(tribute.birthDate, index, tribute.id)
    }));
  }, [tributes]);

  return (
    <div className="w-full h-[calc(100vh-4rem)] absolute top-16 left-0 -z-10">
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[50, 50, 50]} intensity={2} color="#ffffff" distance={200} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#00ffcc" distance={200} />

        <BackgroundStars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* The Earth in the center of the universe */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshStandardMaterial color="#2b65ec" roughness={0.6} metalness={0.1} emissive="#0a2a66" emissiveIntensity={0.5} />
        </mesh>

        <group>
          {stars.map(({ tribute, position }) => (
            <Star
              key={tribute.id}
              position={position}
              tribute={tribute}
              onClick={onStarClick}
            />
          ))}
        </group>

        <CameraController targetPosition={targetPosition} />
        {!targetPosition && <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} autoRotate autoRotateSpeed={0.5} maxDistance={250} minDistance={10} />}
      </Canvas>
    </div>
  );
}
