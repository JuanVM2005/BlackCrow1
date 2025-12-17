// src/features/hero/ui/Model3D.client.tsx
"use client";

import React, {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload, useGLTF } from "@react-three/drei";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

/* ===== Props ===== */
type Props = {
  src: string;
  poster?: string;
  alt: string;
  className?: string;
  /** Contenedor externo cuyos eventos (mouse/touch) usará el Canvas */
  eventSource?: React.RefObject<HTMLElement>;
  /** Si es false, apagamos FX pesados (nebulosa, humo) cuando el hero ya no está visible */
  effectsActive?: boolean;
};

type ViewportMode = "desktop" | "tablet" | "mobile";

/* ===== Orientación base ===== */
const ROT_X = 0;
const ROT_Y = Math.PI / 4 - 0.5;

/* ===== Presets (ajusta X/Y/scale/cámara por viewport) ===== */
const VIEW = {
  desktop: {
    modelPos: [1.2, -8.3, 0] as [number, number, number],
    modelScale: 1.52,
    camera: {
      pos: [-5.2, -5.0, 6.9] as [number, number, number],
      fov: 20,
    },
  },
  tablet: {
    modelPos: [0.65, -1.35, 0] as [number, number, number],
    modelScale: 1.4,
    camera: {
      pos: [-6.2, 1.8, 6.1] as [number, number, number],
      fov: 21,
    },
  },
  mobile: {
    // centrado en el canvas
    modelPos: [0, -1.0, 0] as [number, number, number],
    modelScale: 1.05,
    camera: {
      pos: [-5.0, 1.9, 6.8] as [number, number, number],
      fov: 22,
    },
  },
} as const;

/* ===== Helper: detectar soporte WebGL (con cache simple) ===== */
let cachedWebGLSupport: boolean | null = null;

function canUseWebGL(): boolean {
  if (cachedWebGLSupport !== null) return cachedWebGLSupport;
  if (typeof window === "undefined" || typeof document === "undefined") {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      (canvas.getContext("webgl2") as
        | WebGLRenderingContext
        | WebGL2RenderingContext
        | null);
    cachedWebGLSupport = !!gl;
  } catch {
    cachedWebGLSupport = false;
  }

  return cachedWebGLSupport;
}

/* ===== Helpers ===== */
function useViewportMode(): ViewportMode {
  const [mode, setMode] = useState<ViewportMode>("desktop");
  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= 600) setMode("mobile");
      else if (window.innerWidth <= 1024) setMode("tablet");
      else setMode("desktop");
    };
    update();
    window.addEventListener("resize", update, { passive: true });
    return () => window.removeEventListener("resize", update);
  }, []);
  return mode;
}

function isMesh(o: THREE.Object3D): o is THREE.Mesh {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (o as any).isMesh === true;
}

/** Detecta si el fragment shader soporta highp y devuelve la misma precisión para VERTEX/FRAGMENT */
function pickGLSLPrecision(gl: THREE.WebGLRenderer): "highp" | "mediump" {
  try {
    const ctx = gl.getContext() as
      | WebGLRenderingContext
      | WebGL2RenderingContext;
    const f = ctx?.getShaderPrecisionFormat?.(
      ctx.FRAGMENT_SHADER,
      ctx.HIGH_FLOAT,
    );
    if (f && f.precision > 0) return "highp";
  } catch {
    /* noop */
  }
  return "mediump";
}

/** Construye un grupo “ligero” para una capa, reutilizando geometría del modelo base */
function buildLayerGroup(
  baseScene: THREE.Object3D,
  material: THREE.ShaderMaterial,
): THREE.Group {
  const group = new THREE.Group();

  baseScene.traverse((obj: THREE.Object3D) => {
    if (!isMesh(obj)) return;

    const sourceMesh = obj as THREE.Mesh;

    const mesh = new THREE.Mesh(sourceMesh.geometry, material);
    mesh.position.copy(sourceMesh.position);
    mesh.quaternion.copy(sourceMesh.quaternion);
    mesh.scale.copy(sourceMesh.scale);

    mesh.castShadow = false;
    mesh.receiveShadow = false;
    mesh.frustumCulled = false;

    group.add(mesh);
  });

  return group;
}

/* ===== Rig: rotación Y por mouse (sutil y limitada) ===== */
type RigRef = React.MutableRefObject<{ rotY: number }>;

