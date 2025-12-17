Validators

Este directorio contiene esquemas de validación (p. ej., con Zod) para requests de la API: body, query y headers.
La validación no vive en el handler: aquí definimos los contratos; el handler solo los usa.

Objetivo

Asegurar entradas predecibles y tipadas.

Separar validación de la lógica del endpoint.

Entregar errores consistentes (400) antes de ejecutar la lógica.
______________________________________________________________________
Estructura recomendada
src/lib/validators/
├─ contact.schema.ts     # POST /api/contact
├─ newsletter.schema.ts  # POST /api/newsletter (si aplica)
└─ index.ts              # re-exports para imports limpios
______________________________________________________________________


Reglas:

Un archivo *.schema.ts por recurso/endpoint.

Nombra por recurso, no por método (mejor contact.schema.ts que post-contact.ts).

Si un recurso crece, separa por partes: contact.body.schema.ts, contact.query.schema.ts.

Qué debe exponer cada schema

Parsers independientes:

parseBody(input)

parseQuery(input)

parseHeaders(input)

Tipos derivados (si usas TS):

ContactBody, ContactQuery, etc.

La idea: desde el handler, haces const body = parseBody(await req.json()) y listo.

Uso esperado en los handlers (orden)

Rate limit

CORS

Auth

Validación con validators/* ← aquí

Lógica → providers/servicios

Respuesta → lib/http.ts

Errores

Si la validación falla, retorna 400 con un formato consistente (usa lib/http.ts).

No incluyas datos sensibles en el error; solo campos y mensajes resumidos.

Convenciones

Campos requeridos vs opcionales claros.

Normaliza formatos (emails, phone, locales) en el propio esquema si aplica.

Para i18n de mensajes, mantén mensajes breves y neutrales (o usa un mapeo externo).

No mezclar lógica de negocio aquí (solo validación y saneamiento básico).