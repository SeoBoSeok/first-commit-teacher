"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
// 주의: drei의 <Text>(troika)는 three 0.184 조합에서 WebGL Context Lost를 일으켜 사용하지 않는다
// (이분 탐색으로 확인). 텍스트는 액자와 같은 캔버스 텍스처 방식으로 그린다.
import { MeshReflectorMaterial, OrbitControls, PointerLockControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { CHARACTERS, type Character } from "@/components/spacekkabbi-data";

// 전시관 크기 — 복도형 홀 (x: ±W/2, z: ±L/2)
const HALL = { w: 14, l: 36, h: 6 };
const EYE = 1.6;        // 시점 높이
const SPEED = 4.2;      // 걷기 속도 (m/s)
const FOCUS_DIST = 8;   // 액자 정보가 뜨는 거리

// ── 캐릭터 카드를 캔버스로 그려 액자 텍스처로 사용 (NFT 이미지 없이도 전시 가능) ──
function makeCardTexture(c: Character): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 512; cv.height = 640;
  const g = cv.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, 640);
  bg.addColorStop(0, "#231a4e"); bg.addColorStop(1, "#120c2e");
  g.fillStyle = bg; g.fillRect(0, 0, 512, 640);
  // 팩션 컬러 글로우 프레임
  g.strokeStyle = c.color; g.lineWidth = 10; g.strokeRect(14, 14, 484, 612);
  g.strokeStyle = `${c.color}55`; g.lineWidth = 26; g.strokeRect(7, 7, 498, 626);
  g.textAlign = "left"; g.fillStyle = "#8a86a8"; g.font = "bold 26px monospace";
  g.fillText(`NO. ${c.num}`, 40, 70);
  g.fillStyle = c.color; g.font = "900 64px sans-serif";
  g.fillText(c.name, 40, 150);
  g.fillStyle = "#cfc8e8"; g.font = "24px sans-serif";
  g.fillText(c.role, 40, 192);
  g.fillStyle = "#6a6488"; g.font = "20px sans-serif";
  g.fillText(`${c.element} · ${c.homeworld}`, 40, 226);
  // 심볼: 팩션 컬러의 큰 별
  g.save(); g.translate(256, 360); g.fillStyle = c.color; g.shadowColor = c.color; g.shadowBlur = 60;
  g.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? 38 : 95, a = (i * Math.PI) / 5 - Math.PI / 2;
    g.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  g.closePath(); g.fill(); g.restore();
  // 스탯 바
  const stats = Object.entries(c.stats);
  stats.forEach(([k, v], i) => {
    const y = 488 + i * 28;
    g.fillStyle = "#6a6488"; g.font = "16px monospace"; g.fillText(k.toUpperCase(), 40, y + 12);
    g.fillStyle = "#ffffff14"; g.fillRect(150, y, 290, 12);
    g.fillStyle = c.color; g.fillRect(150, y, 290 * (v as number) / 100, 12);
  });
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// 네온 사인 텍스처 (정면 끝 벽)
function makeSignTexture(text: string): THREE.CanvasTexture {
  const cv = document.createElement("canvas");
  cv.width = 1024; cv.height = 192;
  const g = cv.getContext("2d")!;
  g.textAlign = "center"; g.textBaseline = "middle";
  g.font = "900 110px sans-serif";
  g.shadowColor = "#52f0ff"; g.shadowBlur = 42;
  g.fillStyle = "#bdf6ff";
  for (let i = 0; i < 3; i++) g.fillText(text, 512, 100); // 겹쳐 그려 글로우 강화
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

type FrameEntry = { mesh: THREE.Mesh; char: Character };

function Frame({ char, position, rotationY, register }: {
  char: Character; position: [number, number, number]; rotationY: number;
  register: (e: FrameEntry) => void;
}) {
  const tex = useMemo(() => makeCardTexture(char), [char]);
  const ref = useRef<THREE.Mesh>(null);
  useEffect(() => { if (ref.current) register({ mesh: ref.current, char }); }, [char, register]);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* 네온 프레임(발광) — 조명 수를 늘리지 않고 갤러리 느낌 내기 */}
      <mesh position={[0, 0, -0.06]}>
        <boxGeometry args={[2.5, 3.05, 0.08]} />
        <meshStandardMaterial color="#15102e" emissive={char.color} emissiveIntensity={0.9} />
      </mesh>
      <mesh ref={ref}>
        <planeGeometry args={[2.2, 2.75]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}

// 1인칭 이동 (데스크톱): 클릭으로 시점 잠금 + WASD/방향키
function WalkControls() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    camera.position.set(0, EYE, HALL.l / 2 - 3);
    const dn = (e: KeyboardEvent) => { keys.current[e.code] = true; };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    addEventListener("keydown", dn); addEventListener("keyup", up);
    return () => { removeEventListener("keydown", dn); removeEventListener("keyup", up); };
  }, [camera]);
  useFrame((_, dt) => {
    const k = keys.current;
    const fwd = (k.KeyW || k.ArrowUp ? 1 : 0) - (k.KeyS || k.ArrowDown ? 1 : 0);
    const strafe = (k.KeyD || k.ArrowRight ? 1 : 0) - (k.KeyA || k.ArrowLeft ? 1 : 0);
    if (!fwd && !strafe) return;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir); dir.y = 0; dir.normalize();
    const side = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0));
    camera.position.addScaledVector(dir, fwd * SPEED * dt);
    camera.position.addScaledVector(side, strafe * SPEED * dt);
    // 벽 통과 방지 (단순 클램프 — 전시관은 이걸로 충분)
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -HALL.w / 2 + 0.8, HALL.w / 2 - 0.8);
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -HALL.l / 2 + 0.8, HALL.l / 2 - 0.8);
    camera.position.y = EYE;
  });
  return <PointerLockControls />;
}

