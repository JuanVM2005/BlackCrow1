# API (App Router handlers)

`src/app/api/` contiene los endpoints de la app usando el **App Router** de Next.js.

## Objetivo
- Mantener endpoints **predecibles, seguros y desacoplados** de integraciones externas.
- La lógica de terceros vive en `src/lib/providers/*`.  
- Los handlers solo **validan → coordinan → responden**.

---

## Estructura

src/app/api/
├─ health/ # GET: chequeo simple (vivo/ok)
│ └─ route.ts
├─ contact/ # POST: formulario de contacto (ejemplo)
│ └─ route.ts
├─ revalidate/ # POST: ISR on-demand (path/tag) – protegido
│ └─ route.ts
└─ v1/ # (opcional) API pública versionada
└─ stats/
└─ route.ts


**Regla:** un endpoint = **carpeta** + `route.ts`.  
**Nombre:** por recurso (`newsletter/`, `contact/`, `revalidate/`).  
**Públicos y de larga vida:** usar `/api/v1/*`, `/api/v2/*`.

---

## Convenciones por handler

### Runtime
- Declarar explícito por archivo:
  - `edge` → latencia mínima, **sin** Node APIs.
  - `nodejs` → si usas SDKs de Node o dependes de `process`, `fs`, etc.

### Caching
- **Mutaciones** → `no-store`.
- **Lecturas públicas** → `revalidate` o `force-cache` cuando aplique.

### Métodos
- Implementar **solo** los necesarios (`GET`, `POST`, …).

### Orden recomendado (dentro del handler)
1. **Rate limit** → `src/lib/ratelimit.ts`
2. **CORS** (si es público) → `src/lib/cors.ts`
3. **Auth** (si requiere secreto/token) → `src/lib/auth.ts`
4. **Validación** (`body`, `headers`, `query`) → `src/lib/validators/*`
5. **Lógica** mínima → delegar a `src/lib/providers/*` o `src/lib/*`
6. **Respuesta** → `src/lib/http.ts` (`json()`, `error()`, `problem()`)
7. **Logging** (sin PII) → `src/lib/log.ts`

> La **selección de provider** nunca va en el handler; la hace  
> `src/lib/providers/<dominio>/index.ts` según `ENV`.

---

## Variables de entorno (ejemplos)
Definir y **validar** en `src/lib/env.ts`:
- `API_BEARER_TOKEN` **o** `REVALIDATE_SECRET` (endpoints protegidos)
- `CORS_ALLOWED_ORIGINS` (coma-separados)
- `RATE_LIMIT_WINDOW`, `RATE_LIMIT_MAX`
- *(si aplica)* `MAILER_PROVIDER`, `MAIL_FROM`, `MAIL_TO_DEFAULT`, `NEWSLETTER_PROVIDER`, `NEWSLETTER_API_KEY`, etc.

---

## Contratos de endpoints

### 1) `GET /api/health`  — Chequeo simple
**Runtime:** `edge`  
**Cache:** `no-store`

**Request**
GET /api/health

**Response 200**
```json
{ "ok": true, "status": "healthy" }

2) POST /api/contact — Formulario de contacto (ejemplo)

Runtime: nodejs (si envías correo) o edge (si solo guardas)
Cache: no-store
Rate limit: recomendado

Headers

Content-Type: application/json

Body (JSON)
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Hola, me interesa el producto"
}

Validado por src/lib/validators/contact.schema.ts.

Response 200
{ "ok": true, "received": true }

Errores comunes

400 (validación): {"type":"about:blank","title":"Bad Request","status":400,"detail":"…"}

429 (rate limit): {"type":"about:blank","title":"Too Many Requests","status":429}

500 (interno): {"type":"about:blank","title":"Internal Error","status":500}

cURL
curl -X POST https://<host>/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","message":"Hola"}'

3) POST /api/revalidate — ISR on-demand (protegido)

Runtime: nodejs o edge
Cache: no-store
Auth: requerida (Authorization: Bearer <token> o secreto validado)

Headers

Content-Type: application/json

Authorization: Bearer <REVALIDATE_SECRET>

Body (JSON)

Revalidar por tag (preferido):

{ "tag": "landing:es" }
Revalidar por path:
{ "path": "/es" }
Tags y tiempos definidos en src/lib/cache.ts
(p.ej., TAGS.landing, helper tagForLocale('landing','es'), REVALIDATE.LANDING).

Response 200
{ "ok": true, "mode": "tag", "value": "landing:es" }
Errores comunes

401 (auth): token/secret inválido.

400 (payload): ni tag ni path, o tag desconocido.

500 (interno).

cURL (tag)

curl -X POST https://<host>/api/revalidate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <REVALIDATE_SECRET>" \
  -d '{"tag":"landing:es"}'

cURL (path)
curl -X POST https://<host>/api/revalidate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <REVALIDATE_SECRET>" \
  -d '{"path":"/es"}'

Testing
Unit

Validadores/adaptadores cerca de su archivo (*.test.ts).

providers/* con tests de contrato en __tests__.

E2E de API

src/tests/e2e/api/* (si lo habilitas) o dentro de src/tests/e2e/specs/*.

Usa providers noop en CI para no llamar servicios reales.

Fixtures comunes en src/tests/fixtures/*.

CI

.github/workflows/ci.yml ejecuta: lint → typecheck → unit → e2e.

Notas de seguridad

No loguear PII ni secretos (usar src/lib/log.ts con redacción).

En producción limitar CORS a dominios conocidos.

Rate limit por IP y ruta para endpoints públicos.






