// src/features/interactive-3d/ui/ShaderCanvas.client.tsx
"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

/** Lee números desde tokens CSS. */
function readCssVarNumber(name: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Detecta “mobile/touch” por capacidades (sin breakpoints hardcodeados). */
function useCoarsePointer(): boolean {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(
      "(hover: none) and (pointer: coarse), (any-hover: none) and (any-pointer: coarse)"
    );

    const update = () => setCoarse(!!mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Safari legacy
    // eslint-disable-next-line deprecation/deprecation
    mq.addListener(update);
    // eslint-disable-next-line deprecation/deprecation
    return () => mq.removeListener(update);
  }, []);

  return coarse;
}

export type ShaderCanvasProps = {
  /** Fragment shader GLSL (si no lo pasas, usa la BURBUJA por defecto de abajo). */
  fragSource?: string;
  /** Vertex shader opcional (por defecto passthrough). */
  vertexSource?: string;
  /** Control DPR por tokens: --fx-dpr-{low,medium,high}. */
  qualityToken?: "low" | "medium" | "high";
  /** A11y label del efecto. */
  ariaLabel?: string;
  /** Clase para posicionamiento (layout externo controla superficies). */
  className?: string;
  /** Pausa manual del loop (se combina con active). */
  paused?: boolean;
  /** Control desde fuera: inView → true/false. */
  active?: boolean;
};

const DEFAULT_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

