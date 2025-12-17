Providers (Adaptadores)

Este directorio sirve para manejar integraciones externas (ejemplo: newsletter, envío de correos, CRM) de una forma organizada y fácil de cambiar.

La idea es no escribir la lógica de Mailchimp, Resend, etc. directamente en los endpoints, sino tener un adaptador aquí que “traduzca” nuestras llamadas.

Principios básicos

Cada tipo de integración vive en su propia carpeta (newsletter/, mailer/, etc.).

Cada carpeta tiene:

index.ts → elige el proveedor según variables de entorno.

*.noop.ts → versión “vacía” que no hace nada (para desarrollo o test).

Archivos específicos (newsletter.mailchimp.ts, mailer.resend.ts, …).

Los handlers de la API solo importan desde index.ts y no saben qué proveedor hay detrás.

Así, cambiar de proveedor solo requiere actualizar ENV y, si hace falta, un nuevo adaptador aquí.

______________________________________________________________________
src/lib/providers/
├─ newsletter/
│  ├─ index.ts
│  ├─ newsletter.noop.ts
│  ├─ newsletter.mailchimp.ts   # opcional
│  └─ newsletter.resend.ts      # opcional
└─ mailer/
   ├─ index.ts
   ├─ mailer.noop.ts
   └─ mailer.resend.ts          # opcional
______________________________________________________________________



Variables de entorno comunes

Newsletter:

NEWSLETTER_PROVIDER = noop | mailchimp | resend

NEWSLETTER_API_KEY, NEWSLETTER_LIST_ID

Mailer:

MAILER_PROVIDER = noop | resend | smtp

RESEND_API_KEY o datos SMTP

MAIL_FROM (correo remitente)

Reglas rápidas

Siempre tener un noop como opción por defecto (no hace nada).

Los handlers de API no eligen proveedor, solo llaman a la interfaz del adaptador.

Los providers usan envs validadas en lib/env.ts.

Mantener el mismo contrato por dominio (ejemplo: newsletter.subscribe(email) debe existir en cualquier proveedor).