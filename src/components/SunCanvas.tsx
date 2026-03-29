"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   GLSL SHADERS — Güneş yüzeyi
───────────────────────────────────────────────────────────── */
const sunVertexShader = `
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  // Simplex-style noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    
    // Yüzey dalgalanması (granulation)
    float noiseVal = snoise(position * 2.5 + vec3(uTime * 0.08));
    float displacement = noiseVal * 0.04;
    vec3 newPos = position + normal * displacement;
    
    vPosition = newPos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

const sunFragmentShader = `
  uniform float uTime;
  uniform float uKp;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    // Temel granulation noise katmanları
    float n1 = snoise(vPosition * 3.0 + vec3(uTime * 0.05)) * 0.5 + 0.5;
    float n2 = snoise(vPosition * 6.0 - vec3(uTime * 0.08)) * 0.5 + 0.5;
    float n3 = snoise(vPosition * 12.0 + vec3(uTime * 0.12)) * 0.5 + 0.5;
    float granulation = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;

    // Limb darkening — kenarlara doğru kararmak
    float limb = dot(vNormal, vec3(0.0, 0.0, 1.0));
    limb = clamp(limb, 0.0, 1.0);
    float limbDark = pow(limb, 0.5);

    // Kp bazlı renk tonu (düşük Kp: sarı, yüksek Kp: kırmızı-turuncu)
    float kpFactor = clamp(uKp / 9.0, 0.0, 1.0);

    // Renk paleti
    vec3 colorCore   = mix(vec3(1.0, 0.95, 0.5), vec3(1.0, 0.85, 0.2), granulation);  // parlak sarı
    vec3 colorMid    = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.35, 0.05), kpFactor);     // turuncu
    vec3 colorEdge   = mix(vec3(0.7, 0.15, 0.0), vec3(0.9, 0.05, 0.0), kpFactor);     // kırmızı kenar

    // Limb darkening ile karıştır
    vec3 color = mix(colorEdge, mix(colorMid, colorCore, granulation), limbDark);

    // Güneş lekesi (sunspot) efekti — karanlık bölgeler
    float spot = snoise(vPosition * 5.0 + vec3(0.0)) * 0.5 + 0.5;
    float spotMask = smoothstep(0.68, 0.72, spot) * (1.0 - limbDark * 0.4);
    color = mix(color, color * 0.25, spotMask * 0.7);

    // Hafif emisyon parlaklığı
    float emission = granulation * limbDark * 1.2;
    color *= emission;

    gl_FragColor = vec4(color, 1.0);
  }
`;

/* ─────────────────────────────────────────────────────────────
   CORONA HALO SHADER
───────────────────────────────────────────────────────────── */
const coronaVertexShader = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPos.xyz;
    gl_Position = projectionMatrix * mvPos;
  }
`;

const coronaFragmentShader = `
  uniform float uOpacity;
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float rimFactor = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
    rimFactor = pow(rimFactor, 2.5);
    gl_FragColor = vec4(uColor, rimFactor * uOpacity);
  }
`;

