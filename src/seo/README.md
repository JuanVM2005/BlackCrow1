# `src/seo/` — SEO registry & conventions

Este directorio define **de forma declarativa** qué rutas existen, cuáles son indexables y cómo se generan/metenadatan sus representaciones sociales (OG/Twitter). **No contiene helpers ni lógica.**  
Las utilidades puras (funciones) viven en `src/core/seo/`.

---

## Contenido de la carpeta

- `routes.registry.ts` → **Fuente de verdad** de rutas SEO: path canónico, locales soportados, tipo de OG (estática/dinámica), prioridad `sitemap`, `changefreq`, y ownership.
- `defaults.ts` → Defaults **estructurales** de SEO (base title/description placeholders, políticas por defecto).
- `README.md` → Este documento.

> **Fuera de este folder**:  
> - *Helpers/lógica* de SEO → `src/core/seo/`  
> - *Implementaciones de OG dinámico* → `src/app/**/opengraph-image.tsx`  
> - *Assets estáticos OG* → `public/og/`  
> - *PWA/App icons* → `public/favicons/` (no en `icons/`)

---

## Ownership por ruta

Cada ruta **tiene un “owner”** (feature responsable). El owner mantiene sus entradas en `routes.registry.ts`, sus OG (estáticas o dinámicas) y la calidad del metadato.

Ejemplos de ownership (ilustrativos):
- `/` → `features/landing`
- `/health`, `/api/revalidate` → `(system)` (excluidas de indexación)
- Cualquier ruta nueva → el feature que la introduce **debe** declararla en el registry

---

## Rutas excluidas de indexación

Por convención, **NO se indexan**:
- Rutas de sistema: `/health`, cualquier endpoint bajo `src/app/(system)/*`, webhooks internos, `/api/revalidate`
- Páginas de error: `/*/error`, `/*/not-found`
- Variantes internas de test o “preview-only”

> Estas exclusiones se reflejan declarativamente en `routes.registry.ts` y se respetan en `robots.ts`/`sitemap.ts`.

---

## Convenciones de assets

- **OG estáticas**: `public/og/<route>-<locale>.png`  
  Ej.: `public/og/home-es.png`, `public/og/home-en.png`
- **PWA/App icons**: `public/favicons/*`  
  Ej.: `icon-192.png`, `icon-512.png`, `maskable-192.png`, `maskable-512.png`
- **SVG genéricos**: `public/icons/*` (no mezclar con PWA)

---

## Procedimiento para **dar de alta** una ruta indexable

1) **Definir ownership**  
   - Asigna un owner (feature) responsable de la ruta.

2) **Decidir OG**  
   - **Estática**: preparar el asset en `public/og/<route>-<locale>.png` (una por locale).  
   - **Dinámica**: implementar `opengraph-image.tsx` en el segmento de `app/` correspondiente.  
   - Declara en el registry si es `static` o `dynamic`.

3) **Añadir entrada en `routes.registry.ts`**  
   Incluir (de forma declarativa):
   - `path` canónico (sin locale)
   - `locales` soportados (referenciando los de `src/i18n/locales.ts`)
   - `og`: `{ type: "static" | "dynamic", assetPattern?: string }`
   - `sitemap`: `{ priority: number, changefreq: "daily" | "weekly" | ... , include: boolean }`
   - `robots`: `{ index: boolean, follow: boolean }`
   - `owner`: cadena con la carpeta del feature (ej.: `"features/landing"`)

4) **Verificar exclusiones**  
   - Si es ruta de sistema o interna → `robots.index = false`, `sitemap.include = false`.

5) **Revisar i18n**  
   - Si la ruta es traducible, asegúrate de que los slugs correspondientes estén (si aplica) en `src/i18n/routing/`.

6) **Checklist de PR** (debe venir en la descripción del PR):
   - [ ] Owner definido  
   - [ ] OG (estática o dinámica) definida y accesible  
   - [ ] Entrada añadida/actualizada en `routes.registry.ts`  
   - [ ] `sitemap`/`robots` coherentes (incluida/excluida)  
   - [ ] Slugs i18n (si aplica) están en `src/i18n/routing/`  
   - [ ] Assets en rutas correctas (`public/og/`, `public/favicons/`)

---

## Tipos de OG (glosario)

- **Estática**: imagen pre-renderizada por idioma en `public/og/`. Simple, rápida, ideal para landings con OG fija.
- **Dinámica**: se genera en tiempo de ejecución vía `opengraph-image.tsx`. Útil si la imagen depende de datos o del locale en tiempo real.

> La elección se declara en `routes.registry.ts`. El implementation detail (cómo se genera) vive en `app/` o en assets.

---

## “Qué vive aquí” vs “Qué NO vive aquí”

**Sí vive aquí:**
- Registro declarativo de rutas (indexables o excluidas)
- Defaults estructurales (no lógicos)
- Reglas de ownership y convenciones de nombres

**NO vive aquí:**
- Código de generación de OG (`opengraph-image.tsx`)
- Helpers de SEO (van en `src/core/seo/`)
- Contenido traducido (va en `src/content/locales/**`)

---

## Notas

- Los **route groups** (`(marketing)`, `(system)`) no alteran el **path público**; en el registry siempre se lista el path visible.
- Este README es **normativo**: cualquier discrepancia entre implementación y este documento debe resolverse **actualizando primero el registry** y las convenciones aquí descritas.
