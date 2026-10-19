# Documentación Técnica Integral del Sistema
## Privae Textil — Plataforma de Preparación y Salida DTF a 300 DPI

**Fecha de actualización:** 19 de Octubre de 2026  
**Versión:** 1.0.0 (Producción)  
**Estado:** Verificado y Desplegado en rama `main`

---

## 1. Resumen Ejecutivo

El presente documento recopila todas las implementaciones arquitectónicas, de seguridad, de diseño visual y de experiencia de usuario incorporadas a la plataforma web de **Privae Textil**. 

El sistema está diseñado para ofrecer un entorno de preimpresión técnica de alta fidelidad (archivos PNG con canal alfa real y resolución certificada de mínimo 300 DPI en lienzos de 58 cm), respaldado por una gestión administrativa integral, cobros automáticos mediante Stripe y un perímetro de seguridad robusto con separación estricta de roles.

---

## 2. Arquitectura de Base de Datos (Prisma ORM & PostgreSQL)

La persistencia de datos se gestiona a través de Prisma ORM sobre PostgreSQL (Neon en producción) y SQLite sincronizado automáticamente para entornos de desarrollo local.

### 2.1. Modelo `User` (Usuarios y Credenciales)
El modelo de usuarios fue reforzado con campos dedicados a auditoría, seguimiento de accesos y prevención de ataques:
- `id` (String / UUID): Identificador único global de la cuenta.
- `email` (String / Unique): Correo electrónico normalizado en minúsculas.
- `name` (String?): Nombre completo o comercial del cliente.
- `passwordHash` (String): Hash irreversible generado mediante `bcrypt` con factor de coste 10.
- `role` (String, default "USER"): Rol de acceso en el sistema (`ADMIN` o `USER`).
- `isActive` (Boolean, default true): Bandera de activación de cuenta. Permite inhabilitar usuarios sin eliminar sus registros ni pliegos.
- `lastLoginAt` (DateTime?): Marca temporal exacta del último inicio de sesión exitoso.
- `lastLoginIp` (String?): Dirección IP del cliente en su último acceso registrado.
- `failedAttempts` (Int, default 0): Contador de contraseñas incorrectas consecutivas.
- `lockedUntil` (DateTime?): Marca de tiempo hasta la cual la cuenta permanece bloqueada por exceso de intentos fallidos.
- `tokenVersion` (Int, default 1): Número de versión del token de sesión. Permite la invalidación y revocación instantánea de sesiones en todos los dispositivos.
- `resetToken` y `resetTokenExpiry`: Token temporal y expiración para restablecimiento seguro de contraseña (vigencia de 1 hora).

### 2.2. Modelo `Subscription` (Ciclo de Vida y Facturación)
Controla el estado operativo del cliente según los requerimientos comerciales:
- `status`: Estado del plan (`TRIAL`, `ACTIVE`, `GRACE_PERIOD`, `SUSPENDED`, `CANCELED`, `PAST_DUE`).
- `trialEndsAt`: Fecha de conclusión del periodo de prueba gratuita de 5 días naturales.
- `gracePeriodEndsAt`: Plazo de 3 días naturales otorgados si falla un cobro mensual.
- `currentPeriodEnd`: Fecha de vencimiento o renovación del ciclo mensual actual.
- `stripeCustomerId` y `stripeSubscriptionId`: Identificadores enlazados con la pasarela Stripe.
- `paymentMethodBrand` y `paymentMethodLast4`: Registro de la tarjeta para referencia del cliente.
- `planPrice`: Monto recurrente del plan (por defecto $19.99 USD).
- `lastReminderSentAt`: Fecha del último recordatorio preventivo de cobro enviado.