/* ─────────────────────────────────────────────────────────────
   SOLAR FLARE PARTİKÜLLERİ
───────────────────────────────────────────────────────────── */
function SolarFlares({ kpIndex }: { kpIndex: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, velocities } = useMemo(() => {
    const count = 350;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Küre yüzeyinde rastgele başlangıç noktası
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1.0 + Math.random() * 0.05;

      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Dışa doğru hız
      const speed = 0.002 + Math.random() * 0.006;
      vel[i * 3]     = pos[i * 3] * speed;
      vel[i * 3 + 1] = pos[i * 3 + 1] * speed;
      vel[i * 3 + 2] = pos[i * 3 + 2] * speed;
    }
    return { positions: pos, velocities: vel };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  // Kp'ye göre partikül rengi
  const flareColor = useMemo(() => {
    if (kpIndex >= 7) return new THREE.Color("#FF2D55");
    if (kpIndex >= 6) return new THREE.Color("#FF6B35");
    if (kpIndex >= 5) return new THREE.Color("#FFB347");
    return new THREE.Color("#FFE066");
  }, [kpIndex]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;

    for (let i = 0; i < arr.length / 3; i++) {
      const ix = i * 3;
      const dist = Math.sqrt(arr[ix] ** 2 + arr[ix + 1] ** 2 + arr[ix + 2] ** 2);

      // Partiküller 2.2 birim dışına çıkınca yüzeye geri döner
      if (dist > 2.2) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.0;
        arr[ix]     = r * Math.sin(phi) * Math.cos(theta);
        arr[ix + 1] = r * Math.sin(phi) * Math.sin(theta);
        arr[ix + 2] = r * Math.cos(phi);

        const speed = 0.002 + Math.random() * 0.006;
        velocities[ix]     = arr[ix] * speed;
        velocities[ix + 1] = arr[ix + 1] * speed;
        velocities[ix + 2] = arr[ix + 2] * speed;
      } else {
        arr[ix]     += velocities[ix];
        arr[ix + 1] += velocities[ix + 1];
        arr[ix + 2] += velocities[ix + 2];
      }
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color={flareColor}
        size={0.025}
        sizeAttenuation
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   CORONA KATMANLARI
───────────────────────────────────────────────────────────── */
function CoronaLayer({ scale, opacity, color }: { scale: number; opacity: number; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uOpacity: { value: opacity },
      uColor: { value: new THREE.Color(color) },
    }),
    [opacity, color]
  );

  useFrame(({ clock }) => {
    if (meshRef.current) {
      // Taç hafif soluyor (pulse)
      const t = clock.getElapsedTime();
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value =
        opacity * (0.75 + Math.sin(t * 0.8) * 0.25);
    }
  });

  return (
    <mesh ref={meshRef} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={coronaVertexShader}
        fragmentShader={coronaFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.FrontSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   ANA GÜNEŞ KÜRESİ
───────────────────────────────────────────────────────────── */
function SunSphere({ kpIndex }: { kpIndex: number }) {
  const meshRef = useRef<THREE.Mesh>(null!);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uKp: { value: kpIndex },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    uniforms.uKp.value = kpIndex;

    if (meshRef.current) {
      // Yavaş y-ekseni rotasyonu (~20s/tur)
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      // Hafif z-titreme — canlılık hissi
      meshRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.3) * 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        vertexShader={sunVertexShader}
        fragmentShader={sunFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   KAMERA AYARI
───────────────────────────────────────────────────────────── */
function CameraSetup() {
  const { camera } = useThree();
  camera.position.set(0, 0, 3.2);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   ANA SAHNE
───────────────────────────────────────────────────────────── */
function SunScene({ kpIndex }: { kpIndex: number }) {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Tüm sahne hafif sallanma
      const t = clock.getElapsedTime();
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.04;
    }
  });

  // Corona rengi Kp'ye göre
  const coronaColor = kpIndex >= 7 ? "#FF4422" : kpIndex >= 5 ? "#FF7722" : "#FFB347";

  return (
    <group ref={groupRef}>
      {/* Nokta ışıkları */}
      <ambientLight intensity={0.15} />
      <pointLight position={[5, 5, 5]} intensity={0.6} color="#FFF5E0" />

      {/* Güneş çekirdeği */}
      <SunSphere kpIndex={kpIndex} />

      {/* Corona katmanları — 3 aşama */}
      <CoronaLayer scale={1.18} opacity={0.55} color={coronaColor} />
      <CoronaLayer scale={1.38} opacity={0.28} color={coronaColor} />
      <CoronaLayer scale={1.65} opacity={0.12} color="#FF9944" />

      {/* Solar flare partikülleri */}
      <SolarFlares kpIndex={kpIndex} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   EXPORT — Canvas wrapper
───────────────────────────────────────────────────────────── */
export default function SunCanvas({ kpIndex }: { kpIndex: number }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <CameraSetup />
      <SunScene kpIndex={kpIndex} />
    </Canvas>
  );
}