/** ✅ Shader “burbuja” por defecto (con boost de interacción SOLO en coarse pointer). */
const FRAGMENT_BURBUJA = /* glsl */ `
uniform float iTime;
uniform vec2 iResolution;
uniform vec2 iMouse;

// ✅ nuevos uniforms (no rompen si no se usan en otros shaders)
uniform float uInteract;   // 0 = normal, 1 = mobile/touch (coarse)
uniform vec2  uMouseSmooth; // mouse suavizado en pixeles

varying vec2 vUv;

#define MAX_MARCHING_STEPS 255
#define MIN_DIST 0.0
#define MAX_DIST 100.0
#define EPSILON 0.001

// === PALETA CYBER FIRE ===
vec3 cyberPalette(float t, float rim, float glow, float x, float time, float spectral) {
  vec3 c1 = vec3(0.0, 0.85, 1.0), c2 = vec3(0.43, 0.97, 0.96), c3 = vec3(1.0, 0.43, 0.77), c4 = vec3(0.47, 0.45, 0.96);
  float s = 0.16 * sin(7.0*t + 2.0*x + time*0.7 + spectral*4.0);
  t = clamp(t + s, 0.0, 1.0);
  vec3 base = t < 0.36 ? mix(c1, c2, t/0.36) :
              t < 0.68 ? mix(c2, c3, (t-0.36)/0.32) :
              mix(c3, c4, (t-0.68)/0.32);
  vec3 rimColor = mix(vec3(0.19,1.0,0.05), c4, 0.5);
  base = mix(base, rimColor, pow(rim, 2.0)*0.63 + spectral*0.25);
  vec3 neon = mix(vec3(1.8,0.95,1.0), c3, 0.13+0.17*sin(time + x*5.0 + spectral*6.0));
  base = mix(base, neon, (glow + spectral)*1.18);
  float osc = 0.13 * sin(time*2.2 + x*3.0 + t*7.0 + spectral*9.0);
  base = base + osc + spectral * 0.09;
  return clamp(base, 0.0, 1.0);
}

// 📦 SDF Base: Esfera
float sphereSDF(vec3 p) { return length(p) - 1.0; }

// 🧭 Mouse normalizado (usa el suavizado para evitar saltos en touch)
vec2 mouseNorm() {
  vec2 m = uMouseSmooth; // px
  vec2 n = vec2(
    (m.x / iResolution.x) * 2.0 - 1.0,
    1.5 - (m.y / iResolution.y) * 1.8
  );
  n.x *= iResolution.x / iResolution.y;
  return n;
}

// 🎯 Deformación con cursor (mobile: más interacción + más “desplazamiento”)
float cursorDeform(vec3 p) {
  vec2 mouseN = mouseNorm();

  // ✅ Mobile boost: aumenta radio, fuerza y velocidad (uInteract = 1 en coarse pointer)
  float boost = mix(1.0, 1.8, uInteract);

  float dist = length(p.xy - mouseN.xy);
  float radius = 0.5 * boost;
  float waveStrength = 0.01 * boost;
  float waveSpeed = 0.5 * mix(1.0, 1.35, uInteract);

  float influence = smoothstep(radius, 0.0, dist);
  float wave = sin(iTime * waveSpeed + dist * 30.0);

  return wave * waveStrength * influence;
}

// 🎨 Escena Base + Deformación + Desplazamiento (solo en mobile/touch)
float sceneSDF(vec3 p) {
  float time = iTime * 0.5;
  float y = p.y;

  // ✅ “desplazamiento” adicional: la burbuja “sigue” más al dedo en mobile
  vec2 mouseN = mouseNorm();
  float follow = mix(0.0, 0.22, uInteract);
  p.x += mouseN.x * follow;
  p.z += mouseN.y * follow;

  float angle = 0.0;
  angle += sin(y + time);
  angle += sin(y * 1.5 + time * 0.5) * 1.25;
  angle += sin(y * 2.3 + time * 1.7) * 1.563;
  angle += sin(y * 3.1 + time * 3.2) * 1.953;
  angle += sin(y * 0.1 + time * 0.2) * 2.441;
  angle += sin(y * 1.1 + time * 1.2) * 3.052;
  angle = angle * 3.14159 + 3.14159;

  vec3 offset = vec3(sin(angle), 0.0, cos(angle)) * 0.05;

  float deformation = cursorDeform(p);
  return sphereSDF(p + offset) + deformation;
}

// Raymarch básico
float shortestDistanceToSurface(vec3 eye, vec3 dir, float start, float end) {
  float depth = start;
  for (int i = 0; i < MAX_MARCHING_STEPS; i++) {
    float dist = sceneSDF(eye + depth * dir);
    if (dist < EPSILON) return depth;
    depth += dist;
    if (depth >= end) return end;
  }
  return end;
}

vec3 rayDirection(float fov, vec2 size, vec2 fragCoord) {
  vec2 xy = fragCoord - size * 0.5;
  float z = size.y / tan(radians(fov) / 2.0);
  return normalize(vec3(xy, -z));
}

vec3 estimateNormal(vec3 p) {
  return normalize(vec3(
    sceneSDF(p + vec3(EPSILON, 0.0, 0.0)) - sceneSDF(p - vec3(EPSILON, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, EPSILON, 0.0)) - sceneSDF(p - vec3(0.0, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, 0.0, EPSILON)) - sceneSDF(p - vec3(0.0, 0.0, 0.0))
  ));
}

// Iluminación phong
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye, vec3 lightPos, vec3 lightIntensity) {
  vec3 N = estimateNormal(p);
  vec3 L = normalize(lightPos - p);
  vec3 V = normalize(eye - p);
  vec3 R = reflect(-L, N);
  float dotLN = clamp(dot(L, N), 0.0, 1.0);
  float dotRV = clamp(dot(R, V), 0.0, 1.0);
  return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
  vec3 color = k_a;
  vec3 light1Pos = vec3(4.0 * sin(iTime), 2.0, 4.0 * cos(iTime));
  vec3 light1Intensity = vec3(1.9, 0.7, 5.5);
  vec3 light2Pos = vec3(2.0 * sin(0.37 * iTime), 2.0 * cos(0.37 * iTime), 3.0);
  vec3 light2Intensity = vec3(1.2, 0.4, 2.0);
  color += phongContribForLight(k_d, k_s, alpha, p, eye, light1Pos, light1Intensity);
  color += phongContribForLight(k_d, k_s, alpha, p, eye, light2Pos, light2Intensity);
  return color;
}

mat4 customViewMatrix(vec3 eye, vec3 center, vec3 up) {
  vec3 f = normalize(center - eye);
  vec3 s = normalize(cross(f, up));
  vec3 u = cross(s, f);
  return mat4(vec4(s, 0.0), vec4(u, 0.0), vec4(-f, 0.0), vec4(0.0, 0.0, 0.0, 1.0));
}

void main() {
  vec2 fragCoord = vUv * iResolution.xy;
  vec3 viewDir = rayDirection(45.0, iResolution.xy, fragCoord);

  vec3 eye = vec3(0.0, 4.0, 5.0);
  mat4 viewToWorld = customViewMatrix(eye, vec3(0.0), vec3(0.0, 1.0, 0.0));
  vec3 worldDir = (viewToWorld * vec4(viewDir, 0.0)).xyz;

  float dist = shortestDistanceToSurface(eye, worldDir, MIN_DIST, MAX_DIST);

  if (dist > MAX_DIST - EPSILON) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec3 p = eye + dist * worldDir;
  vec3 N = estimateNormal(p);
  vec3 V = normalize(eye - p);

  float rim = 1.0 - abs(dot(N, V));
  rim = smoothstep(0.5, 1.0, rim);
  float glow = pow(1.0 - dot(N, V), 8.0);
  float spectral = 0.5 * sin(dot(p,N) * 10.0 + iTime * 1.0);
  float blend = clamp(0.44 + 0.5 * N.y + 0.27 * sin(iTime + N.x*4.0), 0.0, 1.0);

  vec3 cyberColor = cyberPalette(blend, rim, glow, N.x, iTime, spectral);
  vec3 phong = phongIllumination(vec3(0.0), vec3(0.0, 0.0, 0.05), vec3(0.0, 1.0, 2.5), 900.0, p, eye);

  vec3 color = mix(phong, cyberColor, 0.5);
  color += glow * cyberColor * 5.0;

  gl_FragColor = vec4(color, 1.0);
}
`;

