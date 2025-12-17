Propósito

Albergar endpoints y rutas internas/infra (revalidate, health, webhooks internos).

Aislar infraestructura del árbol de producto sin cambiar URLs públicas (los paréntesis no afectan el path).

Qué entra aquí

api/revalidate/ (ISR, invalidaciones, re-hydrate).

health/ o status/ (liveness/readiness).

Webhooks internos o de plataforma (si no son de negocio).

Endpoints de mantenimiento/diagnóstico.

Qué NO entra

APIs de producto (contact forms, leads, etc.) → van en src/app/api/*.

Páginas de marketing, docs, legales → bajo [locale] u otros grupos.

Comportamiento de rutas

Los route groups con paréntesis no cambian la URL pública.

Ejemplo conceptual: (system)/api/revalidate sigue sirviendo como /api/revalidate.

Seguridad y operación (responsabilidades)

Autorización obligatoria en endpoints sensibles (revalidate/webhooks).

Ratelimiting/logging/observabilidad definidos a nivel de server o middlewares.

Prohibido exponer información de entorno/build.

Propiedad

Dueño: plataforma/infra. Cambios requieren revisión de seguridad y de SEO si afectan cache.

Cómo agregar un endpoint de sistema (solo estructura)

Crear carpeta bajo (system)/api/<endpoint>/.

Documentar contrato en el README local del endpoint (opcional).

Añadir pruebas e2e focalizadas si impacta a rutas públicas (fixtures en tests/e2e/fixtures).

Relacionado

src/app/api/ para APIs de producto.

src/server/ para adapters/IO.

src/core/ para utilidades puras (sin IO).