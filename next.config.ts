// next.config.ts
import type { NextConfig } from "next";

const acceptLangStartsEn = "^(?:en|en-[A-Za-z]{2})(?:,|;|$)"; // solo si el PRIMER idioma es en o en-XX

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",

  images: {
    // Agrega orígenes remotos si los usas:
    // remotePatterns: [{ protocol: "https", hostname: "cdn.tu-dominio.com" }],
    formats: ["image/avif", "image/webp"],
  },

  experimental: {
    optimizePackageImports: [
      "react",
      "react-dom",
      "framer-motion",
      "three",
      "@react-three/fiber",
    ],
  },

  transpilePackages: ["three-stdlib"],

  // Opcionalmente ayuda a CDN/proxy a cachear por idioma/usuario.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Vary", value: "Accept-Language, Cookie" }],
      },
    ];
  },

  /**
   * Red de seguridad (además del middleware):
   * - Si NO hay prefijo es|en y la preferencia primaria es inglés -> /en
   * - Si NO hay prefijo es|en y no es inglés -> /es
   * - Para "/" aplica lo mismo.
   * Modo estricto: NO conserva el path.
   */
  async redirects() {
    return [
      // ===== Raíz =====
      // / con cookie NEXT_LOCALE=en -> /en
      {
        source: "/",
        has: [{ type: "cookie", key: "NEXT_LOCALE", value: "en" }],
        destination: "/en",
        permanent: false,
      },
      // / con Accept-Language que EMPIEZA por en o en-XX -> /en
      {
        source: "/",
        has: [{ type: "header", key: "accept-language", value: acceptLangStartsEn }],
        destination: "/en",
        permanent: false,
      },
      // / fallback -> /es
      { source: "/", destination: "/es", permanent: false },

      // ===== Cualquier ruta SIN prefijo es|en (ni estáticos/APIs) =====
      // cookie NEXT_LOCALE=en -> /en
      {
        source:
          "/((?!es|en|api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
        has: [{ type: "cookie", key: "NEXT_LOCALE", value: "en" }],
        destination: "/en",
        permanent: false,
      },
      // Accept-Language PRIMARIO en -> /en
      {
        source:
          "/((?!es|en|api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
        has: [{ type: "header", key: "accept-language", value: acceptLangStartsEn }],
        destination: "/en",
        permanent: false,
      },
      // fallback -> /es
      {
        source:
          "/((?!es|en|api|_next/static|_next/image|_vercel|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
        destination: "/es",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