function RigMouseYaw({
  rig,
  viewport,
  maxYaw = 0.16,
  lerp = 0.08,
}: {
  rig: RigRef;
  viewport: ViewportMode;
  maxYaw?: number;
  lerp?: number;
}) {
  useFrame(({ mouse }) => {
    // En mobile no respondemos al mouse (no tiene sentido)
    if (viewport === "mobile") return;
    const mx = THREE.MathUtils.clamp(mouse.x || 0, -1, 1);
    const target = mx * maxYaw;
    rig.current.rotY = THREE.MathUtils.lerp(rig.current.rotY, target, lerp);
  });
  return null;
}

/* ===== Modelo principal (usa escena base compartida) ===== */
function CrowModel({
  baseScene,
  rig,
  viewport,
}: {
  baseScene: THREE.Object3D;
  rig: RigRef;
  viewport: ViewportMode;
}) {
  const group = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera as THREE.PerspectiveCamera);

  useEffect(() => {
    if (!group.current) return;
    const cfg = VIEW[viewport];

    group.current.position.set(...cfg.modelPos);
    group.current.scale.setScalar(cfg.modelScale);

    camera.position.set(...cfg.camera.pos);
    camera.fov = cfg.camera.fov;
    camera.updateProjectionMatrix();

    baseScene.traverse((obj: THREE.Object3D) => {
      if (isMesh(obj)) {
        obj.castShadow = true;
        obj.receiveShadow = true;
        obj.frustumCulled = false;

        // Ajuste suave del material del cuervo para que no se “apague”
        const mat = obj.material as THREE.Material | THREE.Material[];
        const tweak = (m: THREE.Material) => {
          const anyMat = m as any;
          if (anyMat && anyMat.color) {
            anyMat.color.lerp(new THREE.Color("#f5f5f7"), 0.2);
            if (typeof anyMat.roughness === "number") {
              anyMat.roughness = Math.min(1, anyMat.roughness + 0.05);
            }
            if (typeof anyMat.metalness === "number") {
              anyMat.metalness = anyMat.metalness * 0.9;
            }
          }
        };

        if (Array.isArray(mat)) {
          mat.forEach((m) => tweak(m));
        } else if (mat) {
          tweak(mat);
        }
      }
    });
  }, [baseScene, camera, viewport]);

  useFrame(() => {
    if (!group.current) return;
    group.current.rotation.set(ROT_X, ROT_Y + rig.current.rotY, 0);
  });

  return (
    <group ref={group}>
      <primitive object={baseScene} />
    </group>
  );
}