### 2.3. Modelos de Auditoría y Bitácora
- `AuditLog`: Registro inmutable de acciones críticas (inicios de sesión, bloqueos, cambios de contraseña, ajustes de estado de suscripción por el administrador).
- `EmailLog`: Historial de cada notificación enviada por correo electrónico, con destinatario, asunto, evento y estado de entrega (`SENT`, `FALLBACK_LOGGED`).
- `ToolUsage`: Conteo y telemetría de archivos procesados por herramienta DTF (Remover fondo, Mejorar resolución, Eliminar color, Quitar semitransparencias, Armador de pliegos).
- `Payment`: Historial de cobros, transacciones y facturas de Stripe.
- `Setting`: Parámetros operativos modificables en caliente desde el panel administrativo (precio del plan, Stripe Price ID, tiempo de retención de archivos).

---

## 3. Lógica de Autenticación, Seguridad y Control de Sesiones

### 3.1. Protección contra Ataques de Fuerza Bruta
En el endpoint de inicio de sesión (`/api/auth/login`):
1. **Límite de intentos:** Tras 5 contraseñas erróneas consecutivas, el campo `lockedUntil` se establece a 15 minutos en el futuro y se registra el evento `ACCOUNT_LOCKED` en la bitácora de auditoría.
2. **Rechazo preventivo:** Durante el periodo de bloqueo, el sistema responde con código HTTP 423 y notifica al usuario los minutos restantes antes de poder reintentar.
3. **Restablecimiento exitoso:** Si las credenciales son correctas, el contador de intentos fallidos y el bloqueo se limpian automáticamente a cero.
4. **Protección de temporización:** Se utiliza un hash ficticio de referencia para evitar ataques basados en tiempo de respuesta cuando un correo no existe en la base de datos.

### 3.2. Versionado de Sesiones JWT e Invalidación Inmediata
- Las sesiones utilizan cookies firmadas mediante JWT (`jose`) con atributos `HttpOnly`, `SameSite: Lax`, `Path: /` y cifrado sobre HTTPS en producción.
- El payload del token codifica `{ sub: userId, role, v: tokenVersion }`.
- Al validar la sesión en `/api/auth/me` o en middleware, se coteja que `user.tokenVersion === payload.v` y que `user.isActive === true`.
- Si el administrador desactiva una cuenta o restablece la contraseña de un usuario, el campo `tokenVersion` se incrementa en la base de datos, dejando inválidas todas las sesiones abiertas en cualquier navegador de forma inmediata.

### 3.3. Separación Estricta de Perímetros de Acceso
- **Middleware perimetral (`src/middleware.ts`):** Cualquier petición hacia rutas `/admin` o endpoints `/api/admin/*` verifica la firma del token y comprueba que `role === 'ADMIN'`. Si un usuario con rol `USER` intenta acceder a `/admin`, es redirigido inmediatamente a la raíz `/`. Si intenta consumir una API administrativa, recibe un código 403.
- **Redirección inteligente al iniciar sesión:** Los usuarios con rol `ADMIN` son conducidos directamente al Panel de Control `/admin`, mientras que los clientes son dirigidos a su consola de taller `/`.

---

## 4. Sistema de Bienvenida Personalizada

### 4.1. Notificación Interactiva en la Plataforma (`UserWelcomeNotification.tsx`)
Un componente flotante con animación Framer Motion detecta el inicio de sesión y la identidad del usuario activo:
- **Administrador Master:** Saludo formal como administrador del sistema, insignias de acceso maestro y enlace directo al panel de control `/admin`.
- **Cliente con Plan Premium Activo:** Notificación de membresía Pro activa con acceso ilimitado a 300 DPI y enlace al armador de metros de 58 cm.
- **Cliente en Prueba Gratuita:** Indicador de los días de prueba restantes (de 1 a 5 días) y desglose de las 5 herramientas desbloqueadas.
- **Cliente en Periodo de Gracia:** Aviso de regularización de método de pago con acceso a `/account`.
- **Cliente Suspendido:** Aviso de suscripción pausada con botón para reactivación.
- **Temporizador de lectura:** Cuenta con barra de progreso de cierre automático de 8 segundos, pausa inteligente al pasar el cursor (`hover`) y botón de descarte manual.

