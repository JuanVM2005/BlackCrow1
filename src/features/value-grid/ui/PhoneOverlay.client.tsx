// src/features/value-grid/ui/PhoneOverlay.client.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Preload, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import { usePhoneAnchors } from "./usePhoneAnchors";

type OverlayProps = {
  /** Ruta del GLB dentro de /public */
  src?: string; // default: "/models/iphone.glb"
  /** Z-index del overlay (por si necesitas ajustar encima de surfaces) */
  zIndex?: number;
  /** Si false, desactiva el overlay completo */
  enabled?: boolean;
};

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function damp(current: number, target: number, lambda: number, dt: number) {
  const t = 1 - Math.exp(-lambda * dt);
  return lerp(current, target, t);
}

function pxToWorld(
  pxX: number,
  pxY: number,
  viewport: { width: number; height: number },
  size: { width: number; height: number },
) {
  const nx = pxX / Math.max(1, size.width);
  const ny = pxY / Math.max(1, size.height);

  const worldX = (nx - 0.5) * viewport.width;
  const worldY = (0.5 - ny) * viewport.height;

  return { x: worldX, y: worldY };
}

function useScrollY() {
  const yRef = React.useRef(0);

  React.useEffect(() => {
    const update = () => {
      yRef.current = window.scrollY || window.pageYOffset || 0;
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return yRef;
}

function PhoneRig({ src }: { src: string }) {
  const reducedMotion = useReducedMotion();
  const { startEl, targetEl } = usePhoneAnchors();
  const scrollY = useScrollY();

  const group = React.useRef<THREE.Group>(null);

  const gltf = useGLTF(src) as any;

  const bbox = React.useMemo(() => {
    const box = new THREE.Box3();
    box.setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    if (size.x === 0) size.x = 1;
    if (size.y === 0) size.y = 1;
    if (size.z === 0) size.z = 1;
    return { size, box };
  }, [gltf.scene]);

  const matsRef = React.useRef<THREE.Material[]>([]);
  React.useEffect(() => {
    const mats: THREE.Material[] = [];
    gltf.scene.traverse((o: any) => {
      const m = o?.material as THREE.Material | THREE.Material[] | undefined;
      if (!m) return;

      const collect = (mat: any) => {
        if (!mat) return;
        mat.transparent = true;
        mat.depthWrite = true;
        mats.push(mat);
      };

      if (Array.isArray(m)) m.forEach(collect);
      else collect(m);
    });
    matsRef.current = mats;
  }, [gltf.scene]);

  const { viewport, size } = useThree();

  const anim = React.useRef({
    x: 0,
    y: 0,
    s: 1,
    rz: 0,
    rx: 0,
    ry: 0,
    opacity: 0,
  });

  const getDocTop = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.top + (window.scrollY || 0);
  };

  const computeTargets = React.useCallback(() => {
    const SCALE_FACTOR = 0.55;

    const startPx = {
      x: size.width * 0.72,
      y: size.height * 0.62,
    };

    let endPx = {
      x: size.width * 0.5,
      y: size.height * 0.5,
    };

    let endRect: DOMRect | null = null;

    if (targetEl) {
      endRect = targetEl.getBoundingClientRect();
      endPx = {
        x: endRect.left + endRect.width * 0.5,
        y: endRect.top + endRect.height * 0.5,
      };
    }

    const startW = pxToWorld(startPx.x, startPx.y, viewport, size);
    const endW = pxToWorld(endPx.x, endPx.y, viewport, size);

    let endScale = 1;
    if (endRect) {
      const worldW = (endRect.width / Math.max(1, size.width)) * viewport.width;
      const worldH =
        (endRect.height / Math.max(1, size.height)) * viewport.height;

      const sx = worldW / bbox.size.x;
      const sy = worldH / bbox.size.y;

      endScale = Math.min(sx, sy) * 1.5 * SCALE_FACTOR;
    } else {
      endScale = endScale * SCALE_FACTOR;
    }

    const startScale = endScale * 1.15;

    return { startW, endW, startScale, endScale };
  }, [
    bbox.size.x,
    bbox.size.y,
    size.width,
    size.height,
    targetEl,
    viewport.width,
    viewport.height,
  ]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    if (!startEl || !targetEl) {
      anim.current.opacity = damp(anim.current.opacity, 0, 12, dt);
      g.visible = anim.current.opacity > 0.01;

      const mats = matsRef.current;
      for (let i = 0; i < mats.length; i++) {
        (mats[i] as any).opacity = anim.current.opacity;
      }
      return;
    }

    const startDocY = getDocTop(startEl);
    const targetDocY = getDocTop(targetEl);

    const denom = Math.max(1, targetDocY - startDocY);
    const prog = clamp01((scrollY.current - startDocY) / denom);

    const pre = startDocY - window.innerHeight * 0.35;
    const post = targetDocY + window.innerHeight * 0.6;
    const inRange = scrollY.current >= pre && scrollY.current <= post;

    const t = reducedMotion ? (prog >= 0.75 ? 1 : 0) : prog;

    const { startW, endW, startScale, endScale } = computeTargets();

    const tx = lerp(startW.x, endW.x, t);
    const ty = lerp(startW.y, endW.y, t);
    const ts = lerp(startScale, endScale, t);

    const baseRz = lerp(-0.28, 0, t);
    const baseRx = lerp(0.18, 0.05, t);
    const baseRy = lerp(2.28, 0, t);

    anim.current.x = damp(anim.current.x, tx, 14, dt);
    anim.current.y = damp(anim.current.y, ty, 14, dt);
    anim.current.s = damp(anim.current.s, ts, 14, dt);
    anim.current.rz = damp(anim.current.rz, baseRz, 14, dt);
    anim.current.rx = damp(anim.current.rx, baseRx, 14, dt);
    anim.current.ry = damp(anim.current.ry, baseRy, 14, dt);

    const targetOpacity = inRange ? 1 : 0;
    anim.current.opacity = damp(anim.current.opacity, targetOpacity, 18, dt);

    g.visible = anim.current.opacity > 0.01;
    g.position.set(anim.current.x, anim.current.y, 0);
    g.rotation.set(anim.current.rx, anim.current.ry, anim.current.rz);
    g.scale.setScalar(anim.current.s);

    const mats = matsRef.current;
    for (let i = 0; i < mats.length; i++) {
      (mats[i] as any).opacity = anim.current.opacity;
    }
  });

  return (
    <group ref={group}>
      <primitive object={gltf.scene} />
    </group>
  );
}

export default function PhoneOverlay({
  src = "/models/iphone.glb",
  zIndex = 40,
  enabled = true,
}: OverlayProps) {
  const reducedMotion = useReducedMotion();
  const { startEl, targetEl } = usePhoneAnchors();

  const [mounted, setMounted] = React.useState(false);
  const [eventEl, setEventEl] = React.useState<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!enabled) return null;
  if (!mounted) return null;

  const dpr = reducedMotion ? ([1, 1.25] as const) : ([1, 2] as const);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex, contain: "layout paint" }}
    >
      {/* ✅ callback ref: nos da un HTMLElement real (no null) */}
      <div ref={setEventEl} className="absolute inset-0 pointer-events-none" />

      {/* ✅ Canvas SOLO cuando existe eventEl */}
      {eventEl ? (
        <Canvas
          orthographic
          dpr={dpr as any}
          eventSource={eventEl as any}
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 100], zoom: 120, near: 0.1, far: 1000 }}
        >
          <ambientLight intensity={0.9} />
          <directionalLight intensity={0.9} position={[2, 3, 5]} />

          {startEl && targetEl ? <PhoneRig src={src} /> : null}

          <Preload all />
        </Canvas>
      ) : null}
    </div>
  );
}

useGLTF.preload("/models/iphone.glb");
