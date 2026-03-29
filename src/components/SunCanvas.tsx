"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   CORONA HALO SHADER — Rim lighting efekti
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
    float rim = 1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition)));
    rim = pow(rim, 2.2);
    gl_FragColor = vec4(uColor, rim * uOpacity);
  }
`;

/* ─────────────────────────────────────────────────────────────
   SOLAR FLARE PARTİKÜLLERİ
───────────────────────────────────────────────────────────── */
function SolarFlares({ kpIndex, radius }: { kpIndex: number; radius: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const { positions, velocities } = useMemo(() => {
    const count = 400;
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = radius * (1.0 + Math.random() * 0.05);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const speed = 0.003 + Math.random() * 0.007;
      vel[i * 3]     = pos[i * 3] * speed / r;
      vel[i * 3 + 1] = pos[i * 3 + 1] * speed / r;
      vel[i * 3 + 2] = pos[i * 3 + 2] * speed / r;
    }
    return { positions: pos, velocities: vel };
  }, [radius]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions.slice(), 3));
    return geo;
  }, [positions]);

  const flareColor = useMemo(() => {
    if (kpIndex >= 7) return new THREE.Color("#FF2D55");
    if (kpIndex >= 6) return new THREE.Color("#FF6B35");
    if (kpIndex >= 5) return new THREE.Color("#FFB347");
    return new THREE.Color("#FFE066");
  }, [kpIndex]);

  const maxDist = radius * 2.4;

  useFrame(() => {
    if (!pointsRef.current) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < arr.length / 3; i++) {
      const ix = i * 3;
      const dist = Math.sqrt(arr[ix] ** 2 + arr[ix + 1] ** 2 + arr[ix + 2] ** 2);
      if (dist > maxDist) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        arr[ix]     = radius * Math.sin(phi) * Math.cos(theta);
        arr[ix + 1] = radius * Math.sin(phi) * Math.sin(theta);
        arr[ix + 2] = radius * Math.cos(phi);
        const speed = 0.003 + Math.random() * 0.007;
        velocities[ix]     = arr[ix] * speed / radius;
        velocities[ix + 1] = arr[ix + 1] * speed / radius;
        velocities[ix + 2] = arr[ix + 2] * speed / radius;
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
        size={0.018 * radius}
        sizeAttenuation
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ─────────────────────────────────────────────────────────────
   CORONA KATMANLARI
───────────────────────────────────────────────────────────── */
function CoronaLayer({
  radius,
  scale,
  opacity,
  color,
}: {
  radius: number;
  scale: number;
  opacity: number;
  color: string;
}) {
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
      const t = clock.getElapsedTime();
      (meshRef.current.material as THREE.ShaderMaterial).uniforms.uOpacity.value =
        opacity * (0.7 + Math.sin(t * 0.7) * 0.3);
    }
  });

  return (
    <mesh ref={meshRef} scale={radius * scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        vertexShader={coronaVertexShader}
        fragmentShader={coronaFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   NASA GLB MODELİ
───────────────────────────────────────────────────────────── */
function NasaSun({ kpIndex }: { kpIndex: number }) {
  const groupRef = useRef<THREE.Group>(null!);
  const { scene } = useGLTF("/sun.glb");

  // NASA modelinin bounding box'ını ölçerek gerçek yarıçapı bul
  const { scaledScene, radius } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const rawRadius = Math.max(size.x, size.y, size.z) / 2;
    // Ekrana sığacak şekilde normalize et (hedef yarıçap ~1.1 birim)
    const targetRadius = 1.1;
    const scaleFactor = targetRadius / (rawRadius || 1);

    const cloned = scene.clone();
    cloned.scale.setScalar(scaleFactor);
    return { scaledScene: cloned, radius: targetRadius };
  }, [scene]);

  // Kp'ye göre emission rengi
  const emissiveColor = useMemo(() => {
    if (kpIndex >= 7) return new THREE.Color(0.4, 0.05, 0.0);
    if (kpIndex >= 5) return new THREE.Color(0.35, 0.12, 0.0);
    return new THREE.Color(0.3, 0.18, 0.0);
  }, [kpIndex]);

  // NASA modelinin mesh'lerine emission ekle
  useMemo(() => {
    scaledScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            const m = mat as THREE.MeshStandardMaterial;
            if (m.emissive !== undefined) {
              m.emissive = emissiveColor;
              m.emissiveIntensity = 0.6;
            }
          });
        } else {
          const m = mesh.material as THREE.MeshStandardMaterial;
          if (m.emissive !== undefined) {
            m.emissive = emissiveColor;
            m.emissiveIntensity = 0.6;
          }
        }
      }
    });
  }, [scaledScene, emissiveColor]);

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const t = clock.getElapsedTime();
      // Yavaş y-ekseni rotasyonu
      groupRef.current.rotation.y = t * 0.04;
      // Sahne hafif sallanma
      groupRef.current.rotation.x = Math.sin(t * 0.18) * 0.03;
    }
  });

  // Corona rengi Kp'ye göre
  const coronaColor = kpIndex >= 7 ? "#FF3322" : kpIndex >= 5 ? "#FF7733" : "#FFB347";

  return (
    <group ref={groupRef}>
      {/* NASA'nın güneş modeli */}
      <primitive object={scaledScene} />

      {/* Corona halo katmanları */}
      <CoronaLayer radius={radius} scale={1.12} opacity={0.65} color={coronaColor} />
      <CoronaLayer radius={radius} scale={1.32} opacity={0.32} color={coronaColor} />
      <CoronaLayer radius={radius} scale={1.60} opacity={0.14} color="#FF9944" />
      <CoronaLayer radius={radius} scale={2.10} opacity={0.06} color="#FF7700" />

      {/* Solar flare partikülleri */}
      <SolarFlares kpIndex={kpIndex} radius={radius} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   FALLBACK — GLB yüklenirken GLSL güneş göster
───────────────────────────────────────────────────────────── */
const fallbackVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fallbackFragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  void main() {
    float limb = pow(clamp(dot(vNormal, vec3(0.0, 0.0, 1.0)), 0.0, 1.0), 0.5);
    vec3 col = mix(vec3(0.8, 0.1, 0.0), vec3(1.0, 0.88, 0.3), limb);
    gl_FragColor = vec4(col * limb * 1.2, 1.0);
  }
`;
function FallbackSun() {
  const meshRef = useRef<THREE.Mesh>(null!);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  useFrame(({ clock }) => {
    uniforms.uTime.value = clock.getElapsedTime();
    if (meshRef.current) meshRef.current.rotation.y = clock.getElapsedTime() * 0.05;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.1, 64, 64]} />
      <shaderMaterial
        vertexShader={fallbackVertexShader}
        fragmentShader={fallbackFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

/* ─────────────────────────────────────────────────────────────
   KAMERA
───────────────────────────────────────────────────────────── */
function CameraSetup() {
  const { camera } = useThree();
  camera.position.set(0, 0, 3.4);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   EXPORT
───────────────────────────────────────────────────────────── */
export default function SunCanvas({ kpIndex }: { kpIndex: number }) {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      style={{ background: "transparent" }}
      dpr={[1, 2]}
    >
      <CameraSetup />
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#FFF5E0" />
      <Suspense fallback={<FallbackSun />}>
        <NasaSun kpIndex={kpIndex} />
      </Suspense>
    </Canvas>
  );
}
