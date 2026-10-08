"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars as BackgroundStars, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { Star, TributeData } from "./Star";
import { calculateStarPosition } from "./utils";
import { useMemo } from "react";

interface GalaxySceneProps {
  tributes: TributeData[];
  onStarClick: (tribute: TributeData, position: [number, number, number]) => void;
  targetPosition: [number, number, number] | null;
}


function Earth() {
  const colorMap = useTexture("/earth-texture.jpg");
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[15, 64, 64]} />
      <meshStandardMaterial map={colorMap} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

function CameraController({ targetPosition }: { targetPosition: [number, number, number] | null }) {
  const { camera, controls } = useThree();

  useFrame(() => {
    if (targetPosition && controls) {
      // @ts-ignore - OrbitControls is attached to controls
      const orbitControls = controls as any;

      const targetVec = new THREE.Vector3(...targetPosition);

      // Lerp the OrbitControls target to look at the star
      orbitControls.target.lerp(targetVec, 0.02);

      // Calculate desired camera position slightly offset from the star
      const cameraTarget = new THREE.Vector3(targetPosition[0], targetPosition[1], targetPosition[2] + 15);

      // Lerp camera position
      camera.position.lerp(cameraTarget, 0.02);

      // Must update controls
      orbitControls.update();
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
    <div className="w-full h-[calc(100vh-4rem)] absolute top-0 left-0 -z-10">
      <Canvas camera={{ position: [0, 50, 100], fov: 60 }}>
        <color attach="background" args={["#050510"]} />
        <ambientLight intensity={5} />
        <ambientLight intensity={2} />
        <directionalLight position={[100, 50, 100]} intensity={15} />
        <pointLight position={[-50, -50, -50]} intensity={100} color="#00ffcc" distance={500} />

        <BackgroundStars radius={300} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

        {/* The Earth in the center of the universe */}
        <Earth />

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
        {/* @ts-ignore - listenToKeyEvents needs to be attached to window */}
        <OrbitControls listenToKeyEvents={typeof window !== "undefined" ? window : undefined} makeDefault enablePan={true} enableZoom={true} enableRotate={true} autoRotate={!targetPosition} autoRotateSpeed={0.15} maxDistance={250} minDistance={10} />
      </Canvas>
    </div>
  );
}
