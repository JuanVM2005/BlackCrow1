// src/features/value-grid/ui/PhoneOverlay.client.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
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

/**
 * ✅ ScrollY only while enabled (evita listeners permanentes)
 * + opcional: dispara invalidate en scroll (clave para frameloop="demand")
 */
function useScrollY(enabled: boolean, onScroll?: () => void) {
  const yRef = React.useRef(0);

  React.useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    const update = () => {
      yRef.current = window.scrollY || window.pageYOffset || 0;
      onScroll?.();
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(raf);
    };
  }, [enabled, onScroll]);

  return yRef;
}

type Targets = {
  startW: { x: number; y: number };
  endW: { x: number; y: number };
  startScale: number;
  endScale: number;
  startDocY: number;
  targetDocY: number;
  pre: number;
  post: number;
};

function PhoneRig({
  src,
  active,
  onRangeChange,
}: {
  src: string;
  active: boolean;
  onRangeChange?: (inRange: boolean) => void;
}) {
  const reducedMotion = useReducedMotion();
  const { startEl, targetEl } = usePhoneAnchors();

  const group = React.useRef<THREE.Group>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        // ✅ transparente, pero más “barato”
        mat.transparent = true;
        mat.depthWrite = false;
        mat.depthTest = true;
        mats.push(mat);
      };

      if (Array.isArray(m)) m.forEach(collect);
      else collect(m);
    });
    matsRef.current = mats;
  }, [gltf.scene]);

  const { viewport, size, invalidate } = useThree();

  // ✅ invalidar cuando hay scroll (porque usaremos frameloop="demand")
  const scrollY = useScrollY(active, () => invalidate());

  const anim = React.useRef({
    x: 0,
    y: 0,
    s: 1,
    rz: 0,
    rx: 0,
    ry: 0,
    opacity: 0,
  });

  const targetsRef = React.useRef<Targets | null>(null);
  const lastInRange = React.useRef<boolean>(false);

  const recomputeTargets = React.useCallback(() => {
    if (!startEl || !targetEl) {
      targetsRef.current = null;
      return;
    }

    const SCALE_FACTOR = 0.55;

    const getDocTop = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + (window.scrollY || 0);
    };

    const startDocY = getDocTop(startEl);
    const targetDocY = getDocTop(targetEl);

    // Posición de salida (screen space)
    const startPx = {
      x: size.width * 0.72,
      y: size.height * 0.62,
    };

    // Destino = rect del slot
    const endRect = targetEl.getBoundingClientRect();
    const endPx = {
      x: endRect.left + endRect.width * 0.5,
      y: endRect.top + endRect.height * 0.5,
    };

    const startW = pxToWorld(startPx.x, startPx.y, viewport, size);
    const endW = pxToWorld(endPx.x, endPx.y, viewport, size);

    const worldW = (endRect.width / Math.max(1, size.width)) * viewport.width;
    const worldH = (endRect.height / Math.max(1, size.height)) * viewport.height;

    const sx = worldW / bbox.size.x;
    const sy = worldH / bbox.size.y;

    const endScale = Math.min(sx, sy) * 1.5 * SCALE_FACTOR;
    const startScale = endScale * 1.15;

    const pre = startDocY - window.innerHeight * 0.35;
    const post = targetDocY + window.innerHeight * 0.6;

    targetsRef.current = {
      startW,
      endW,
      startScale,
      endScale,
      startDocY,
      targetDocY,
      pre,
      post,
    };
  }, [
    startEl,
    targetEl,
    size.width,
    size.height,
    viewport.width,
    viewport.height,
    bbox.size.x,
    bbox.size.y,
    viewport,
    size,
  ]);

  React.useEffect(() => {
    if (!active) return;

    let raf = 0;
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        recomputeTargets();
        invalidate(); // ✅ importante para demand
      });
    };

    schedule();
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });

    return () => {
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      cancelAnimationFrame(raf);
    };
  }, [active, recomputeTargets, invalidate]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    const mats = matsRef.current;

    // Si no estamos activos, desvanecer y salir rápido
    if (!active) {
      anim.current.opacity = damp(anim.current.opacity, 0, 14, dt);
      g.visible = anim.current.opacity > 0.01;
      for (let i = 0; i < mats.length; i++) (mats[i] as any).opacity = anim.current.opacity;

      // ✅ en demand, seguir pidiendo frames hasta apagar del todo
      if (anim.current.opacity > 0.001) invalidate();
      return;
    }

    const targets = targetsRef.current;

    if (!startEl || !targetEl || !targets) {
      anim.current.opacity = damp(anim.current.opacity, 0, 12, dt);
      g.visible = anim.current.opacity > 0.01;
      for (let i = 0; i < mats.length; i++) (mats[i] as any).opacity = anim.current.opacity;
      if (anim.current.opacity > 0.001) invalidate();
      return;
    }

    const denom = Math.max(1, targets.targetDocY - targets.startDocY);
    const prog = clamp01((scrollY.current - targets.startDocY) / denom);

    const inRange = scrollY.current >= targets.pre && scrollY.current <= targets.post;

    if (inRange !== lastInRange.current) {
      lastInRange.current = inRange;
      onRangeChange?.(inRange);
    }

    const t = reducedMotion ? (prog >= 0.75 ? 1 : 0) : prog;

    const tx = lerp(targets.startW.x, targets.endW.x, t);
    const ty = lerp(targets.startW.y, targets.endW.y, t);
    const ts = lerp(targets.startScale, targets.endScale, t);

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

    for (let i = 0; i < mats.length; i++) (mats[i] as any).opacity = anim.current.opacity;

    // ✅ demand: pedir frames mientras esté animando (posición/opacity)
    if (!reducedMotion) {
      const moving =
        Math.abs(targetOpacity - anim.current.opacity) > 0.002 ||
        Math.abs(tx - anim.current.x) > 0.002 ||
        Math.abs(ty - anim.current.y) > 0.002 ||
        Math.abs(ts - anim.current.s) > 0.002;

      if (moving) invalidate();
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

  // ✅ Gate: Canvas solo cuando estamos en rango
  const [inRange, setInRange] = React.useState(false);
  const [mountCanvas, setMountCanvas] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const anchorsReady = !!startEl && !!targetEl;
  const shouldBeActive = enabled && mounted && anchorsReady && inRange;

  React.useEffect(() => {
    if (shouldBeActive) {
      setMountCanvas(true);
      return;
    }
    const t = window.setTimeout(() => setMountCanvas(false), 180);
    return () => window.clearTimeout(t);
  }, [shouldBeActive]);

  if (!enabled) return null;
  if (!mounted) return null;

  // ✅ DPR aún más conservador (overlay fijo = caro)
  const dpr = reducedMotion ? ([0.65, 0.9] as const) : ([0.6, 1.0] as const);

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex, contain: "layout paint" }}
    >
      <div ref={setEventEl} className="absolute inset-0 pointer-events-none" />

      {eventEl && mountCanvas ? (
        <Canvas
          orthographic
          dpr={dpr as any}
          eventSource={eventEl as any}
          // ✅ clave: no 60fps fijo
          frameloop="demand"
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
          gl={{
            alpha: true,
            antialias: false,
            powerPreference: "high-performance",
          }}
          camera={{ position: [0, 0, 100], zoom: 120, near: 0.1, far: 1000 }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.outputColorSpace = THREE.SRGBColorSpace;
          }}
        >
          {/* ✅ luces más baratas */}
          <ambientLight intensity={0.75} />
          <directionalLight intensity={0.65} position={[2, 3, 5]} />

          {anchorsReady ? (
            <PhoneRig src={src} active={mountCanvas} onRangeChange={setInRange} />
          ) : null}
        </Canvas>
      ) : (
        <RangeWatcher
          enabled={enabled && mounted && anchorsReady}
          startEl={startEl}
          targetEl={targetEl}
          onRangeChange={setInRange}
        />
      )}
    </div>
  );
}

/**
 * ✅ Watcher ultra-ligero (sin Canvas) para decidir cuándo montar el PhoneOverlay.
 */
function RangeWatcher({
  enabled,
  startEl,
  targetEl,
  onRangeChange,
}: {
  enabled: boolean;
  startEl: HTMLElement | null;
  targetEl: HTMLElement | null;
  onRangeChange: (inRange: boolean) => void;
}) {
  React.useEffect(() => {
    if (!enabled || !startEl || !targetEl) {
      onRangeChange(false);
      return;
    }

    let raf = 0;

    const getDocTop = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return r.top + (window.scrollY || 0);
    };

    const compute = () => {
      const startDocY = getDocTop(startEl);
      const targetDocY = getDocTop(targetEl);

      const pre = startDocY - window.innerHeight * 0.35;
      const post = targetDocY + window.innerHeight * 0.6;

      const y = window.scrollY || window.pageYOffset || 0;
      onRangeChange(y >= pre && y <= post);
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(compute);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [enabled, startEl, targetEl, onRangeChange]);

  return null;
}

useGLTF.preload("/models/iphone.glb");
