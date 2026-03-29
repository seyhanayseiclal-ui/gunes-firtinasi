"use client";

import { useMemo, Suspense, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const EARTH_R = 2.8;

/* ─── HELPERS ─────────────────────────────────────────── */
function dipolePoints(L: number, phi: number, n = 64): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const tMin = 0.18, tMax = Math.PI - 0.18;
  for (let i = 0; i <= n; i++) {
    const th = tMin + (i / n) * (tMax - tMin);
    const r = L * EARTH_R * Math.sin(th) ** 2;
    pts.push(new THREE.Vector3(
      r * Math.sin(th) * Math.cos(phi),
      r * Math.cos(th),
      r * Math.sin(th) * Math.sin(phi)
    ));
  }
  return pts;
}

function compressL(base: number, phi: number, kp: number) {
  const sf = -Math.cos(phi); // +1 sun-side, -1 tail
  if (sf > 0) {
    const f = Math.max(0, Math.min((kp - 3) / 6, 0.65));
    return base * (1 - sf * f);
  }
  return base * (1 + Math.abs(sf) * 0.12);
}

/* ─── ROTATING EARTH (procedural sphere) ──────────────── */
function RotatingEarth() {
  const ref = useRef<THREE.Group>(null!);
  const drag = useRef({ on: false, lx: 0, ly: 0, vx: 0, vy: 0 });

  // Basit kara/okyanus dokusu oluştur (canvas ile)
  const earthTexture = useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d")!;

    // Okyanus gradyanı
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, "#1a3a5c");
    grad.addColorStop(0.15, "#1e5799");
    grad.addColorStop(0.5, "#2076b8");
    grad.addColorStop(0.85, "#1e5799");
    grad.addColorStop(1, "#1a3a5c");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Kara kütleleri (seeded pseudo-random blobs)
    const rng = (s: number) => { s = Math.sin(s * 127.1) * 43758.5453; return s - Math.floor(s); };
    ctx.fillStyle = "#2d6b3f";
    const landMasses = [
      { x: 0.55, y: 0.3, w: 0.18, h: 0.25 },  // Avrupa-Afrika
      { x: 0.75, y: 0.25, w: 0.22, h: 0.3 },   // Asya
      { x: 0.18, y: 0.28, w: 0.15, h: 0.22 },   // Kuzey Amerika
      { x: 0.22, y: 0.55, w: 0.1, h: 0.15 },    // Güney Amerika
      { x: 0.82, y: 0.6, w: 0.12, h: 0.1 },     // Avustralya
      { x: 0.5, y: 0.1, w: 0.3, h: 0.04 },      // Kuzey buz
      { x: 0.4, y: 0.9, w: 0.4, h: 0.06 },      // Antarktika
    ];
    for (const lm of landMasses) {
      ctx.beginPath();
      const cx = lm.x * size, cy = lm.y * size;
      const rx = lm.w * size / 2, ry = lm.h * size / 2;
      // Organik şekil için birden fazla elips
      for (let j = 0; j < 5; j++) {
        const ox = (rng(j + cx) - 0.5) * rx * 0.6;
        const oy = (rng(j + cy + 99) - 0.5) * ry * 0.6;
        ctx.ellipse(cx + ox, cy + oy, rx * (0.5 + rng(j * 7) * 0.5), ry * (0.5 + rng(j * 13) * 0.5), rng(j) * Math.PI, 0, Math.PI * 2);
      }
      ctx.fill();
    }

    // Kutup buzulları
    ctx.fillStyle = "rgba(220, 235, 245, 0.6)";
    ctx.fillRect(0, 0, size, size * 0.06);
    ctx.fillRect(0, size * 0.94, size, size * 0.06);

    // Bulut benzeri beyaz lekeler
    ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
    for (let i = 0; i < 30; i++) {
      const bx = rng(i * 3.7) * size;
      const by = rng(i * 5.1 + 100) * size;
      const br = 10 + rng(i * 9.3) * 40;
      ctx.beginPath();
      ctx.ellipse(bx, by, br, br * 0.4, rng(i) * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const d = drag.current;
    if (!d.on) {
      ref.current.rotation.y += dt * 0.06;
      d.vx *= 0.92; d.vy *= 0.92;
      ref.current.rotation.y += d.vx;
      ref.current.rotation.x += d.vy;
    }
  });

  const { gl } = useThree();

  const down = useCallback((e: PointerEvent) => {
    drag.current = { on: true, lx: e.clientX, ly: e.clientY, vx: 0, vy: 0 };
    gl.domElement.setPointerCapture(e.pointerId);
  }, [gl]);

  const move = useCallback((e: PointerEvent) => {
    const d = drag.current; if (!d.on) return;
    const dx = e.clientX - d.lx, dy = e.clientY - d.ly;
    if (ref.current) { ref.current.rotation.y += dx * 0.005; ref.current.rotation.x += dy * 0.005; }
    d.vx = dx * 0.005; d.vy = dy * 0.005; d.lx = e.clientX; d.ly = e.clientY;
  }, []);

  const up = useCallback((e: PointerEvent) => {
    drag.current.on = false;
    gl.domElement.releasePointerCapture(e.pointerId);
  }, [gl]);

  useMemo(() => {
    const c = gl.domElement;
    c.addEventListener("pointerdown", down);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerup", up);
    c.addEventListener("pointercancel", up);
    c.style.cursor = "grab";
    return () => { c.removeEventListener("pointerdown", down); c.removeEventListener("pointermove", move); c.removeEventListener("pointerup", up); c.removeEventListener("pointercancel", up); };
  }, [gl, down, move, up]);

  return (
    <group ref={ref}>
      {/* Dünya küresi */}
      <mesh>
        <sphereGeometry args={[EARTH_R, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      {/* Atmosfer glow */}
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.02, 48, 48]} />
        <meshBasicMaterial
          color="#4488FF"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
      {/* Dış atmosfer halo */}
      <mesh>
        <sphereGeometry args={[EARTH_R * 1.08, 32, 32]} />
        <meshBasicMaterial
          color="#6699FF"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* ─── MAGNETIC FIELD LINES ────────────────────────────── */
function MagneticFieldLines({ kpIndex }: { kpIndex: number }) {
  const lines = useMemo(() => {
    const shells = [2.5, 4.0, 6.0];
    const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
    const out: { geo: THREE.BufferGeometry; color: string; opacity: number }[] = [];
    for (const bL of shells) {
      for (const phi of angles) {
        const L = compressL(bL, phi, kpIndex);
        const pts = dipolePoints(L, phi);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const sf = -Math.cos(phi);
        const compressed = sf > 0.3 && kpIndex >= 5;
        const color = compressed
          ? (kpIndex >= 8 ? "#88DDFF" : kpIndex >= 6 ? "#66BBFF" : "#5599FF")
          : "#4488FF";
        const opacity = Math.min(0.7, 0.15 + kpIndex * 0.04 + (compressed ? 0.15 : 0));
        out.push({ geo, color, opacity });
      }
    }
    return out;
  }, [kpIndex]);

  return (
    <group>
      {lines.map((l, i) => (
        <primitive key={`${kpIndex}-${i}`} object={new THREE.Line(
          l.geo,
          new THREE.LineBasicMaterial({ color: l.color, transparent: true, opacity: l.opacity, depthWrite: false })
        )} />
      ))}
    </group>
  );
}

/* ─── FLOW PARTICLES ──────────────────────────────────── */
function FlowParticles({ kpIndex }: { kpIndex: number }) {
  const pRef = useRef<THREE.Points>(null!);
  const count = 80 + kpIndex * 25;

  const { curves } = useMemo(() => {
    const shells = [2.5, 4, 6];
    const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
    const c: THREE.CatmullRomCurve3[] = [];
    for (const bL of shells)
      for (const phi of angles)
        c.push(new THREE.CatmullRomCurve3(dipolePoints(compressL(bL, phi, kpIndex), phi)));
    return { curves: c };
  }, [kpIndex]);

  const tVals = useRef(new Float32Array(count));
  const cIdx = useRef(new Int32Array(count));
  const pos = useMemo(() => new Float32Array(count * 3), [count]);

  useMemo(() => {
    tVals.current = new Float32Array(count);
    cIdx.current = new Int32Array(count);
    for (let i = 0; i < count; i++) {
      tVals.current[i] = Math.random();
      // Fix 3: curves.length 0 ise NaN üretmemek için guard
      cIdx.current[i] = curves.length > 0
        ? Math.floor(Math.random() * curves.length)
        : 0;
    }
  }, [count, curves]);

  useFrame((_, dt) => {
    if (!pRef.current) return;
    const spd = 0.05 + kpIndex * 0.02;
    for (let i = 0; i < count; i++) {
      tVals.current[i] += dt * spd;
      if (tVals.current[i] > 1) {
        tVals.current[i] = 0;
        // Fix 3: yeniden atamada da güvenli kontrol
        cIdx.current[i] = curves.length > 0
          ? Math.floor(Math.random() * curves.length)
          : 0;
      }
      const p = curves[cIdx.current[i]]?.getPointAt(Math.min(tVals.current[i], 0.999));
      // Fix 2: NaN değerlerin geometry'ye yazılmasını önle
      if (p && isFinite(p.x) && isFinite(p.y) && isFinite(p.z)) {
        pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z;
      }
    }
    const a = pRef.current.geometry.getAttribute("position");
    (a as THREE.BufferAttribute).set(pos);
    a.needsUpdate = true;
  });

  return (
    <points ref={pRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.08} color="#88CCFF" transparent opacity={0.5 + kpIndex * 0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

/* ─── AURORA ──────────────────────────────────────────── */
function AuroraEffect({ kpIndex }: { kpIndex: number }) {
  const nRef = useRef<THREE.Mesh>(null!);
  const sRef = useRef<THREE.Mesh>(null!);

  const lat = kpIndex >= 9 ? 25 : kpIndex >= 8 ? 35 : kpIndex >= 7 ? 40 : kpIndex >= 6 ? 50 : 60;
  const colat = ((90 - lat) * Math.PI) / 180;
  const rr = EARTH_R * Math.sin(colat);
  const yy = EARTH_R * Math.cos(colat);
  const op = 0.12 + Math.max(0, kpIndex - 4) * 0.07;
  const tube = 0.06 + Math.max(0, kpIndex - 4) * 0.02;

  useFrame((_, dt) => {
    if (nRef.current) nRef.current.rotation.z += dt * 0.3;
    if (sRef.current) sRef.current.rotation.z -= dt * 0.3;
  });

  return (
    <group>
      <mesh ref={nRef} position={[0, yy, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rr, tube, 8, 48]} />
        <meshBasicMaterial color="#00FF88" transparent opacity={op} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={sRef} position={[0, -yy, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[rr, tube, 8, 48]} />
        <meshBasicMaterial color="#00FF88" transparent opacity={op * 0.6} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}

/* ─── SOLAR WIND ──────────────────────────────────────── */
function SolarWind({ kpIndex }: { kpIndex: number }) {
  const pRef = useRef<THREE.Points>(null!);
  const cnt = 120 + kpIndex * 35;
  const pos = useMemo(() => {
    const a = new Float32Array(cnt * 3);
    for (let i = 0; i < cnt; i++) {
      a[i * 3] = -15 + Math.random() * 10;
      a[i * 3 + 1] = (Math.random() - 0.5) * 8;
      a[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return a;
  }, [cnt]);

  useFrame((_, dt) => {
    if (!pRef.current) return;
    const attr = pRef.current.geometry.getAttribute("position");
    const arr = (attr as THREE.BufferAttribute).array as Float32Array;
    const spd = 2 + kpIndex * 0.8;
    for (let i = 0; i < cnt; i++) {
      arr[i * 3] += dt * spd;
      if (arr[i * 3] > -EARTH_R * 0.5) {
        const y = arr[i * 3 + 1], z = arr[i * 3 + 2];
        const d = Math.sqrt(y * y + z * z);
        if (d < EARTH_R * 2.2) {
          arr[i * 3 + 1] += (y > 0 ? 1 : -1) * dt * spd * 1.5;
          arr[i * 3 + 2] += (z > 0 ? 1 : -1) * dt * spd * 0.8;
        }
      }
      if (arr[i * 3] > 10) {
        arr[i * 3] = -15 - Math.random() * 5;
        arr[i * 3 + 1] = (Math.random() - 0.5) * 8;
        arr[i * 3 + 2] = (Math.random() - 0.5) * 8;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pos, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#FFB347" transparent opacity={0.35 + kpIndex * 0.04} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}



function EarthLights() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[-10, 5, 5]} intensity={1.2} color="#FFFFFF" />
      <pointLight position={[5, 3, 8]} intensity={0.4} color="#B0C4DE" />
    </>
  );
}

/* ─── EXPORT ──────────────────────────────────────────── */
export default function EarthCanvas({ kpIndex }: { kpIndex: number }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0, 28], fov: 50 }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <EarthLights />
      <Suspense fallback={null}>
        <RotatingEarth />
        <MagneticFieldLines kpIndex={kpIndex} />
        <FlowParticles kpIndex={kpIndex} />
        <AuroraEffect kpIndex={kpIndex} />
        <SolarWind kpIndex={kpIndex} />
      </Suspense>
    </Canvas>
  );
}
