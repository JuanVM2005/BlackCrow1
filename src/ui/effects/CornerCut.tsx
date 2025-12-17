// src/ui/effects/CornerCut.tsx
"use client";

import * as React from "react";

export type CornerAlign =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export type CornerStrategy = "absolute" | "fixed";

export interface CornerCutProps {
  /** Esquina donde se ancla el "corte". Default: "top-right". */
  align?: CornerAlign;
  /**
   * Posicionamiento:
   * - "absolute": anclado al contenedor relativo (NO sigue el scroll)
   * - "fixed": anclado al viewport (sigue el scroll)
   * Default: "absolute".
   */
  strategy?: CornerStrategy;
  /** Clases extra si necesitas ajustar layout. */
  className?: string;
}

/**
 * CornerCut — Triángulo con shader WebGL, optimizado.
 * Vars CSS soportadas:
 *   --fx-cut-size  → tamaño del bloque (default: calc(var(--header-h) * 9))
 *   --fx-cut-z     → z-index (default: 0 en absolute | calc(var(--z-header)-1) en fixed)
 *   --fx-cut-clip  → clip-path (default: polygon(12% 0, 100% 0, 100% 76%))
 *   --fx-cut-res   → factor de resolución interna [0.4–1] (default: 0.8 desktop / 0.65 mobile)
 */