### 4.2. Integración de Envío por Gmail y SMTP (`src/lib/email.ts`)
Se integró `nodemailer` con soporte nativo para servidores de Google (`smtp.gmail.com`):
- **Plantilla optimizada para Gmail:** Formateada en HTML con estilos en línea, compatible con la aplicación móvil y la versión de escritorio en modos claro y oscuro.
- **Ficha técnica:** Incluye correo del titular, días de vigencia, formato oficial DTF de 58 cm, resolución certificada de 300 DPI y descripción paso a paso de los 5 módulos de taller.
- **Disparo automático:** 
  1. Al registrarse una cuenta nueva (`ALTA_INICIO_PRUEBA`).
  2. En el primer inicio de sesión del usuario si no tenía registrado un envío previo en `EmailLog`.
  3. Reenvío manual desde el Panel de Administrador con el botón "Enviar Bienvenida".

---

## 5. Estética Minimalista Monocromática (Luxury Monochrome)

Siguiendo las directrices estrictas de diseño, se eliminaron todos los colores vibrantes y de neón (verdes esmeralda, ámbares, amarillos, rosas, cianos y morados) en favor de una paleta sobria de alto contraste:
- **Fondos:** Negro puro (`#000000`, `#0A0B0E`), carbón oscuro (`#0D0E12`, `#14161C`).
- **Bordes:** Grises neutros (`#20232A`, `#262626`, `#333333`, `border-white/10`).
- **Tipografía:** Blanco brillante para títulos e información destacada (`#FFFFFF`, `text-white`), y escala de grises neutros para textos secundarios (`#9CA3AF`, `#8E95A5`, `text-neutral-400`).
- **Iconografía:** Sustitución de emojis y colores estridentes por iconos vectoriales monocromáticos finos de Lucide SVG.

---

## 6. Panel Administrativo y Reportes Oficiales

En la ruta `/admin`:
1. **Control de Usuarios:**
   - Tabla interactiva con búsqueda en tiempo real.
   - Columnas de Alta, Último Acceso (con fecha e IP), Estado de Cuenta (Activo / Inactivo / Bloqueado), Estado de Suscripción y conteo de uso de herramientas.
   - Acciones individuales por cliente: Activar Plan Premium, Asignar 5 días de prueba, Activar 3 días de gracia, Suspender cuenta, Restablecer contraseña con invalidación de sesiones, Desbloquear cuenta tras intentos fallidos y Enviar correo oficial de bienvenida por Gmail.
2. **Exportación de Datos a Formato Excel:**
   - Generación de archivos `.CSV` codificados con BOM UTF-8 (`\uFEFF`) y delimitadores estándar para visualización nativa en Microsoft Excel sin problemas de acentos o caracteres especiales.
3. **Generación e Impresión de Reportes en PDF:**
   - Vista de impresión profesional con logotipo oficial, membrete de Privae Textil, fecha de corte, tablas de clientes y resumen financiero.

---

## 7. Configuración de Variables de Entorno (.env)

```env
# Conexión a Base de Datos
DATABASE_URL="postgresql://usuario:password@host/neondb?sslmode=require"

# Seguridad y Criptografía de Sesión
JWT_SECRET="clave_secreta_jwt_privae_textil_2026_super_segura"

# Cuentas con Acceso Maestro
ADMIN_EMAIL="admin@privae.com"
ADMIN_DEFAULT_PASSWORD="TuContraseñaAdmin2026!"

# Pasarela de Pagos Stripe
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Configuración de Servidor de Correo (Gmail SMTP)
GMAIL_USER="notificaciones@privaetextil.com"
GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
EMAIL_FROM="Privae Textil <notificaciones@privaetextil.com>"

# URL Base de la Aplicación
NEXT_PUBLIC_APP_URL="https://tu-dominio.com"
```

---

## 8. Verificación y Despliegue

- **Verificación de tipos:** Todos los archivos fueron comprobados con `npx tsc --noEmit` obteniendo 0 errores de compilación.
- **Sincronización de Base de Datos:** Prisma sincronizado con `npx prisma db push` y cliente regenerado con `npx prisma generate`.
- **Repositorio Git:** Todos los módulos fueron versionados y consolidados en la rama `main` en GitHub.
