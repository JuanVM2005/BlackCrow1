# Newsletter Adapter

Este módulo maneja la suscripción a newsletter (opt-in) desde el dominio.

## Qué hace
- Registra suscriptores con `subscribe()`
- Debe ser **idempotente** (si ya existe, no falla)

## Estado actual
- Implementación: **NO-OP**
- No envía datos a ningún proveedor externo.

## Cuándo implementarlo de verdad
Cuando definas un proveedor (Brevo, Mailchimp, ConvertKit, etc.).

## Ejemplo de uso

```ts
import { createNewsletterAdapter } from "@/server/adapters/newsletter";

const newsletter = createNewsletterAdapter();

await newsletter.subscribe({
  email: "hello@blackcrow.agency",
  fullName: "Juan",
  locale: "es",
  source: "contact",
});

---

## 📁 `src/server/adapters/newsletter/implementations/`
No requiere archivo extra; solo la carpeta.

---

### ✅ Queda listo
- nada vacío
- contrato claro
- noop real
- factory para cambiar proveedor sin tocar el dominio

---

Si quieres, lo siguiente pro es **conectarlo al flujo real**: `submitContactForm` → si `newsletterOptIn === true` llama a `createNewsletterAdapter().subscribe(...)`.
