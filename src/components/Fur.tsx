"use client";

import { useFrame } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useMemo, useRef } from "react";
import type { Group } from "three";
import * as THREE from "three";

const SHELL_COUNT = 32;

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uFurLength;
  uniform float uLayer;
  uniform vec3 uWind;

  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vLayer = uLayer;
    vNormal = normalize(normalMatrix * normal);

    // push each vertex along its normal — shell N sits at distance N*length
    vec3 displaced = position + normal * uFurLength * uLayer;

    // outer shells bend with wind. quadratic so tips bend much more than roots.
    // sway adds local variation so the fur ripples instead of moving as one slab.
    float sway = sin(uTime * 1.6 + position.y * 1.4 + position.x * 0.6) * 0.5 + 0.5;
    displaced += uWind * (uLayer * uLayer) * sway;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAG = /* glsl */ `
  uniform sampler2D uFurTex;
  uniform vec3 uBaseColor;
  uniform vec3 uTipColor;
  uniform float uTexRepeat;

  varying vec2 vUv;
  varying float vLayer;
  varying vec3 vNormal;

  void main() {
    // each pixel in the noise texture encodes a strand's max length (0–1).
    // a fragment on shell L survives only if its strand reaches at least L.
    float strand = texture2D(uFurTex, vUv * uTexRepeat).r;
    if (vLayer > 0.0 && strand < vLayer) discard;

    vec3 lightDir = normalize(vec3(0.4, 0.85, 0.5));
    float lambert = max(dot(vNormal, lightDir), 0.0);

    vec3 col = mix(uBaseColor, uTipColor, vLayer);
    col *= 0.5 + 0.5 * lambert;
    col *= mix(0.4, 1.0, vLayer); // fake AO: roots darker, tips brighter

    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function Fur() {
  const group = useRef<Group>(null);
  const scroll = useScroll();

  // Twisted spiral path (TubeGeometry along a 1.5-turn helix)
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 3.0;
      const r = 0.9;
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * r,
          (t - 0.5) * 3.4,
          Math.sin(angle) * r * 0.45
        )
      );
    }
    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 240, 0.42, 24, false);
  }, []);

  // Procedural fur-tip alpha noise: most pixels are 0 (no strand);
  // strand pixels carry a random max-length in their red channel.
  const furTexture = useMemo(() => {
    const size = 512;
    const data = new Uint8Array(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const isStrand = Math.random() < 0.55;
      const v = isStrand ? Math.floor(Math.random() * 256) : 0;
      data[i * 4 + 0] = v;
      data[i * 4 + 1] = v;
      data[i * 4 + 2] = v;
      data[i * 4 + 3] = 255;
    }
    const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, []);

  // Uniforms shared across all shells (mutated in useFrame — every shell sees the same uTime/uWind).
  const sharedUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFurLength: { value: 0.42 },
      uFurTex: { value: furTexture },
      uBaseColor: { value: new THREE.Color("#1e40af") },
      uTipColor: { value: new THREE.Color("#dbeafe") },
      uWind: { value: new THREE.Vector3(0, 0, 0) },
      uTexRepeat: { value: 28 },
    }),
    [furTexture]
  );

  // Per-shell uniforms = spread of shared + unique uLayer.
  // Spread copies references, so uTime / uWind / etc remain the same object across shells.
  const shellUniforms = useMemo(
    () =>
      Array.from({ length: SHELL_COUNT }, (_, i) => ({
        ...sharedUniforms,
        uLayer: { value: i / (SHELL_COUNT - 1) },
      })),
    [sharedUniforms]
  );

  useFrame((state, delta) => {
    sharedUniforms.uTime.value = state.clock.elapsedTime;
    const t = scroll.offset;

    // Wind strength grows as you scroll. Slight oscillation in z so the fur
    // wobbles instead of holding a static deflection.
    sharedUniforms.uWind.value.set(
      0.05 + t * 0.95,
      -0.08 - t * 0.35,
      Math.sin(state.clock.elapsedTime * 0.7) * (0.04 + t * 0.22)
    );

    if (group.current) {
      group.current.rotation.y += delta * (0.12 + t * 0.4);
    }
  });

  return (
    <group ref={group}>
      {shellUniforms.map((uniforms, i) => (
        <mesh key={i} geometry={geometry}>
          <shaderMaterial
            uniforms={uniforms}
            vertexShader={VERT}
            fragmentShader={FRAG}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
