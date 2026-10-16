# DOCUMENTACIÓN TÉCNICA, INFRAESTRUCTURA, BACKUPS Y COSTOS MENSUALES
## Plataforma Web Premium para Preparación de Imágenes y DTF — Privae Textil (2026)

Este documento cumple con los entregables solicitados en las **Secciones 10, 11, 12 y 13** de `Propuesta_Herramienta_Privae.pdf`.

---

## 1. Arquitectura General del Sistema

- **Frontend y Experiencia de Usuario:** Next.js 14 (App Router), React 18, Tailwind CSS, tipografía corporativa `Tanker` en todo el sistema, estética monocromática de alto contraste alineada con Privae Textil y botón de retorno directo a la tienda oficial (`NEXT_PUBLIC_STORE_URL`).
- **Motor Gráfico DTF del Lado del Servidor (300 DPI Certificados):** Procesamiento real en backend con `sharp` (libvips en C++) con soporte de imágenes y pliegos grandes de hasta **58 × 200 cm a 300 DPI (`6850 × 23622 px`)**, conservando canal alfa real (`RGBA`), sin fondos blancos ni marcas de agua.
- **Las 5 Herramientas Oficiales + Diagnóstico:**
  1. `01 · Remover Fondo` (`/tools/remove-bg` y `/api/process/remove-bg`): Conector híbrido IA neuronal (`Remove.bg` / `ClipDrop`) + motor propio con Flood-Fill 8-conectado, Alpha Matting para cabello/bordes finos y Descontaminación Cromática a 300 DPI.
  2. `02 · Mejorar Calidad / Resolución` (`/tools/enhance` y `/api/process/enhance`): Superresolución Lanczos3 + máscara de enfoque adaptativa sin deformar el diseño, salida PNG 300 DPI.
  3. `03 · Eliminar un Color` (`/tools/remove-color` y `/api/process/remove-color`): Cuentagotas interactivo sobre la imagen con rango de tolerancia y suavizado de borde, salida PNG 300 DPI.
  4. `04 · Quitar Semitransparencias` (`/tools/clean-alpha` y `/api/process/clean-alpha`): Purificación de canal alfa apta para DTF con soporte de pliegos de hasta **58 × 200 cm**, eliminando halos y velos de tinta blanca.
  5. `05 · Armador de Archivos DTF` (`/tools/dtf-builder` y `/api/process/compose-dtf`): Lienzo a escala con formatos exactos **58 × 100 cm** (`6850 × 11811 px`) y **58 × 200 cm** (`6850 × 23622 px`), restricción de bordes, medidas en cm, alerta de DPI bajo, margen configurable, acomodo automático (nesting) y exportación PNG transparente a 300 DPI.
- **Autenticación, Prueba de 5 Días y Suscripciones:**
  - Registro e inicio de sesión con `bcrypt` y cookies `HttpOnly` JWT, más flujo completo de recuperación de contraseña (`/auth/forgot-password` y `/auth/reset-password`).
  - Activación automática de **5 días de prueba gratuita** al registrarse y bloqueo automático al vencer.
  - Pasarela **Stripe** para cobro mensual recurrente, recordatorio automático **3 días antes de renovar**, **3 días naturales de gracia** en pago fallido y suspensión sin borrar la cuenta.

---

## 2. Instalación Local y Despliegue en Producción

### A. Instalación en Entorno Local
```bash
# 1. Instalar dependencias
npm install

# 2. Copiar archivo de variables de entorno
cp .env.example .env

# 3. Sincronizar esquema de base de datos Prisma
npx prisma db push

# 4. Iniciar servidor de desarrollo
npm run dev
```

### B. Despliegue en Producción (Vercel / Railway / Render)
1. **Base de Datos PostgreSQL:** Crear una instancia PostgreSQL en **Supabase**, **Neon** o **Railway**, actualizar `provider = "postgresql"` en `prisma/schema.prisma` y colocar la cadena de conexión en `DATABASE_URL`.
2. **Variables de Entorno:** Configurar todas las variables listadas en `.env.example` dentro del panel de Vercel.
3. **Cron Job Diario Automático:** El archivo `vercel.json` incluido en la raíz programa automáticamente la ejecución diaria de `/api/cron/lifecycle` a las `08:00 UTC` y asigna `3008 MB` de memoria RAM y `60s` de tiempo máximo a las rutas `/api/process/**` para soportar pliegos de `58 × 200 cm`.
4. **Subdominio Oficial (Sección 06 y 13):** Apuntar mediante registro `CNAME` el subdominio acordado (ej. `herramientas.privaetextil.com` o `dtf.privaetextil.com`) hacia `cname.vercel-dns.com`.

---

## 3. Política de Privacidad de Archivos, Backups y Recuperación (Sección 07 y 10)

1. **Procesamiento en Memoria y Eliminación Automática:**
   - Los archivos originales y resultados PNG se procesan directamente en buffers de memoria RAM sin almacenarse en carpetas públicas.
   - El parámetro `FILE_RETENTION_MINUTES` (configurable en tiempo real desde `/admin`, por defecto `60 minutos`) anonimiza las referencias temporales y purga tokens expirados mediante `/api/cron/lifecycle`.
2. **Backups y Recuperación de Base de Datos:**
   - **Producción (PostgreSQL en Supabase / Neon):** Activar **Point-in-Time Recovery (PITR)** y respaldos diarios automáticos con retención mínima de 7 a 30 días.
   - **Respaldo Manual bajo demanda:**
     ```bash
     pg_dump "$DATABASE_URL" --format=custom --file="backup_privae_$(date +%Y%m%d).dump"
     ```
   - **Restauración en caso de contingencia:**
     ```bash
     pg_restore --clean --no-acl --no-owner -d "$DATABASE_URL" backup_privae_YYYYMMDD.dump
     ```

---

## 4. Tabla de Costos Mensuales Estimados de Servicios Externos (Sección 11 y 13)

| Servicio / Componente | Proveedor Recomendado | Plan Sugerido en Producción | Costo Mensual Estimado (USD) | Notas Operativas |
| :--- | :--- | :--- | :--- | :--- |
| **Hosting Web + Funciones Serverless (3 GB RAM)** | Vercel Pro / Railway | Pro (soporta `maxDuration: 60s` y Cron Jobs) | `$20 USD / mes` | Necesario para procesar pliegos de 58 × 200 cm a 300 DPI en servidor. |
| **Base de Datos + Backups Automáticos** | Supabase / Neon PostgreSQL | Plan Free / Pro con Backups Diarios | `$0 – $25 USD / mes` | Almacena usuarios, suscripciones, pagos, auditoría y bitácora de correos. |
| **Pasarela de Cobro Recurrente** | Stripe | Comisión por transacción exitosa | `$0 fijo` (`2.9% + $0.30` por cobro) | Sin renta mensual fija; sólo cobra comisión cuando un cliente paga su membresía. |
| **Correos Transaccionales Automáticos (6 Eventos)** | Resend | Plan Free (hasta 3,000 correos/mes) o Pro | `$0 – $20 USD / mes` | Envía bienvenida, fin de prueba, recordatorio 3 días antes, pago aprobado/fallido. |
| **Motor de Recorte de Fondo (01 · Remover Fondo)** | Motor Propio `sharp` (Incluido) / API IA opcional (`ClipDrop` / `Remove.bg`) | Motor propio `$0` / API IA bajo demanda por crédito | `$0 USD / mes` (Motor local) | El motor local incluido no genera costo por imagen; la API externa es opcional. |

**Costo Fijo Operativo Total Estimado:** Entre **`$20 y $65 USD / mes`** dependiendo del volumen de usuarios activos.
