# Política de Seguridad

Gracias por ayudar a mantener este proyecto seguro.

---

## 📢 Reporte de vulnerabilidades

Si encuentras un problema de seguridad:

1. **No abras un Issue público.**
2. Envíanos un correo a:

**security@blackcrow.agency**

Incluye:

- Descripción del problema
- Pasos para reproducir
- Impacto potencial
- Propuesta de solución (si aplica)

Nos comprometemos a responder en un plazo de **72 horas**.

---

## 🔐 Buenas prácticas internas

Contribuidores deben seguir estas reglas:

- No subir nunca claves reales o archivos `.env`.
- No exponer endpoints internos o secretos en el cliente.
- Sanitizar inputs y validar datos con Zod.
- Mantener dependencias actualizadas.
- Evitar librerías inseguras o abandonadas.
- Verificar que el build de producción (`npm run build`) no genere alertas críticas.

---

## 🛠 Ciclo de actualizaciones de seguridad

- Revisiones mensuales de dependencias.
- Auditoría periódica de vulnerabilidades con:
  ```bash
  npm audit
