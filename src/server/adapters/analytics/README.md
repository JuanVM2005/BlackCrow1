# Analytics Adapter

Este módulo maneja **eventos de negocio**, no analítica de páginas.

## Qué SÍ es
- Eventos como:
  - contact.submit
  - lead.created
  - newsletter.opt_in
- Server-side
- Independiente del proveedor

## Qué NO es
- Page views
- Web vitals
- User sessions (eso lo maneja Vercel Analytics)

## Estado actual
- Implementación: **NO-OP**
- No envía datos a ningún servicio externo

## Futuras implementaciones posibles
- Segment
- PostHog
- GA4 (server-side)
- Data warehouse

## Uso típico

```ts
const analytics = createAnalyticsAdapter();

await analytics.track({
  name: "contact.submit",
  properties: {
    locale: "es",
    service: "landing",
  },
});

---

## 📁 `src/server/adapters/analytics/implementations/`

👉 **No necesita código adicional**, solo carpeta organizacional.

---

## ✅ Resultado final (importante)
- ❌ Nada vacío
- ❌ Nada “por si acaso”
- ✅ Contrato claro
- ✅ NO-OP real
- ✅ Listo para producción
- ✅ Fácil de reemplazar luego

---

## 🔜 Siguiente paso
Ahora seguimos con **4️⃣ Newsletter adapter** (tiene aún más sentido porque ya tienes `newsletterOptIn`).

👉 Dime **“vamos con newsletter”** y te doy:
- contrato
- noop
- factory
- README
- y cómo conectarlo a `submitContactForm` 💪
