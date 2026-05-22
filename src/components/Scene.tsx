"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ContactShadows,
  useGLTF,
  useAnimations,
  ScrollControls,
  Scroll,
  useScroll,
} from "@react-three/drei";
import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";

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
    if (group.current) group.current.rotation.y += delta * 0.3;
  });

  return (
    <group ref={group} position={[0, -1.2, 0]} scale={0.02}>
      <primitive object={scene} />
    </group>
  );
}

function Fallback() {
  return (
    <mesh>
      <sphereGeometry args={[0.8, 32, 32]} />
      <meshStandardMaterial color="#f59e0b" roughness={0.4} />
    </mesh>
  );
}

function CameraRig() {
  const scroll = useScroll();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const t = scroll.offset; // 0 → 1 across all pages

    // Camera arcs around the fox as you scroll: ~270° sweep, rising and falling
    const angle = t * Math.PI * 1.5;
    const radius = 4.5 - t * 0.8;
    const desired = new THREE.Vector3(
      Math.sin(angle) * radius,
      1.4 + Math.sin(t * Math.PI) * 1.2,
      Math.cos(angle) * radius
    );

    state.camera.position.lerp(desired, 1 - Math.pow(0.001, delta));
    target.current.lerp(new THREE.Vector3(0, 0, 0), 0.1);
    state.camera.lookAt(target.current);
  });

  return null;
}

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`flex h-screen w-screen flex-col p-6 sm:p-12 ${className}`}
    >
      {children}
    </section>
  );
}

function HtmlContent() {
  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-6 sm:p-10">
        <span className="pointer-events-auto text-sm font-medium tracking-[0.3em] uppercase text-white">
          Lecture01
        </span>
        <nav className="pointer-events-auto hidden gap-8 text-sm text-white sm:flex">
          <a href="#work" className="hover:opacity-70">Work</a>
          <a href="#about" className="hover:opacity-70">About</a>
          <a href="#contact" className="hover:opacity-70">Contact</a>
        </nav>
      </header>

      <Section className="justify-end text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          01 — Intro
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Crafted in <span className="italic text-amber-300">3D</span>,
          <br /> built for the web.
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
          Scroll to explore — the camera moves with you.
        </p>
        <div className="mt-8 flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/40">
          <span className="inline-block h-px w-8 bg-white/40" />
          Scroll
        </div>
      </Section>

      <Section id="work" className="items-end justify-center text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          02 — Work
        </p>
        <h2 className="max-w-xl text-right text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Real-time scenes,
          <br />
          <span className="italic text-amber-300">no compromise.</span>
        </h2>
        <p className="mt-4 max-w-sm text-right text-sm text-white/70">
          react-three-fiber on Next.js — same stack sougen.co uses, fully under
          your control.
        </p>
      </Section>

      <Section id="about" className="items-center justify-center text-center text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          03 — About
        </p>
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Made with
          <span className="italic text-amber-300"> code,</span>
          <br />
          shaped by
          <span className="italic text-amber-300"> motion.</span>
        </h2>
        <a
          href="#contact"
          className="pointer-events-auto mt-10 inline-block rounded-full border border-white/30 px-6 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
        >
          Get in touch
        </a>
      </Section>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 4.5], fov: 35 }}
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

      <ScrollControls pages={3} damping={0.25}>
        <Suspense fallback={<Fallback />}>
          <Fox />
          <Environment preset="sunset" />
        </Suspense>

        <ContactShadows
          position={[0, -1.2, 0]}
          opacity={0.5}
          scale={10}
          blur={2.4}
          far={4}
        />

        <CameraRig />

        <Scroll html>
          <HtmlContent />
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