function hasWebGLSupport(): boolean {
  if (typeof document === "undefined") return false;
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl") || c.getContext("webgl2"));
}

/** Quad pantalla completa con material de shader. */
function FullscreenQuad({
  vertexShader,
  fragmentShader,
  reducedMotion,
  paused,
  mobileBoost,
}: {
  vertexShader: string;
  fragmentShader: string;
  reducedMotion: boolean;
  paused: boolean;
  mobileBoost: boolean;
}) {
  const startTimeRef = useRef<number>(performance.now());

  // target/smooth para un touch “suave” sin saltos
  const mouseTargetRef = useRef(new THREE.Vector2(0, 0));
  const mouseSmoothRef = useRef(new THREE.Vector2(0, 0));

  const uniforms = useMemo(
    () => ({
      iTime: new THREE.Uniform(0),
      iResolution: new THREE.Uniform(new THREE.Vector2(1, 1)),
      iMouse: new THREE.Uniform(new THREE.Vector2(0, 0)),

      // ✅ nuevos
      uInteract: new THREE.Uniform(0),
      uMouseSmooth: new THREE.Uniform(new THREE.Vector2(0, 0)),
    }),
    []
  );

  const { size, gl, pointer } = useThree();

  // Actualiza resolución cuando cambie tamaño o DPR
  useEffect(() => {
    const dpr = gl.getPixelRatio();
    const w = Math.max(1, Math.round(size.width * dpr));
    const h = Math.max(1, Math.round(size.height * dpr));
    uniforms.iResolution.value.set(w, h);
  }, [size.width, size.height, gl, uniforms]);

  // Setea modo interacción (coarse pointer = “mobile”)
  useEffect(() => {
    uniforms.uInteract.value = mobileBoost ? 1 : 0;
  }, [mobileBoost, uniforms]);

  // Reinicia el tiempo al volver a pestaña visible
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        startTimeRef.current = performance.now();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useFrame(() => {
    if (reducedMotion || paused) return;

    const now = performance.now();
    uniforms.iTime.value = (now - startTimeRef.current) / 1000;

    // Pointer en píxeles (R3F da coords normalizadas [-1,1])
    const dpr = gl.getPixelRatio();
    const px = (pointer.x * 0.5 + 0.5) * size.width * dpr;
    const py = (0.5 - pointer.y * 0.5) * size.height * dpr;

    if (Number.isFinite(px) && Number.isFinite(py)) {
      mouseTargetRef.current.set(px, py);
    } else {
      mouseTargetRef.current.set(0, 0);
    }

    // ✅ Smoothing (mobile: un poco más “responsive”)
    const lerp = mobileBoost ? 0.28 : 0.18;
    mouseSmoothRef.current.lerp(mouseTargetRef.current, lerp);

    // Mantén iMouse por compatibilidad, y usa uMouseSmooth para el shader mejorado
    uniforms.iMouse.value.copy(mouseSmoothRef.current);
    uniforms.uMouseSmooth.value.copy(mouseSmoothRef.current);
  });

  return (
    <mesh scale={[1.5, 1.5, 1]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/**
 * Canvas WebGL para renderizar el shader como fondo interactivo.
 * - Sin colores ni tamaños hardcodeados en TSX (DPR via tokens).
 * - Respeta prefers-reduced-motion.
 * - Fallback limpio si no hay WebGL.
 * - Respeta `active` (para apagarlo al salir de viewport).
 * - ✅ Mobile/touch: aumenta interacción y “desplazamiento” (sin afectar desktop).
 */
function ShaderCanvasBase({
  fragSource,
  vertexSource = DEFAULT_VERTEX,
  qualityToken = "high",
  ariaLabel,
  className,
  paused,
  active = true,
}: ShaderCanvasProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [supported, setSupported] = useState<boolean>(true);
  const mobileBoost = useCoarsePointer();

  useEffect(() => {
    setSupported(hasWebGLSupport());
  }, []);

  // DPR desde tokens (fallbacks seguros)
  const dpr =
    qualityToken === "low"
      ? readCssVarNumber("--fx-dpr-low", 0.75)
      : qualityToken === "medium"
      ? readCssVarNumber("--fx-dpr-medium", 1)
      : readCssVarNumber(
          "--fx-dpr-high",
          typeof window !== "undefined"
            ? Math.min(window.devicePixelRatio || 1, 1.75)
            : 1
        );

  const isPaused = !active || paused === true;

  if (!supported) {
    return (
      <div
        className={className}
        aria-label={ariaLabel}
        role="img"
        aria-hidden={ariaLabel ? "false" : "true"}
      />
    );
  }

  return (
    <div className={className} aria-label={ariaLabel} role="img">
      <Canvas
        dpr={dpr}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={reducedMotion || isPaused ? "demand" : "always"}
        camera={{ position: [0, 0, 1], near: 0.1, far: 10 }}
      >
        <FullscreenQuad
          vertexShader={vertexSource}
          fragmentShader={fragSource ?? FRAGMENT_BURBUJA}
          reducedMotion={reducedMotion}
          paused={isPaused}
          mobileBoost={mobileBoost}
        />
      </Canvas>
    </div>
  );
}

export default memo(ShaderCanvasBase);

/*
Depende de:
- "three" y "@react-three/fiber"
- Hook "@/hooks/usePrefersReducedMotion"

Notas:
- El “mobile boost” NO usa breakpoints; usa capacidades (hover/pointer).
- Si pasas un `fragSource` externo que no declare uInteract/uMouseSmooth,
  no se rompe (los uniforms extra simplemente no se usan).
*/
