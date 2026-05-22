"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ScrollControls,
  Scroll,
  useScroll,
  Stars,
} from "@react-three/drei";
import { useRef } from "react";
import type React from "react";
import type { Mesh } from "three";
import * as THREE from "three";
import Fur from "./Fur";

function NebulaClouds() {
  const a = useRef<Mesh>(null);
  const b = useRef<Mesh>(null);
  const c = useRef<Mesh>(null);

  useFrame((_, delta) => {
    if (a.current) a.current.rotation.y += delta * 0.02;
    if (b.current) b.current.rotation.y -= delta * 0.015;
    if (c.current) c.current.rotation.x += delta * 0.01;
  });

  const cloudMat = (color: string, opacity = 0.4) => (
    <meshBasicMaterial
      color={color}
      transparent
      opacity={opacity}
      blending={THREE.AdditiveBlending}
      depthWrite={false}
      toneMapped={false}
    />
  );

  return (
    <group>
      <mesh ref={a} position={[-7, 2, -12]}>
        <sphereGeometry args={[6, 32, 32]} />
        {cloudMat("#7c2d92", 0.45)}
      </mesh>
      <mesh ref={b} position={[8, -3, -10]}>
        <sphereGeometry args={[5.5, 32, 32]} />
        {cloudMat("#0e7490", 0.5)}
      </mesh>
      <mesh ref={c} position={[2, 6, -14]}>
        <sphereGeometry args={[4.5, 32, 32]} />
        {cloudMat("#be185d", 0.4)}
      </mesh>
      <mesh position={[-4, -6, -9]}>
        <sphereGeometry args={[4, 32, 32]} />
        {cloudMat("#1e3a8a", 0.45)}
      </mesh>
      <mesh position={[0, 0, -18]}>
        <sphereGeometry args={[9, 32, 32]} />
        {cloudMat("#312e81", 0.35)}
      </mesh>
    </group>
  );
}

function CameraRig() {
  const scroll = useScroll();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const t = scroll.offset;

    // Slight orbit so the fur sway is visible from changing angles,
    // but keep the shape mostly upright in view.
    const angle = t * Math.PI * 0.9;
    const radius = 5.2 - t * 0.6;
    const desired = new THREE.Vector3(
      Math.sin(angle) * radius,
      0.5 + Math.sin(t * Math.PI) * 0.8,
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
          Lecture01 ✦
        </span>
        <nav className="pointer-events-auto hidden gap-8 text-sm text-white sm:flex">
          <a href="#fur" className="hover:opacity-70">Fur</a>
          <a href="#wind" className="hover:opacity-70">Wind</a>
          <a href="#drift" className="hover:opacity-70">Drift</a>
        </nav>
      </header>

      <Section id="fur" className="justify-end text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          01 — Soft matter
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          A <span className="italic text-blue-300">furry</span> nebula,
          <br /> spun in space.
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
          Scroll down — the cosmic wind picks up.
        </p>
        <div className="mt-8 flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/40">
          <span className="inline-block h-px w-8 bg-white/40" />
          Scroll
        </div>
      </Section>

      <Section id="wind" className="items-end justify-center text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          02 — Solar wind
        </p>
        <h2 className="max-w-xl text-right text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Every strand
          <br />
          <span className="italic text-blue-200">bends with you.</span>
        </h2>
        <p className="mt-4 max-w-sm text-right text-sm text-white/70">
          32 shells of geometry, wind-deflected per-vertex on the GPU.
        </p>
      </Section>

      <Section
        id="drift"
        className="items-center justify-center text-center text-white"
      >
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          03 — Drift
        </p>
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Soft on the
          <span className="italic text-blue-300"> outside,</span>
          <br />
          shaped by
          <span className="italic text-blue-200"> motion.</span>
        </h2>
        <a
          href="#fur"
          className="pointer-events-auto mt-10 inline-block rounded-full border border-white/30 px-6 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
        >
          Drift back up
        </a>
      </Section>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0.5, 5.2], fov: 38 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#160736"]} />
      <fog attach="fog" args={["#1a0a3a", 18, 40]} />

      <NebulaClouds />

      <Stars
        radius={80}
        depth={40}
        count={5000}
        factor={3.5}
        saturation={0.6}
        fade
        speed={0.5}
      />

      <ScrollControls pages={3} damping={0.25}>
        <Fur />

        <CameraRig />

        <Scroll html>
          <HtmlContent />
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
