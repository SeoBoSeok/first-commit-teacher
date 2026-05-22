"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  ContactShadows,
  useGLTF,
  useAnimations,
  Float,
} from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";

useGLTF.preload("/models/Fox.glb");

function Fox() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF("/models/Fox.glb");
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    const first = names[0];
    if (first && actions[first]) {
      actions[first].reset().fadeIn(0.4).play();
    }
  }, [actions, names]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.2;
  });

  return (
    <group ref={group} position={[0, -1.2, 0]} scale={0.02}>
      <primitive object={scene} />
    </group>
  );
}

function Fallback() {
  return (
    <mesh position={[0, 0, 0]}>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.4} metalness={0.1} />
    </mesh>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [3, 1.5, 4], fov: 35 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#0b1020"]} />
      <fog attach="fog" args={["#0b1020", 6, 14]} />

      <ambientLight intensity={0.3} />
      <directionalLight
        castShadow
        position={[4, 6, 3]}
        intensity={1.4}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Suspense fallback={<Fallback />}>
        <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
          <Fox />
        </Float>
        <Environment preset="sunset" />
      </Suspense>

      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.5}
        scale={10}
        blur={2.4}
        far={4}
      />

      <OrbitControls
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}
