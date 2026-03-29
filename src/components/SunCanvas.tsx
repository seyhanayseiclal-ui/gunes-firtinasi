"use client";

import { useMemo, Suspense, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

/* ─────────────────────────────────────────────────────────────
   NASA GLB MODELİ — kendi ekseni etrafında döner, sürüklenebilir
───────────────────────────────────────────────────────────── */
function RotatingSun({ kpIndex }: { kpIndex: number }) {
  const { scene } = useGLTF("/sun.glb");
  const groupRef = useRef<THREE.Group>(null!);

  // Sürükleme durumu için ref (pointer arasında state kaybolmasın)
  const dragState = useRef({
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
  });

  // NASA modelinin ölçeğini yeniden hesapla
  const { scaledScene } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const rawRadius = Math.max(size.x, size.y, size.z) / 2;
    const targetRadius = 8.8;
    const scaleFactor = targetRadius / (rawRadius || 1);

    const cloned = scene.clone();
    cloned.scale.setScalar(scaleFactor);
    return { scaledScene: cloned };
  }, [scene]);

  // Kp'ye göre agresif renk değişimi
  // Sakin (0-2): açık sarı-beyaz → Orta (3-4): turuncu → G1-G2 (5-6): koyu turuncu
  // G3 (7): kırmızı-turuncu → G4-G5 (8+): derin kırmızı/mor-kırmızı
  const { emissiveColor, emissiveIntensity } = useMemo(() => {
    if (kpIndex >= 9) {
      // G5 Ekstrem — mor-kırmızı, neredeyse yanıyor
      return {
        emissiveColor: new THREE.Color().setHSL(0.0, 1.0, 0.18),  // tam kırmızı, çok koyu
        emissiveIntensity: 5.0,
      };
    }
    if (kpIndex >= 8) {
      // G4 — derin kırmızı
      return {
        emissiveColor: new THREE.Color().setHSL(0.02, 1.0, 0.20),
        emissiveIntensity: 4.0,
      };
    }
    if (kpIndex >= 7) {
      // G3 — parlak kırmızı-turuncu
      return {
        emissiveColor: new THREE.Color().setHSL(0.04, 1.0, 0.22),
        emissiveIntensity: 3.0,
      };
    }
    if (kpIndex >= 6) {
      // G2 — yakıcı turuncu
      return {
        emissiveColor: new THREE.Color().setHSL(0.07, 1.0, 0.25),
        emissiveIntensity: 2.2,
      };
    }
    if (kpIndex >= 5) {
      // G1 — koyu altın-turuncu
      return {
        emissiveColor: new THREE.Color().setHSL(0.09, 1.0, 0.28),
        emissiveIntensity: 1.6,
      };
    }
    if (kpIndex >= 3) {
      // Hafif aktivite — sıcak sarı
      return {
        emissiveColor: new THREE.Color().setHSL(0.12, 0.95, 0.32),
        emissiveIntensity: 1.0,
      };
    }
    // Sakin güneş — sarı-beyaz fotosfer
    return {
      emissiveColor: new THREE.Color().setHSL(0.17, 0.85, 0.40),
      emissiveIntensity: 0.4,
    };
  }, [kpIndex]);

  useMemo(() => {
    scaledScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const applyEmission = (mat: THREE.MeshStandardMaterial) => {
          if (mat.emissive !== undefined) {
            mat.emissive = emissiveColor;
            mat.emissiveIntensity = emissiveIntensity;
          }
        };
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => applyEmission(m as THREE.MeshStandardMaterial));
        } else {
          applyEmission(mesh.material as THREE.MeshStandardMaterial);
        }
      }
    });
  }, [scaledScene, emissiveColor, emissiveIntensity]);

  // Her frame'de döndür ve inertia uygula
  useFrame((_, delta) => {
    if (!groupRef.current) return;

    const ds = dragState.current;

    if (!ds.isDragging) {
      // Sabit otomatik dönüş (y ekseni)
      groupRef.current.rotation.y += delta * 0.08;

      // İnertia: sürükleme bırakıldıktan sonra yavaş dur
      ds.velocityX *= 0.92;
      ds.velocityY *= 0.92;
      groupRef.current.rotation.y += ds.velocityX;
      groupRef.current.rotation.x += ds.velocityY;
    }
  });

  const { gl } = useThree();

  // Pointer / touch olaylarını canvas üzerinden dinle
  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      dragState.current.isDragging = true;
      dragState.current.lastX = e.clientX;
      dragState.current.lastY = e.clientY;
      dragState.current.velocityX = 0;
      dragState.current.velocityY = 0;
      gl.domElement.setPointerCapture(e.pointerId);
    },
    [gl]
  );

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragState.current.isDragging) return;
    const dx = e.clientX - dragState.current.lastX;
    const dy = e.clientY - dragState.current.lastY;

    // Konuma göre grup'u döndür
    if (groupRef.current) {
      groupRef.current.rotation.y += dx * 0.005;
      groupRef.current.rotation.x += dy * 0.005;
    }

    // İnertia için hız kaydet
    dragState.current.velocityX = dx * 0.005;
    dragState.current.velocityY = dy * 0.005;
    dragState.current.lastX = e.clientX;
    dragState.current.lastY = e.clientY;
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      dragState.current.isDragging = false;
      gl.domElement.releasePointerCapture(e.pointerId);
    },
    [gl]
  );

  // Three.js canvas'ına event listener ekle / temizle
  useMemo(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.style.cursor = "grab";
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
    };
  }, [gl, onPointerDown, onPointerMove, onPointerUp]);

  return (
    <group ref={groupRef}>
      <primitive object={scaledScene} />
    </group>
  );
}

/* ─────────────────────────────────────────────────────────────
   KAMERA
───────────────────────────────────────────────────────────── */
function CameraSetup() {
  const { camera } = useThree();
  camera.position.set(0, 0, 16);
  return null;
}

/* ─────────────────────────────────────────────────────────────
   Kp'ye göre sahne ışık rengi
───────────────────────────────────────────────────────────── */
function SceneLights({ kpIndex }: { kpIndex: number }) {
  const pointColor = useMemo(() => {
    if (kpIndex >= 8) return "#FF1100";   // kırmızı
    if (kpIndex >= 7) return "#FF3800";   // kırmızı-turuncu
    if (kpIndex >= 6) return "#FF6000";   // yakıcı turuncu
    if (kpIndex >= 5) return "#FF8C00";   // koyu turuncu
    if (kpIndex >= 3) return "#FFB300";   // altın sarısı
    return "#FFF5C0";                     // sıcak beyaz
  }, [kpIndex]);

  const pointIntensity = useMemo(() => {
    if (kpIndex >= 8) return 3.5;
    if (kpIndex >= 7) return 2.8;
    if (kpIndex >= 5) return 2.0;
    if (kpIndex >= 3) return 1.4;
    return 0.9;
  }, [kpIndex]);

  return (
    <>
      <ambientLight intensity={kpIndex >= 7 ? 0.05 : 0.15} />
      <pointLight position={[10, 10, 10]} intensity={pointIntensity} color={pointColor} />
      <pointLight position={[-8, -6, 8]} intensity={pointIntensity * 0.4} color={pointColor} />
    </>
  );
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
      <SceneLights kpIndex={kpIndex} />

      <Suspense fallback={null}>
        <RotatingSun kpIndex={kpIndex} />
      </Suspense>
    </Canvas>
  );
}