/* ===== SurfaceAura (capa extra: halo) ===== */
function SurfaceAura({
  baseScene,
  rig,
  viewport,
  scaleMul = 1.018,
  alpha = 0.45,
}: {
  baseScene: THREE.Object3D;
  rig: RigRef;
  viewport: ViewportMode;
  scaleMul?: number;
  alpha?: number;
}) {
  const reduce = usePrefersReducedMotion();
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const material = useMemo(() => {
    const prec = pickGLSLPrecision(gl);
    const header = `precision ${prec} float;\nprecision ${prec} int;\n`;

    const uniforms = {
      uTime: { value: 0 },
      uAlpha: { value: alpha },
      // Base oscura pero con tinte violeta
      uBase: { value: new THREE.Color("#070514") },
      uAccent: { value: new THREE.Color("#32324a") },
      uMist: { value: new THREE.Color("#d9ddff") },
      uShell: { value: 0.02 },
      uNoiseScale: { value: 1.9 },
      uFlowSpeed: { value: 0.55 },
      uFresPow: { value: 0.3 },
      uFresBoost: { value: 0.4 },
      uShimmerAmp: { value: 0.045 },
    };

    const vert = /* glsl */ `
      ${header}
      varying vec3 vWPos;
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vT;
      varying vec3 vB;
      uniform float uShell;

      void main() {
        vec3 nW = normalize(mat3(modelMatrix) * normal);
        vec3 up = vec3(0.0, 1.0, 0.0);
        vec3 t = normalize(cross(up, nW));
        if (length(t) < 0.01) {
          t = normalize(cross(vec3(1.0, 0.0, 0.0), nW));
        }
        vec3 b = normalize(cross(nW, t));

        vec3 pos = position + (normalize(normalMatrix * normal) * uShell);
        vec4 world = modelMatrix * vec4(pos, 1.0);

        vWPos = world.xyz;
        vN = nW;
        vV = normalize(cameraPosition - world.xyz);
        vT = t;
        vB = b;

        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `;

    const frag = /* glsl */ `
      ${header}
      varying vec3 vWPos;
      varying vec3 vN;
      varying vec3 vV;
      varying vec3 vT;
      varying vec3 vB;

      uniform float uTime;
      uniform float uAlpha;
      uniform float uNoiseScale;
      uniform float uFlowSpeed;
      uniform float uFresPow;
      uniform float uFresBoost;
      uniform float uShimmerAmp;
      uniform vec3  uBase;
      uniform vec3  uAccent;
      uniform vec3  uMist;

      float hash(vec3 p){
        p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y * p.z));
      }

      float noise(vec3 p){
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);

        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);

        return mix(nxy0, nxy1, f.z);
      }

      float fbm(vec3 p){
        float a = 0.6;
        float s = 0.0;
        for(int i = 0; i < 3; i++){
          s += a * noise(p);
          p = p * 2.05 + vec3(23.1, 51.7, 79.3);
          a *= 0.55;
        }
        return s;
      }

      void main() {
        vec2 uv = vec2(
          dot(vWPos, normalize(vT)),
          dot(vWPos, normalize(vB))
        ) * uNoiseScale;

        float swirlU = fbm(vec3(uv * 0.6, uTime * 0.3));
        float swirlV = fbm(vec3(uv * 0.6 + 7.3, uTime * 0.34));
        uv += vec2(swirlU, swirlV) * 0.32;

        float veil = fbm(vec3(uv * 0.9, uTime * 0.2));
        veil = smoothstep(0.28, 0.9, veil);

        float fres = pow(
          1.0 - max(dot(normalize(vN), normalize(vV)), 0.0),
          uFresPow
        );
        fres = clamp(fres * (1.0 + uFresBoost), 0.0, 1.0);

        float shimmer = 0.5 + 0.5 * sin(
          uTime * 1.15 + fbm(vec3(uv * 0.9, uTime * 0.36)) * 3.14159
        );
        shimmer *= uShimmerAmp;

        vec3 col = uBase * (0.55 + 0.4 * fres)
                 + uAccent * (0.6 * veil)
                 + uMist * (0.34 * veil + 0.28 * shimmer);

        col = mix(col, vec3(1.0), 0.16);

        float a = (0.45 * veil + 0.35 * fres) * uAlpha;
        if(a < 0.035) discard;

        gl_FragColor = vec4(col, a);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      dithering: true,
      precision: prec,
      name: "SurfaceAuraMat",
    });
  }, [alpha, gl]);

  const auraGroup = useMemo(
    () => buildLayerGroup(baseScene, material),
    [baseScene, material],
  );

  useEffect(() => {
    const cfg = VIEW[viewport];
    if (!group.current) return;
    group.current.position.set(...cfg.modelPos);
    group.current.scale.setScalar(cfg.modelScale * scaleMul);

    (camera as THREE.PerspectiveCamera).position.set(...cfg.camera.pos);
    (camera as THREE.PerspectiveCamera).fov = cfg.camera.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, viewport, scaleMul]);

  useFrame((_, dt) => {
    const u = material.uniforms as Record<string, { value: number }>;
    if (!reduce && u?.uTime) u.uTime.value += dt;
    if (group.current) {
      group.current.rotation.set(ROT_X, ROT_Y + rig.current.rotY, 0);
    }
  });

  return (
    <group ref={group} renderOrder={1}>
      <primitive object={auraGroup} />
    </group>
  );
}

/* ===== BackTrail (humo detrás) ===== */
function BackTrail({
  baseScene,
  rig,
  viewport,
  scaleMul = 1.04,
  alpha = 0.5,
}: {
  baseScene: THREE.Object3D;
  rig: RigRef;
  viewport: ViewportMode;
  scaleMul?: number;
  alpha?: number;
}) {
  const reduce = usePrefersReducedMotion();
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const material = useMemo(() => {
    const prec = pickGLSLPrecision(gl);
    const header = `precision ${prec} float;\nprecision ${prec} int;\n`;

    const uniforms = {
      uTime: { value: 0 },
      uAlpha: { value: alpha },
      // Colores profundos y saturados
      uTailA: { value: new THREE.Color("#7c3aed") }, // violet
      uTailB: { value: new THREE.Color("#ec4899") }, // pink
      uTailMist: { value: new THREE.Color("#e9d5ff") },
      uBack: { value: 3.6 },
      uTrailLen: { value: 0.7 },
      uCurlAmp: { value: 0.55 },
      uFlowScale: { value: 0.72 },
      uFlowSpeed: { value: 0.18 },
      uShell: { value: 0.25 },
    };

    const vert = /* glsl */ `
      ${header}
      varying vec3 vWPos;
      varying float vIntensity;

      uniform float uTime;
      uniform float uBack;
      uniform float uTrailLen;
      uniform float uCurlAmp;
      uniform float uFlowScale;
      uniform float uFlowSpeed;
      uniform float uShell;

      float hash(vec3 p){
        p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y * p.z));
      }

      float noise(vec3 p){
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);

        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);

        return mix(nxy0, nxy1, f.z);
      }

      float fbm(vec3 p){
        float a = 0.55;
        float s = 0.0;
        for(int i = 0; i < 3; i++){
          s += a * noise(p);
          p = p * 2.03 + vec3(37.1, 91.7, 53.9);
          a *= 0.56;
        }
        return s;
      }

      vec3 curl(vec3 p){
        float e = 0.25;
        float n1 = fbm(p + vec3(31.4, 17.0, 11.7));
        float n2 = fbm(p + vec3(-27.1, 9.7, -48.3));
        float n3 = fbm(p + vec3(12.9, -41.3, 5.2));

        float n1y = fbm(p + vec3(31.4, 17.0, 11.7) + vec3(0.0, e, 0.0)) - n1;
        float n1z = fbm(p + vec3(31.4, 17.0, 11.7) + vec3(0.0, 0.0, e)) - n1;
        float n2x = fbm(p + vec3(-27.1, 9.7, -48.3) + vec3(e, 0.0, 0.0)) - n2;
        float n2z = fbm(p + vec3(-27.1, 9.7, -48.3) + vec3(0.0, 0.0, e)) - n2;
        float n3x = fbm(p + vec3(12.9, -41.3, 5.2) + vec3(e, 0.0, 0.0)) - n3;
        float n3y = fbm(p + vec3(12.9, -41.3, 5.2) + vec3(0.0, e, 0.0)) - n3;

        vec3 c = vec3(n3y - n2z, n2x - n1y, n1z - n3x);
        return normalize(c + 1e-5);
      }

      void main(){
        vec3 nW = normalize(mat3(modelMatrix) * normal);
        vec3 pos = position + normalize(normalMatrix * normal) * uShell;
        vec4 world = modelMatrix * vec4(pos, 1.0);
        vec3 p = world.xyz;
        vec3 viewDir = normalize(cameraPosition - p);

        world.xyz -= viewDir * uBack;

        vec3 f = curl(p * uFlowScale + vec3(0.0, uFlowSpeed * uTime, 0.0));
        vec3 trail = (-viewDir) * uTrailLen;
        world.xyz += f * (uCurlAmp * 0.28)
          + trail * (0.25 + 0.75 * fbm(p * 0.5 + uTime * 0.2));

        float fres = pow(
          1.0 - max(dot(nW, viewDir), 0.0),
          1.2
        );
        float top = smoothstep(
          -0.2,
          0.5,
          (modelMatrix * vec4(position, 1.0)).y
        );
        vIntensity = clamp(0.25 + 0.75 * fres, 0.0, 1.0) * (0.6 + 0.4 * top);
        vWPos = world.xyz;

        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `;

    const frag = /* glsl */ `
      ${header}
      varying vec3 vWPos;
      varying float vIntensity;

      uniform float uTime;
      uniform float uAlpha;
      uniform vec3 uTailA;
      uniform vec3 uTailB;
      uniform vec3 uTailMist;

      float hash(vec3 p){
        p = fract(p * 0.3183099 + vec3(0.11, 0.23, 0.37));
        p *= 17.0;
        return fract(p.x * p.y * p.z * (p.x + p.y * p.z));
      }

      float noise(vec3 p){
        vec3 i = floor(p);
        vec3 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);

        float n000 = hash(i + vec3(0.0, 0.0, 0.0));
        float n100 = hash(i + vec3(1.0, 0.0, 0.0));
        float n010 = hash(i + vec3(0.0, 1.0, 0.0));
        float n110 = hash(i + vec3(1.0, 1.0, 0.0));
        float n001 = hash(i + vec3(0.0, 0.0, 1.0));
        float n101 = hash(i + vec3(1.0, 0.0, 1.0));
        float n011 = hash(i + vec3(0.0, 1.0, 1.0));
        float n111 = hash(i + vec3(1.0, 1.0, 1.0));

        float nx00 = mix(n000, n100, f.x);
        float nx10 = mix(n010, n110, f.x);
        float nx01 = mix(n001, n101, f.x);
        float nx11 = mix(n011, n111, f.x);

        float nxy0 = mix(nx00, nx10, f.y);
        float nxy1 = mix(nx01, nx11, f.y);

        return mix(nxy0, nxy1, f.z);
      }

      float fbm(vec3 p){
        float a = 0.55;
        float s = 0.0;
        for(int i = 0; i < 3; i++){
          s += a * noise(p);
          p = p * 2.02 + vec3(23.1, 51.7, 79.3);
          a *= 0.56;
        }
        return s;
      }

      void main(){
        float m = fbm(vWPos * 0.9 + vec3(0.0, uTime * 0.22, 0.0));
        float veil = smoothstep(0.23, 0.78, m);

        vec3 col = mix(uTailA, uTailB, smoothstep(0.15, 1.1, m));
        col = mix(col, uTailMist, 0.22);

        float a = vIntensity * veil * uAlpha;
        if(a < 0.02) discard;

        gl_FragColor = vec4(col, a);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      dithering: true,
      precision: prec,
      name: "BackTrailMat",
    });
  }, [alpha, gl]);

  const trailGroup = useMemo(
    () => buildLayerGroup(baseScene, material),
    [baseScene, material],
  );

  useEffect(() => {
    const cfg = VIEW[viewport];
    if (!group.current) return;
    group.current.position.set(...cfg.modelPos);
    group.current.scale.setScalar(cfg.modelScale * scaleMul);

    (camera as THREE.PerspectiveCamera).position.set(...cfg.camera.pos);
    (camera as THREE.PerspectiveCamera).fov = cfg.camera.fov;
    (camera as THREE.PerspectiveCamera).updateProjectionMatrix();
  }, [camera, viewport, scaleMul]);

  useFrame((_, dt) => {
    const u = material.uniforms as Record<string, { value: number }>;
    if (!reduce && u?.uTime) u.uTime.value += dt;
    if (group.current) {
      group.current.rotation.set(ROT_X, ROT_Y + rig.current.rotY, 0);
    }
  });

  return (
    <group ref={group} renderOrder={0}>
      <primitive object={trailGroup} />
    </group>
  );
}

