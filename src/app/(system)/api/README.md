# `(system)/api` — Endpoints de **infraestructura** (no de producto)

Este directorio agrupa **únicamente** endpoints de **infraestructura** del proyecto. Al vivir bajo un **Route Group** `(system)`, la **URL pública no cambia**: los paréntesis son invisibles para el path.  
Ejemplo: `src/app/(system)/api/revalidate/route.ts` → **`/api/revalidate`**.

---

## Propósito

- **Soporte operativo** de la plataforma (mantenimiento, flujos internos, automatizaciones).
- **No** contiene lógica de negocio ni APIs consumidas por clientes/usuarios finales.
- Facilita la separación visual y de ownership respecto a `src/app/api/*` (APIs de **producto**).

---

## ¿Qué entra aquí?

- **Revalidate** / invalidación de cachés.
- **Webhooks internos** (propios de la plataforma o del proveedor, pero **no** expuestos al cliente final).
- **Tareas de mantenimiento** (por ejemplo, endpoints para warm-up, housekeeping).
- **Integraciones internas** (ping/ack entre servicios internos).
- **Cron triggers** si se invocan desde el exterior pero no forman parte del dominio de negocio.

> *Regla de oro:* si romperlo **no impacta directamente** al usuario final, es buen candidato a `(system)/api`.

---

## ¿Qué *no* va aquí?

- Endpoints que sirven a la **UI** o a integraciones **de producto** (contact forms, pricing, search, etc.).  
  Esos van en `src/app/api/*`.
- Lógica de negocio, transformaciones de dominio o validaciones funcionales.
- Archivos de configuración global del SEO, UI o i18n.

---

## Convenciones de rutas y nombres

- Carpeta por endpoint infra, en **lowercase-kebab**:  
  - `revalidate/`, `webhooks/stripe/`, `webhooks/resend/`, `cron/daily/`
- Evita verbos genéricos (`utils`, `misc`). Sé **descriptivo** y **atómico**.
- Agrupa por **familia** cuando aplique:  
  - `webhooks/<proveedor>/`  
  - `cron/<frecuencia>/`

> Ejemplos visibles (solo estructura):
>
> ```
> src/app/(system)/api/revalidate/route.ts     → /api/revalidate
> src/app/(system)/api/webhooks/stripe/        → /api/webhooks/stripe
> src/app/(system)/api/cron/daily/             → /api/cron/daily
> ```

---

## Límites y responsabilidades

- **Solo infraestructura**: no exponer datos de usuario ni lógica de negocio.
- **Propietario**: equipo de plataforma/infra; coordinación con producto solo si un cambio afecta rutas o contratos.
- **Seguridad** (a nivel estructural):
  - Debe existir un plan de **protección** (auth mecánica, tokens, IP allowlist, etc.).  
    *(La implementación vive fuera de este README; aquí solo se documenta la exigencia).*
  - Evitar logs con datos sensibles (PII/secretos).  
- **Observabilidad** (estructural):
  - Cada endpoint debe estar **inventariado** (nombre y propósito).  
  - Debe reportar **estado** esperado (éxito/fallo) para monitoreo (definido en la capa correspondiente).

---

## Relación con otras carpetas

- `src/app/api/*` → APIs de **producto**. Mantenerlas fuera de `(system)`.
- `src/app/(system)/health/*` → chequeos de vida/estado (**no** es API de negocio; carpeta hermana).
- `src/server/adapters/*` → integraciones/IO reales.  
- `src/core/*` → utilidades puras y políticas (sin IO).  
  > Los endpoints aquí **pueden** apoyarse en `core/` y `server/`, pero no deben introducir acoplamientos hacia UI/Features.

---

## Checklists de incorporación

### Añadir un nuevo endpoint de infraestructura
1. Crear carpeta en `src/app/(system)/api/<nombre>/`.
2. Elegir un nombre **descriptivo** y **atómico** (ver convenciones).
3. Documentar en este README (o en un `README.md` local) **propósito** y **riesgos**.
4. Definir (a nivel estructural) **quién lo mantiene** y **qué monitoreo** requiere.
5. Confirmar que la **URL pública** sea la esperada (los paréntesis no cambian el path).

### Reubicar un endpoint existente
1. Validar que es realmente **infra** (no de producto).  
2. Mover a `src/app/(system)/api/...` manteniendo la misma ruta pública.  
3. Actualizar referencias/documentación.
4. Confirmar que `src/app/api/*` queda libre de endpoints infra.

---

## Preguntas frecuentes

- **¿Cambian las URLs al mover aquí un endpoint?**  
  No. Los **Route Groups** son invisibles en la URL.

- **¿Puedo colocar webhooks de proveedores aquí?**  
  Sí, si **no** son parte del contrato con el usuario final (p. ej., Stripe webhook de eventos).

- **¿Dónde pongo healthchecks?**  
  En `src/app/(system)/health/`. Este directorio es para **API infra**; salud/estado vive como carpeta hermana.

---

## Definición de Hecho (DoD) para este directorio

- Todo endpoint alojado aquí está **inventariado** (nombre y propósito).
- **No** hay endpoints de negocio ni datos sensibles expuestos.
- La **URL pública** coincide con lo esperado (sin efecto colateral por el grupo).
- Existe una **nota de seguridad y observabilidad** (qué se protege y cómo se observa, a nivel estructural).

---
