# `src/features/landing/content` — Composición de la Landing (Front-only)

Orquesta **qué secciones** se renderizan y **en qué orden**. No contiene lógica ni imports a server/SEO/APIs.  
Lo consume `src/app/[locale]/(marketing)/page.tsx` (Etapa 2).

---

## Archivo clave

- **`landing.composition.ts`**  
  Exporta la composición actual de la landing (preset) y utilidades para obtener secciones activas.

**Dependencias:** no depende de otras exportaciones.  
**Relación:** mapeará cada `id` a un componente UI en `src/features/<id>/ui/`.

---

## IDs válidos (mínimo)

- `hero` → `src/features/hero/ui/`
- `benefits` → `src/features/benefits/ui/`

> Para agregar un nuevo `id`, primero crea su UI en `src/features/<id>/ui/` y luego añádelo a la composición.

---

## Campos de una sección (`SectionEntry`)

| Campo        | Tipo                                          | Ejemplo              | Notas                                     |
|--------------|-----------------------------------------------|----------------------|-------------------------------------------|
| `id`         | `'hero' \| 'benefits' \| ...`                 | `hero`               | Debe existir en `src/features/<id>/ui/`. |
| `enabled`    | `boolean`                                     | `true`               | Toggle sin borrar la entrada.             |
| `order`      | `number`                                      | `0`                  | Orden de aparición (0-based).             |
| `variant`    | `'default' \| 'withImage' \| 'compact'`       | `default`            | Variación visual.                         |
| `container`  | `'default' \| 'wide' \| 'full'`               | `wide`               | Ancho/wrapping.                           |
| `spacing`    | `'none' \| 'sm' \| 'md' \| 'lg' \| 'xl'`      | `lg`                 | Márgenes verticales estándar.             |
| `theme`      | `'default' \| 'muted' \| 'brand' \| 'invert'` | `muted`              | Fondo/tema de la sección.                 |
| `contentRef` | `string` (opcional)                           | `landing.hero`       | Clave para copy/medios vía JSON.          |
| `props`      | `Record<string, unknown>` (opcional)          | `{ align: "center"}` | Overrides de UI menores.                  |

---

## Presets sugeridos

- **minimal** (actual): `hero`, `benefits`  
- standard: `hero`, `benefits`, `social-proof`, `cta-final`  
- extended: `hero`, `features-grid`, `benefits`, `social-proof`, `faq`, `cta-final`

> Activa/desactiva cambiando `enabled` y reordena con `order`.

---

## Contenido por JSON (opcional)

Ubica el copy en `src/content/locales/<locale>/landing/`:

- `hero.json` — claves sugeridas:  
  `title`, `subtitle`, `primaryCta.label`, `primaryCta.href`, `image.src`, `image.alt`
- `benefits.json` — claves sugeridas:  
  `items[]` con `{ icon, title, description }`

**Convención de `contentRef`:** `landing.<sección>` (p. ej., `landing.hero`, `landing.benefits`).  
Asegura que las imágenes existan en `public/{images,icons,logos}`.

---

## DoD (Definition of Done)

- Reordenar/activar se logra **solo** editando `landing.composition.ts`.  
- Las secciones referenciadas existen en `src/features/<id>/ui/`.  
- (Si usas JSON) `contentRef` apunta a archivos válidos en `src/content/locales/**`.  
- Sin imports desde `server/seo/core/config/app/api/**`.