/* ===== NebulaBackplate (fondo, menos geométrica) ===== */
function NebulaBackplate({
  viewport,
  size = 5.0,
  scaleMul = 0.43,
  backDist = 0.3,
  intensity = 0.78,
  alpha = 1.2,
  tintA = "#f472b6",
  tintB = "#7c3aed",
  tintC = "#a855f7",
  flow = 0.28,
  offsetModel = [0, 0, 0] as [number, number, number],
  offsetBillboard = [0.0, 0.63] as [number, number],
}: {
  viewport: ViewportMode;
  size?: number;
  scaleMul?: number;
  backDist?: number;
  intensity?: number;
  alpha?: number;
  tintA?: string;
  tintB?: string;
  tintC?: string;
  flow?: number;
  offsetModel?: [number, number, number];
  offsetBillboard?: [number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();

  const mat = useMemo(() => {
    const prec = pickGLSLPrecision(gl);
    const header = `precision ${prec} float;\nprecision ${prec} int;\n`;

    const uniforms = {
      uTime: { value: 0 },
      uAlpha: { value: alpha },
      uIntensity: { value: intensity },
      uTintA: { value: new THREE.Color(tintA) },
      uTintB: { value: new THREE.Color(tintB) },
      uTintC: { value: new THREE.Color(tintC) },
      uFlow: { value: flow },
    };

    const vert = /* glsl */ `
      ${header}
      varying vec2 vUv;
      void main(){
        vUv = uv * 2.0 - 1.0;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `;

    const frag = /* glsl */ `
      ${header}
      varying vec2 vUv;
      uniform float uTime;
      uniform float uAlpha;
      uniform float uIntensity;
      uniform float uFlow;
      uniform vec3  uTintA;
      uniform vec3  uTintB;
      uniform vec3  uTintC;

      float h(vec2 p){
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float n2(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = h(i);
        float b = h(i + vec2(1.0, 0.0));
        float c = h(i + vec2(0.0, 1.0));
        float d = h(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm(vec2 p){
        float s = 0.0;
        float a = 0.8;
        for(int i = 0; i < 3; i++){
          s += a * n2(p);
          p = p * 2.02 + 13.37;
          a *= 0.58;
        }
        return s;
      }

      vec3 palette(float t){
        vec3 m1 = mix(uTintA, uTintB, smoothstep(0.3, 0.85, t));
        return mix(m1, uTintC, 0.45 + 0.2 * sin(t * 3.14159));
      }

      float superellipse(vec2 p, float k){
        p = abs(p);
        return pow(pow(p.x, k) + pow(p.y, k), 1.0 / k);
      }

      void main(){
        vec2 uv = vUv;

        vec2 flowVec = 0.08 * vec2(
          sin((uv.y + 0.1) * 1.9 + uTime * 0.42),
          cos((uv.x - 0.2) * 1.6 - uTime * 0.5)
        );

        float t = fbm((uv + flowVec) * 2.0 + uTime * uFlow);
        vec3 col = palette(t) * (1.2 + 2.0 * t) * uIntensity;

        float s = superellipse(
          uv + 0.045 * vec2(fbm(uv * 3.0), fbm(uv * 2.6 + 7.7)),
          1.7
        );
        float radial = length(uv);
        float radialMask = smoothstep(1.1, 0.6, radial + 0.25 * fbm(uv * 3.5 + uTime * 0.1));
        float shapeMask = smoothstep(1.2, 0.7, s + 0.2 * fbm(uv * 3.8 + uTime * 0.08));

        float mask = mix(shapeMask, radialMask, 0.45);
        mask *= smoothstep(0.05, 0.85, t);

        float a = clamp(mask, 0.0, 1.0) * uAlpha;
        if(a < 0.03) discard;

        gl_FragColor = vec4(col * mask, a);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms,
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthWrite: false,
      depthTest: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      dithering: true,
      precision: prec,
      name: "NebulaBackplateMat",
    });
  }, [alpha, intensity, tintA, tintB, tintC, flow, gl]);

  useEffect(() => {
    if (!group.current) return;
    const cfg = VIEW[viewport];

    const adapt = Math.min(cfg.modelScale, 1.0);
    const s = size * adapt * scaleMul;

    const base = new THREE.Vector3(...cfg.modelPos).add(
      new THREE.Vector3(...offsetModel),
    );
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(
      (camera as THREE.PerspectiveCamera).quaternion,
    );
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(
      (camera as THREE.PerspectiveCamera).quaternion,
    );
    const view = new THREE.Vector3()
      .subVectors(base, (camera as THREE.PerspectiveCamera).position)
      .normalize();

    const pos = base
      .clone()
      .add(view.multiplyScalar(-backDist))
      .add(right.multiplyScalar(offsetBillboard[0] * s))
      .add(up.multiplyScalar(offsetBillboard[1] * s));

    group.current.position.copy(pos);
    group.current.quaternion.copy(
      (camera as THREE.PerspectiveCamera).quaternion,
    );
    group.current.scale.set(s, s, 1);
  }, [camera, viewport, size, scaleMul, backDist, offsetModel, offsetBillboard]);

  useFrame((_, dt) => {
    (mat.uniforms as any).uTime.value += dt;
    if (group.current) {
      group.current.quaternion.copy(
        (camera as THREE.PerspectiveCamera).quaternion,
      );
    }
  });

  return (
    <group ref={group} renderOrder={-1}>
      <mesh>
        <planeGeometry args={[1, 1, 1, 1]} />
        <primitive object={mat} attach="material" />
      </mesh>
    </group>
  );
}

/* ===== Wrapper de capas: carga el GLTF una sola vez ===== */
function CrowLayers({
  src,
  rig,
  quality,
  effectsActive,
  viewport,
}: {
  src: string;
  rig: RigRef;
  quality: "low" | "high";
  effectsActive: boolean;
  viewport: ViewportMode;
}) {
  const gltf = useGLTF(src);
  const baseScene = gltf.scene as THREE.Object3D;

  useEffect(() => {
    useGLTF.preload(src);
  }, [src]);

  const isMobile = viewport === "mobile";
  const fxEnabled = quality === "high" && effectsActive;

  return (
    <>
      {/* Nebula solo en alta calidad y no-mobile */}
      {fxEnabled && !isMobile && <NebulaBackplate viewport={viewport} />}

      {/* Trail solo si hay FX */}
      {fxEnabled && (
        <BackTrail
          baseScene={baseScene}
          rig={rig}
          viewport={viewport}
          scaleMul={0.75}
          alpha={0.12}
        />
      )}

      {/* Modelo principal */}
      <CrowModel baseScene={baseScene} rig={rig} viewport={viewport} />

      {/* Aura siempre, pero más suave si no hay efectos activos */}
      <SurfaceAura
        baseScene={baseScene}
        rig={rig}
        viewport={viewport}
        scaleMul={1.0}
        alpha={effectsActive ? 0.5 : 0.25}
      />
    </>
  );
}

/* ===== Escena principal con fallback WebGL ===== */
export default function Model3D({
  src,
  poster,
  alt,
  className,
  eventSource,
  effectsActive = true,
}: Props) {
  const viewport = useViewportMode();
  const isMobile = viewport === "mobile";

  // Mobile siempre low, desktop/tablet high
  const quality: "low" | "high" = isMobile ? "low" : "high";

  const initialSupportsWebGL = useMemo(() => canUseWebGL(), []);
  const [hasWebGLError, setHasWebGLError] = useState(false);

  const shouldRenderCanvas = initialSupportsWebGL && !hasWebGLError;

  // DPR ajustado: más bajo en mobile para rendimiento
  const dpr = useMemo<[number, number]>(() => {
    if (isMobile) return [1, 1.25];
    if (quality === "low") return [1.0, 1.35];
    return [1.05, 1.6];
  }, [isMobile, quality]);

  const rig = useRef<{ rotY: number }>({ rotY: 0 });

  return (
    <div
      className={["relative block w-full h-full bg-transparent", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={alt}
    >
      {/* Fallback estático cuando no hay WebGL o se pierde el contexto */}
      {poster && !shouldRenderCanvas && (
        <img
          src={poster}
          alt={alt}
          className="block w-full h-full object-cover"
          loading="lazy"
        />
      )}

      {shouldRenderCanvas && (
        <Canvas
          camera={{ position: [-6.6, 2.2, 6.9], fov: 28 }}
          shadows={!isMobile && quality === "high"}
          dpr={dpr}
          eventSource={eventSource?.current ?? undefined}
          eventPrefix="client"
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          onCreated={({ gl, scene }) => {
            gl.setClearColor("#000000", 0);
            gl.outputColorSpace = THREE.SRGBColorSpace;
            gl.shadowMap.enabled = !isMobile && quality === "high";
            gl.shadowMap.type = THREE.PCFSoftShadowMap;

            // Fog con tinte violeta oscuro
            scene.fog = new THREE.FogExp2(0x050214, 0.024);

            const canvas = gl.domElement as HTMLCanvasElement;
            const handleContextError = () => {
              setHasWebGLError(true);
            };

            canvas.addEventListener("webglcontextlost", handleContextError);
            canvas.addEventListener(
              "webglcontextcreationerror",
              handleContextError,
            );
          }}
        >
          {/* Rotación sutil por mouse (solo eje Y, no en mobile) */}
          <RigMouseYaw rig={rig} viewport={viewport} maxYaw={0.16} lerp={0.08} />

          <Suspense fallback={null}>
            {/* Luces base */}
            <ambientLight intensity={0.25} />
            <directionalLight
              position={[3, 5, 2]}
              intensity={0.95}
              castShadow={quality === "high" && !isMobile}
            />

            {/* Luz de acento solo cuando los FX están activos */}
            {effectsActive && (
              <pointLight position={[0, 2, 7]} intensity={0.42} color="#fb3797" />
            )}

            {/* Capas del modelo */}
            <CrowLayers
              src={src}
              rig={rig}
              quality={quality}
              effectsActive={effectsActive}
              viewport={viewport}
            />

            {/* Environment solo en alta calidad */}
            {quality === "high" && <Environment preset="dawn" />}

            <Preload all />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
