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

  // Kp'ye göre emission rengi — fiziksel güneş renk sıcaklığına göre ayarlandı
  // Sakin güneş: ~5500K fotosfer (sıcak sarı-beyaz)
  // Orta aktivite: artan manyetik enerji → koyu turuncu
  // Şiddetli fırtına: CME / koronal materyalin kırmızımsi parlaması
  const { emissiveColor, emissiveIntensity } = useMemo(() => {
    if (kpIndex >= 8) {
      // G4-G5: Son derece şiddetli fırtına — kırmızı-turuncu koronal parıltı
      return {
        emissiveColor: new THREE.Color().setHSL(0.045, 1.0, 0.38), // derin turuncu-kırmızı
        emissiveIntensity: 1.8,
      };
    }
    if (kpIndex >= 7) {
      // G3: Güçlü fırtına — sıcak turuncu
      return {
        emissiveColor: new THREE.Color().setHSL(0.065, 1.0, 0.42),
        emissiveIntensity: 1.4,
      };
    }
    if (kpIndex >= 5) {
      // G1-G2: Orta fırtına — altın-turuncu
      return {
        emissiveColor: new THREE.Color().setHSL(0.09, 0.95, 0.48),
        emissiveIntensity: 1.0,
      };
    }
    if (kpIndex >= 3) {
      // Hafif aktivite — sıcak sarı
      return {
        emissiveColor: new THREE.Color().setHSL(0.12, 0.90, 0.52),
        emissiveIntensity: 0.75,
      };
    }
    // Sakin güneş — fotosfer sarı-beyazı (~5500K)
    return {
      emissiveColor: new THREE.Color().setHSL(0.14, 0.80, 0.60),
      emissiveIntensity: 0.55,
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
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#FFF5E0" />

      <Suspense fallback={null}>
        <RotatingSun kpIndex={kpIndex} />
      </Suspense>
    </Canvas>
  );
}
