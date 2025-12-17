health/ — rutas de salud del sistema
Propósito

Carpeta para endpoints de salud y estado del sistema. Sirve para orquestadores/monitores (CDN, load balancer, uptime, k8s).

Alcance (qué entra)

Liveness: confirma que el proceso responde.

Readiness: confirma que el sistema está listo (dependencias mínimas OK).

(Opcional) Status/Info: metadatos no sensibles (versión, commit, entorno).

Regla: solo exponer información no sensible. Nada de secretos, tokens, ni detalles internos.

Comportamiento de rutas

Este directorio vive bajo un route group: (system) no altera la URL pública.

Ejemplos conceptuales:

(system)/health → /health

(system)/health/readiness → /health/readiness

Seguridad y cache

Normalmente no requiere auth, pero debe estar rate-limited y sin datos sensibles.

No cacheable: desaconsejado cache/CDN para respuestas de salud.

Observabilidad

Registrar errores/latencias anómalas en el sistema de métricas/logs global (definido a nivel de plataforma).

No incluir payloads con datos privados.

Estructura sugerida

src/app/(system)/health/
  README.md         ← este archivo
  (opcional) liveness/
  (opcional) readiness/
  (opcional) status/

Criterios de aceptación

Las rutas de salud responden sin tocar integraciones innecesarias (rápidas y determinísticas).

Liveness no depende de servicios externos.

Readiness puede verificar dependencias críticas (p. ej., conectividad a recursos esenciales) sin filtrar secretos.

Las URLs públicas se mantienen estables (el route group no cambia el path).

Propiedad

Dueño: Plataforma/Infra.

Cambios requieren revisión de seguridad y de observabilidad.

Testing (estructura)

Chequeos e2e en tests/e2e/specs/ con fixtures en tests/e2e/fixtures/.

No versionar reportes/artefactos (solo marcadores de carpeta).