// 시선이 머무는 액자 감지 → 부모 HUD로 전달
function AimSensor({ frames, onFocus }: { frames: React.RefObject<FrameEntry[]>; onFocus: (c: Character | null) => void }) {
  const { camera } = useThree();
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const last = useRef<Character | null>(null);
  let tick = 0;
  useFrame(() => {
    if (tick++ % 6 !== 0) return; // 매 프레임 레이캐스트는 낭비
    ray.setFromCamera(new THREE.Vector2(0, 0), camera);
    ray.far = FOCUS_DIST;
    const hit = ray.intersectObjects(frames.current!.map((f) => f.mesh), false)[0];
    const char = hit ? frames.current!.find((f) => f.mesh === hit.object)?.char ?? null : null;
    if (char !== last.current) { last.current = char; onFocus(char); }
  });
  return null;
}

export default function GalleryScene({ onFocus }: { onFocus: (c: Character | null) => void }) {
  const frames = useRef<FrameEntry[]>([]);
  const register = (e: FrameEntry) => {
    if (!frames.current.some((f) => f.mesh === e.mesh)) frames.current.push(e);
  };
  // 터치 기기는 포인터 잠금이 없으므로 자동 회전 관람 모드로
  const [touch, setTouch] = useState(false);
  const [lite, setLite] = useState(false);
  useEffect(() => {
    setTouch(matchMedia("(pointer: coarse)").matches);
    setLite(new URLSearchParams(location.search).has("lite")); // 저사양용: 반사 바닥 끄기
  }, []);

  // 액자 배치: 좌·우 벽에 번갈아, 마지막 1점은 정면 끝 벽 (주인공석)
  const layout = useMemo(() => {
    const out: { char: Character; pos: [number, number, number]; rotY: number }[] = [];
    const zs = [-12, -6, 0, 6, 12];
    CHARACTERS.forEach((c, i) => {
      // 0.35 = 벽 두께(0.3)보다 살짝 안쪽 — 벽 속에 묻히지 않게 (벽 안쪽 면은 ±6.85)
      if (i < 5) out.push({ char: c, pos: [-HALL.w / 2 + 0.35, 2.1, zs[i]], rotY: Math.PI / 2 });
      else if (i < 10) out.push({ char: c, pos: [HALL.w / 2 - 0.35, 2.1, zs[i - 5]], rotY: -Math.PI / 2 });
      else out.push({ char: c, pos: [0, 2.3, -HALL.l / 2 + 0.35], rotY: 0 });
    });
    return out;
  }, []);

  return (
    <Canvas camera={{ fov: 72, position: [0, EYE, HALL.l / 2 - 3] }} className="h-full w-full">
      <color attach="background" args={["#04010f"]} />
      <fog attach="fog" args={["#04010f", 18, 46]} />
      <Stars radius={80} depth={40} count={3000} factor={3.5} fade speed={0.6} />

      <ambientLight intensity={0.65} />
      <pointLight position={[0, 5, 10]} intensity={160} color="#7bb8ff" />
      <pointLight position={[0, 5, -4]} intensity={160} color="#ff8ad8" />
      <pointLight position={[0, 5, -15]} intensity={130} color="#9b7bff" />

      {/* 바닥 — 네온이 비치는 반사 바닥 (터치 기기는 가볍게) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[HALL.w, HALL.l]} />
        {touch || lite ? (
          <meshStandardMaterial color="#0a0820" metalness={0.6} roughness={0.4} />
        ) : (
          <MeshReflectorMaterial color="#0a0820" metalness={0.7} roughness={0.6}
            blur={[300, 80]} mixBlur={0.9} mixStrength={1.6} resolution={512} mirror={0.45} />
        )}
      </mesh>

      {/* 벽 4면 — 위는 뚫려 별이 보이는 우주 전시관 */}
      {([
        [[0, HALL.h / 2, -HALL.l / 2], [HALL.w, HALL.h, 0.3]],
        [[0, HALL.h / 2, HALL.l / 2], [HALL.w, HALL.h, 0.3]],
        [[-HALL.w / 2, HALL.h / 2, 0], [0.3, HALL.h, HALL.l]],
        [[HALL.w / 2, HALL.h / 2, 0], [0.3, HALL.h, HALL.l]],
      ] as const).map(([pos, size], i) => (
        <mesh key={i} position={pos as unknown as THREE.Vector3}>
          <boxGeometry args={size as unknown as [number, number, number]} />
          <meshStandardMaterial color="#0d0926" metalness={0.3} roughness={0.85} />
        </mesh>
      ))}
      {/* 벽 상단 네온 트림 */}
      {[-HALL.w / 2 + 0.05, HALL.w / 2 - 0.05].map((x, i) => (
        <mesh key={i} position={[x, HALL.h - 0.2, 0]}>
          <boxGeometry args={[0.06, 0.06, HALL.l]} />
          <meshStandardMaterial emissive={i ? "#ff2bd6" : "#52f0ff"} emissiveIntensity={2.2} color="#000" />
        </mesh>
      ))}

      {/* 정면 끝 벽의 네온 사인 */}
      <NeonSign />

      {layout.map((f) => (
        <Frame key={f.char.id} char={f.char} position={f.pos} rotationY={f.rotY} register={register} />
      ))}

      {touch
        ? <OrbitControls target={[0, 2, 0]} autoRotate autoRotateSpeed={0.6} enablePan={false} maxDistance={16} />
        : <WalkControls />}
      <AimSensor frames={frames} onFocus={onFocus} />
    </Canvas>
  );
}

function NeonSign() {
  const tex = useMemo(() => makeSignTexture("SPACEKKABBI"), []);
  return (
    <mesh position={[0, 4.6, -HALL.l / 2 + 0.2]}>
      <planeGeometry args={[8, 1.5]} />
      <meshBasicMaterial map={tex} transparent toneMapped={false} />
    </mesh>
  );
}
