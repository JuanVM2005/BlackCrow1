# Contribuir al Proyecto

Gracias por tu interés en contribuir a este proyecto.  
Este documento describe las reglas básicas y el flujo recomendado para mantener una colaboración clara y profesional.

---

## 🧱 Requisitos previos

Asegúrate de tener instalado:

- Node.js 20+
- PNPM o NPM
- VS Code (recomendado)
- Extensiones sugeridas:
  - ESLint
  - Prettier (opcional)
  - Tailwind CSS IntelliSense

---

## 🔧 Scripts útiles

- `npm run dev` → entorno de desarrollo  
- `npm run build` → build de producción  
- `npm run lint` → chequeo de estilo y errores  
- `npm run typecheck` → verificar tipos con TypeScript  

---

## 🌿 Flujo de trabajo propuesto

1. Crea una rama desde `main`:
   ```bash
   git checkout -b feature/mi-cambio

2. Realiza tus cambios.

3. Asegúrate de que el build funciona:
npm run build

4. Crea un Pull Request hacia main.

5. El PR debe incluir:

Descripción clara

Capturas si hay cambios visuales

Checklist de impacto

🧹 Estilo de código

Usa los alias @/* definidos en tsconfig.json.

No uses colores hardcodeados: deben venir de globals.css.

La UI usa primitivas de @/ui (Button, Container, Typography, Section).

Mantén los componentes puros, sin lógica innecesaria dentro del JSX.

🛡 Seguridad

Nunca subas claves reales o archivos .env.

Si trabajas con APIs externas, colócalas siempre en variables de entorno.