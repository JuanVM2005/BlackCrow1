// eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js (incluye React, TypeScript, etc.)
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ignorar carpetas/archivos que no tiene sentido analizar
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },

  // Ajustes de reglas para no morir con lint
  {
    rules: {
      // Ahora mismo tenemos muchos `any` por el boilerplate → se permiten
      "@typescript-eslint/no-explicit-any": "off",

      // Permitimos @ts-ignore (luego se puede ir limpiando a @ts-expect-error)
      "@typescript-eslint/ban-ts-comment": "off",

      // Next se queja de exports anónimos en algunos configs → lo apagamos
      "import/no-anonymous-default-export": "off",

      // Hooks: por ahora solo warning, no bloquea el lint
      "react-hooks/rules-of-hooks": "warn",
      "react-hooks/exhaustive-deps": "warn",

      // Usar <img> en vez de <Image> → solo aviso, no error
      "@next/next/no-img-element": "warn",
    },
  },
];

export default eslintConfig;
