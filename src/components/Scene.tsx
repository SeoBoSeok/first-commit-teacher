"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Environment,
  ScrollControls,
  Scroll,
  useScroll,
  Stars,
  Lightformer,
  MeshDistortMaterial,
  Icosahedron,
} from "@react-three/drei";
import { useRef } from "react";
import type React from "react";
import type { Group, Mesh } from "three";
import * as THREE from "three";

type DistortMaterialRef = React.ComponentRef<typeof MeshDistortMaterial>;

function Nebula() {
  const mesh = useRef<Mesh>(null);
  const mat = useRef<DistortMaterialRef>(null);
  const scroll = useScroll();

  useFrame((state, delta) => {
    if (!mesh.current || !mat.current) return;
    const t = scroll.offset; // 0 → 1

    // Constant slow tumble + scroll-driven spin
    mesh.current.rotation.x += delta * (0.15 + t * 0.8);
    mesh.current.rotation.y += delta * (0.2 + t * 1.0);

    // Morphing: distort surges then calms across scroll
    const targetDistort = 0.25 + Math.sin(t * Math.PI) * 0.6;
    mat.current.distort = THREE.MathUtils.lerp(
      mat.current.distort,
      targetDistort,
      0.08
    );

    // Iridescence index of refraction shifts ↔ rainbow chrome
    mat.current.iridescenceIOR = 1.3 + t * 1.3;

    // Breathing scale + scroll-driven growth
    const scale =
      1 + Math.sin(state.clock.elapsedTime * 0.6) * 0.04 + t * 0.35;
    mesh.current.scale.setScalar(scale);
  });

  return (
    <Icosahedron args={[1.3, 64]} ref={mesh}>
      <MeshDistortMaterial
        ref={mat}
        color="#ffffff"
        roughness={0}
        metalness={1}
        envMapIntensity={1.6}
        clearcoat={1}
        clearcoatRoughness={0.05}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[100, 900]}
        distort={0.35}
        speed={2}
      />
    </Icosahedron>
  );
}

function HoloLights() {
  const group = useRef<Group>(null);
  const scroll = useScroll();

  useFrame((_, delta) => {
    if (!group.current) return;
    const t = scroll.offset;
    group.current.rotation.y += delta * (0.3 + t * 1.2);
    group.current.rotation.x = Math.sin(t * Math.PI * 2) * 0.4;
  });

  return (
    <group ref={group}>
      <Lightformer
        form="circle"
        intensity={5}
        color="#ff3df0"
        position={[5, 4, 4]}
        scale={2.5}
      />
      <Lightformer
        form="circle"
        intensity={5}
        color="#22d3ee"
        position={[-5, 2, -3]}
        scale={2.5}
      />
      <Lightformer
        form="circle"
        intensity={4}
        color="#fde047"
        position={[0, -5, 3]}
        scale={2}
      />
      <Lightformer
        form="ring"
        intensity={3}
        color="#a855f7"
        position={[0, 4, -5]}
        scale={3.5}
      />
      <Lightformer
        form="rect"
        intensity={2.5}
        color="#34d399"
        position={[-4, -2, 4]}
        scale={[3, 1, 1]}
      />
    </group>
  );
}

function CameraRig() {
  const scroll = useScroll();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    const t = scroll.offset;

    const angle = t * Math.PI * 1.6;
    const radius = 5 - t * 1.2;
    const desired = new THREE.Vector3(
      Math.sin(angle) * radius,
      1.0 + Math.sin(t * Math.PI) * 1.4,
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
          <a href="#nebula" className="hover:opacity-70">Nebula</a>
          <a href="#transmute" className="hover:opacity-70">Transmute</a>
          <a href="#infinite" className="hover:opacity-70">Infinite</a>
        </nav>
      </header>

      <Section id="nebula" className="justify-end text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          01 — Born from stardust
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          A <span className="italic text-fuchsia-300">nebula</span> in
          <br /> chrome.
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
          Scroll through the void — light bends, form folds.
        </p>
        <div className="mt-8 flex items-center gap-2 text-[10px] tracking-widest uppercase text-white/40">
          <span className="inline-block h-px w-8 bg-white/40" />
          Scroll
        </div>
      </Section>

      <Section id="transmute" className="items-end justify-center text-white">
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          02 — Transmutation
        </p>
        <h2 className="max-w-xl text-right text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Chrome shifts,
          <br />
          <span className="italic text-cyan-300">form transmutes.</span>
        </h2>
        <p className="mt-4 max-w-sm text-right text-sm text-white/70">
          Iridescent metal that obeys your scroll — no two frames alike.
        </p>
      </Section>

      <Section
        id="infinite"
        className="items-center justify-center text-center text-white"
      >
        <p className="mb-3 text-[10px] tracking-[0.3em] uppercase text-white/50">
          03 — Infinite
        </p>
        <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
          Made of
          <span className="italic text-fuchsia-300"> light,</span>
          <br />
          shaped by
          <span className="italic text-cyan-300"> motion.</span>
        </h2>
        <a
          href="#nebula"
          className="pointer-events-auto mt-10 inline-block rounded-full border border-white/30 px-6 py-3 text-sm tracking-widest uppercase hover:bg-white hover:text-black transition-colors"
        >
          Return to the void
        </a>
      </Section>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1, 5], fov: 35 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#020014"]} />

      <Stars
        radius={80}
        depth={40}
        count={5000}
        factor={3}
        saturation={0.2}
        fade
        speed={0.5}
      />

      <ScrollControls pages={3} damping={0.25}>
        <Nebula />

        <Environment frames={Infinity} resolution={256}>
          <HoloLights />
        </Environment>

        <CameraRig />

        <Scroll html>
          <HtmlContent />
        </Scroll>
      </ScrollControls>
    </Canvas>
  );
}