export default function CornerCut({
  align = "top-right",
  strategy = "absolute",
  className,
}: CornerCutProps) {
  const holderRef = React.useRef<HTMLDivElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    let raf = 0;
    let running = false;
    const cleanups: Array<() => void> = [];

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    const isMobile =
      typeof window !== "undefined" &&
      window.matchMedia?.("(max-width: 768px)")?.matches;

    const readNumberVar = (el: HTMLElement, name: string, fallback: number) => {
      const raw = getComputedStyle(el).getPropertyValue(name).trim();
      const v = raw ? parseFloat(raw) : NaN;
      if (!isFinite(v)) return fallback;
      return Math.max(0.4, Math.min(1, v));
    };

    const setRunning = (flag: boolean) => {
      running = flag;
      if (!running && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else if (running && !raf) {
        raf = requestAnimationFrame(loop);
      }
    };

    // three setup (lazy)
    let THREE: any;
    let renderer: any;
    let scene: any;
    let camera: any;
    let material: any;
    let clock: any;

    // FPS cap agresivo para bajar carga (desktop ~30fps, mobile ~24fps)
    let last = 0;
    const frameInterval = 1000 / (isMobile ? 24 : 30);

    const loop = (t: number) => {
      if (!running) return;
      if (t - last >= frameInterval) {
        last = t;
        if (!prefersReduced) {
          material.uniforms.u_time.value += clock.getDelta();
        }
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(loop);
    };

    const run = async () => {
      THREE = await import("three");
      const {
        Scene,
        OrthographicCamera,
        PlaneGeometry,
        Mesh,
        WebGLRenderer,
        RawShaderMaterial,
        Vector2,
        Clock,
        AdditiveBlending,
      } = THREE;

      const vert = `
        precision highp float;
        attribute vec3 position;
        attribute vec2 uv;
        varying vec2 vUv;
        void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }
      `;

      const frag = `
        precision highp float;
        varying vec2 vUv;
        uniform vec2 u_resolution;
        uniform float u_time;
        uniform vec2 u_mouse;

        vec3 permute(vec3 x){ return mod(((x*34.0)+1.0)*x,289.0); }
        float snoise(vec2 v){
          const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
          vec2 i=floor(v+dot(v,C.yy));
          vec2 x0=v-i+dot(i,C.xx);
          vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
          vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1;
          i=mod(i,289.);
          vec3 p=permute(permute(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
          vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);
          m=m*m; m=m*m;
          vec3 x=2.*fract(p*C.www)-1.;
          vec3 h=abs(x)-0.5;
          vec3 ox=floor(x+0.5);
          vec3 a0=x-ox;
          m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
          vec3 g;
          g.x=a0.x*x0.x+h.x*x0.y;
          g.yz=a0.yz*x12.xz+h.yz*x12.yw;
          return 130.*dot(m,g);
        }
        float random(vec2 st){ return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123); }

        void main(){
          vec2 coord = vUv;
          float color = 0.;
          color += 1. - pow(coord.y, 0.1) * 1.2;
          color += snoise(vec2(coord.x + snoise(coord*4. - u_time)*0.1 + u_time*0.5, coord.y*20.)) * 0.03;
          color += random(coord) * random(coord*100.) * 0.5;
          color -= abs(snoise(coord*100. - u_time*1.1 + snoise(coord*100. + u_time*2.1 + u_mouse.x*0.001)*0.5) * 0.1);
          color += 0.2 - snoise(coord*1. - u_time*0.01 + snoise(coord*3. - u_time*0.1 + vec2(u_mouse.x,u_mouse.y)*0.001
                    + snoise(coord*10. + u_time*0.2 + snoise(coord*50. + u_time*0.1)*0.05
                    + snoise(coord*30. - u_time*0.1 + snoise(coord*50.)*0.5)*0.1)*0.15)*0.1)*0.9;
          vec3 col = vec3(color);
          col.r += (snoise(vec2(coord.x, coord.y*0.1 - u_time*0.1 + u_mouse.x*0.001))) * 0.35;
          col.b += abs(snoise(vec2(coord.x, coord.y*2. - u_time*0.1) + snoise(coord*2. + u_mouse.x*0.001)*0.1)) * 0.75;
          gl_FragColor = vec4(col, 1.0);
        }
      `;

      scene = new Scene();
      camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geo = new PlaneGeometry(2, 2);

      material = new RawShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          u_resolution: { value: new Vector2(1, 1) },
          u_time: { value: 0 },
          u_mouse: { value: new Vector2(0, 0) },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: AdditiveBlending,
      });

      const mesh = new Mesh(geo, material);
      scene.add(mesh);

      const canvas = canvasRef.current!;
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false, // menos coste
        powerPreference: "high-performance",
        premultipliedAlpha: true,
        preserveDrawingBuffer: false,
      });
      renderer.setClearColor(0x000000, 0);

      // DPR bajo para reducir fill-rate (forzado a ~1)
      renderer.setPixelRatio(1);

      clock = new Clock();

      const setSize = () => {
        const el = holderRef.current!;
        if (!el) return;

        // Escalado interno de resolución (CSS var con fallback por dispositivo)
        const resScale = readNumberVar(
          el,
          "--fx-cut-res",
          isMobile ? 0.65 : 0.8
        );

        const w = Math.max(1, Math.floor(el.clientWidth * resScale));
        const h = Math.max(1, Math.floor(el.clientHeight * resScale));
        renderer.setSize(w, h, false);
        material.uniforms.u_resolution.value.set(w, h);
      };
      setSize();

      if ("ResizeObserver" in window && holderRef.current) {
        const ro = new ResizeObserver(setSize);
        ro.observe(holderRef.current);
        cleanups.push(() => ro.disconnect());
      } else {
        window.addEventListener("resize", setSize);
        cleanups.push(() => window.removeEventListener("resize", setSize));
      }

      // Pointer → throttle rAF
      let pmPending = false;
      let pmX = 0,
        pmY = 0;
      const updateMouse = () => {
        pmPending = false;
        const el = holderRef.current!;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const x = Math.max(0, Math.min(rect.width, pmX - rect.left));
        const y = Math.max(0, Math.min(rect.height, pmY - rect.top));
        material.uniforms.u_mouse.value.set(x, y);
      };
      const onPointerMove = (e: PointerEvent) => {
        pmX = e.clientX;
        pmY = e.clientY;
        if (!pmPending) {
          pmPending = true;
          requestAnimationFrame(updateMouse);
        }
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      cleanups.push(() =>
        window.removeEventListener("pointermove", onPointerMove)
      );

      // Intersection + visibility → pausa fuera de viewport
      if ("IntersectionObserver" in window && holderRef.current) {
        const io = new IntersectionObserver(
          ([entry]) =>
            setRunning(entry.isIntersecting && document.visibilityState === "visible"),
          { threshold: 0.01 }
        );
        io.observe(holderRef.current);
        cleanups.push(() => io.disconnect());
      } else {
        setRunning(true);
      }
      const onVis = () =>
        setRunning(document.visibilityState === "visible");
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() =>
        document.removeEventListener("visibilitychange", onVis)
      );

      // Primer frame (si reduce motion, render estático)
      if (prefersReduced) {
        setRunning(false);
        renderer.render(scene, camera);
      } else {
        setRunning(true);
      }

      // Cleanup three
      cleanups.push(() => {
        try {
          geo.dispose();
          material.dispose?.();
          renderer.dispose();
        } catch {}
      });
    };

    run();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {}
      });
    };
  }, []);

  const isFixed = strategy === "fixed";

  const anchorStyle: React.CSSProperties = {
    position: isFixed ? "fixed" : "absolute",
    zIndex: isFixed
      ? "var(--fx-cut-z, calc(var(--z-header) - 1))"
      : "var(--fx-cut-z, 0)",
    pointerEvents: "none",
    top: align.includes("top") ? 0 : undefined,
    bottom: align.includes("bottom") ? 0 : undefined,
    right: align.includes("right") ? 0 : undefined,
    left: align.includes("left") ? 0 : undefined,
    // tamaño por defecto un poco más pequeño
    width: "var(--fx-cut-size, calc(var(--header-h) * 9))",
    height: "var(--fx-cut-size, calc(var(--header-h) * 9))",
    transform:
      align === "top-right"
        ? "none"
        : align === "top-left"
        ? "scaleX(-1)"
        : align === "bottom-right"
        ? "scaleY(-1)"
        : "scale(-1)",
    // recorte ligeramente menor (más “pequeño” visualmente)
    clipPath:
      "var(--fx-cut-clip, polygon(14% 0, 100% 0, 100% 74%))",
    WebkitClipPath:
      "var(--fx-cut-clip, polygon(14% 0, 100% 0, 100% 74%))",
    overflow: "hidden",
  };

  return (
    <div ref={holderRef} aria-hidden="true" className={className} style={anchorStyle}>
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: "100%", display: "block" }}
      />
    </div>
  );
}
