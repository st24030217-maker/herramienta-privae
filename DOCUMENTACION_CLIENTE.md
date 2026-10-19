# Guía Ejecutiva de la Plataforma
## Privae Textil · Software Web de Preparación DTF a 300 DPI

**Preparado para:** Dirección y Clientes de Privae Textil  
**Fecha:** Octubre de 2026  
**Versión:** 1.0 (Producción Oficial)

---

## 1. ¿Qué es la Plataforma Privae Textil?

Es una solución web creada para que tus clientes preparen, optimicen y armen sus diseños textiles antes de enviarlos a producción en DTF (Direct to Film).

### El Problema que Resuelve:
En la impresión DTF, los clientes suelen enviar archivos con fondos mal recortados, baja resolución (imágenes borrosas de WhatsApp o internet) o sombras semitransparentes que generan manchas blancas indeseadas en la tela.

### La Solución:
Esta plataforma pone en manos de tus clientes 5 herramientas automáticas que procesan las imágenes en segundos y entregan archivos certificados a **300 DPI reales con fondo transparente**, listos para imprimir en pliegos de **58 cm de ancho**.

---

## 2. Las 5 Herramientas para tus Clientes

Cada cliente con cuenta activa tiene acceso directo a las siguientes soluciones en línea:

### 01. Remover Fondo
- **Qué hace:** Elimina fondos blancos, negros o fotografías complejas con un solo clic.
- **Resultado:** Archivo PNG transparente limpio y listo para montar en prendas de cualquier color.

### 02. Mejorar Calidad y Resolución
- **Qué hace:** Aplica superresolución inteligente (2X y 4X) para reconstruir la nitidez de imágenes pequeñas o comprimidas.
- **Resultado:** Aumenta la definición para que el estampado físico no se vea pixelado ni borroso.

### 03. Eliminar un Color Específico
- **Qué hace:** Cuenta con un gotero visual para seleccionar cualquier color de la imagen y retirarlo por completo.
- **Resultado:** Permite eliminar fondos de color específico o detalles no deseados con control fino de tolerancia.

### 04. Quitar Semitransparencias (Filtro Antihalo)
- **Qué hace:** Convierte píxeles translúcidos en opacos y elimina sombras borrosas que confunden a la impresora DTF.
- **Resultado:** Evita que la máquina aplique tinta blanca en zonas fantasma y previene que el polvo poliamida se desprenda al lavar la prenda.

### 05. Armador de Metros DTF (58 cm)
- **Qué hace:** Un taller virtual interactivo donde el cliente acomoda y rota sus logotipos sobre un lienzo exacto de 58 cm de ancho (pliegos de 1 y 2 metros).
- **Resultado:** Mide en tiempo real los centímetros aprovechados, alerta si una imagen tiene baja resolución y exporta el archivo final en alta fidelidad a 300 DPI.

---

## 3. Modelo de Prueba Gratuita y Pagos

El sistema funciona de forma autónoma para que no tengas que gestionar cobros a mano:

### Prueba Gratis de 5 Días
- Al crear una cuenta nueva, el cliente recibe automáticamente **5 días de acceso total sin costo**.
- Puede probar todas las herramientas y comprobar la calidad de sus pliegos.

### Suscripción Mensual Automática
- Concluidos los 5 días, el sistema solicita activar la **Suscripción Premium** para continuar procesando.
- El cobro se realiza de forma recurrente mensual con tarjeta de crédito o débito a través de la pasarela segura **Stripe**.

### Periodo de Gracia de 3 Días
- Si la tarjeta del cliente no pasa o no tiene fondos al renovar, el sistema no bloquea su trabajo de inmediato.
- Le otorga **3 días naturales de gracia** con aviso visible para que actualice su pago sin detener su taller de impresión.

### Avisos Preventivos
- 3 días antes de cada renovación mensual, el sistema envía un correo de recordatorio al cliente para garantizar total transparencia y confianza.

---

## 4. Experiencia de Bienvenida al Iniciar Sesión

Para que cada cliente se sienta atendido y conozca el estado de su cuenta:

### 1. Saludo Personalizado en Pantalla
- Al entrar a la plataforma, aparece una notificación elegante que lo saluda con su nombre.
- Si está en prueba gratuita, le informa cuántos días le quedan y le ofrece un botón directo al taller.
- Si tiene suscripción activa, le confirma su membresía Pro a 300 DPI.
- Si eres tú entrando como Administrador, te da la bienvenida al panel de control central.

### 2. Correo Oficial en su Gmail
- Al registrarse o iniciar sesión por primera vez, el cliente recibe un correo formal con:
  - Bienvenida de Privae Textil.
  - Ficha técnica de su cuenta (días disponibles, 58 cm de ancho, 300 DPI).
  - Resumen de lo que puede hacer con cada una de las 5 herramientas.
  - Botón directo para ingresar a la plataforma desde su computadora o celular.

---

## 5. Seguridad y Privacidad Garantizada

- **Archivos 100% Privados:** Los diseños subidos por un cliente son privados y confidenciales. Ningún otro usuario puede ver ni descargar archivos ajenos.
- **Protección contra Intentos Fallidos:** Si alguien intenta ingresar con contraseñas erróneas más de 5 veces, el sistema bloquea la cuenta por 15 minutos para proteger al usuario de accesos no autorizados.
- **Sin Almacenar Tarjetas:** Los datos bancarios nunca tocan los servidores de la aplicación; viajan directamente cifrados bajo los estándares bancarios internacionales de Stripe (PCI-DSS).

---

## 6. Tecnologías Utilizadas en el Desarrollo

Para lograr un sistema rápido, seguro y escalable, se seleccionó un conjunto de tecnologías de estándar industrial:

### Interfaz y Experiencia de Usuario (Frontend)
- **Next.js 14 (App Router) y React 18:** Arquitectura moderna que permite tiempos de carga instantáneos y navegación ultrarrápida entre herramientas sin recargar la página.
- **Tailwind CSS:** Sistema de diseño de alta precisión que garantiza una interfaz minimalista de lujo, responsiva y adaptable a cualquier pantalla (móvil, tablet o computadora).
- **Framer Motion:** Biblioteca de animaciones de alto rendimiento para transiciones suaves en notificaciones de bienvenida y tarjetas interactivas.
- **Lucide Icons:** Iconografía vectorial SVG limpia y formal (libre de emojis), manteniendo una presentación sobria y corporativa.

### Motor de Procesamiento de Imágenes DTF
- **Sharp y Buffers en Memoria (Node.js):** Procesamiento de imágenes de alta velocidad directamente en memoria RAM, permitiendo manipular archivos pesados sin perder calidad y reduciendo el consumo de almacenamiento.
- **Inyector de Metadatos de Resolución (300 DPI):** Módulo técnico desarrollado a medida para incrustar la resolución física de 300 DPI exactos en la cabecera de los archivos PNG con transparencia real (canal alfa RGBA).
- **HTML5 Canvas API:** Motor gráfico interactivo para el armador de pliegos de 58 cm, con soporte para arrastrar, rotar, duplicar y calcular el aprovechamiento de tela en tiempo real.

### Base de Datos y Lógica de Negocio (Backend)
- **PostgreSQL en Neon Cloud:** Base de datos relacional serverless de alta disponibilidad, segura y escalable automáticamente conforme crece el número de clientes.
- **Prisma ORM:** Capa de acceso a datos que protege la aplicación contra inyecciones SQL y garantiza la integridad de usuarios, suscripciones y pagos.
- **SQLite:** Motor de base de datos local sincronizado automáticamente para pruebas de desarrollo rápidas y sin dependencias externas.

### Seguridad y Control de Sesiones
- **Bcrypt.js:** Algoritmo de hash criptográfico irreversible para resguardar las contraseñas de los usuarios.
- **JOSE / JWT (JSON Web Tokens):** Sesiones seguras mediante tokens firmados criptográficamente y almacenados en cookies protegidas (`HttpOnly`, `SameSite: Lax`).
- **Versionado de Tokens (`tokenVersion`):** Sistema de seguridad que permite revocar inmediatamente todas las sesiones activas de un usuario si cambia su contraseña o si el administrador desactiva su cuenta.

### Pagos y Facturación Recurrente
- **Stripe API:** Plataforma líder mundial de pagos por internet para gestionar suscripciones mensuales automáticas, cobros periódicos y periodos de gracia bajo certificación bancaria internacional PCI-DSS Nivel 1.

### Notificaciones y Correo Electrónico
- **Nodemailer y Gmail SMTP:** Motor de envío de correos electrónicos transaccionales conectado a los servidores oficiales de Google (`smtp.gmail.com`).
- **Plantillas HTML Responsive:** Correos con diseño optimizado para verse impecables tanto en la aplicación móvil de Gmail como en navegadores de escritorio.

### Infraestructura y Despliegue en la Nube
- **Vercel Edge Network:** Infraestructura de nube global de baja latencia con despliegue continuo (CI/CD) conectado al repositorio de GitHub.
- **GitHub:** Control de versiones profesional del código fuente con trazabilidad total de cambios.

---

## 7. Tu Panel de Control como Administrador

Desde tu acceso exclusivo de administrador (`/admin`) tienes el control total del negocio:

### Supervisión en Tiempo Real
- Lista completa de clientes registrados, su correo, fecha de alta y fecha de su último acceso.
- Cuántos archivos y pliegos ha procesado cada cliente.
- Estado de suscripción en vivo (Activo, Prueba, En Gracia o Pausado).

### Acciones Rápidas en 1 Clic
- **Activar Premium:** Dar acceso completo manual a clientes especiales.
- **Regalar Días de Prueba:** Extender 5 días adicionales a quien lo solicite.
- **Desbloquear Cuenta:** Liberar a un cliente que olvidó su clave e intentó muchas veces.
- **Reactivar / Desactivar:** Suspender temporalmente una cuenta si fuera necesario.
- **Enviar Bienvenida:** Reenviar el correo de bienvenida oficial a cualquier cliente con un botón.
- **Restablecer Contraseña:** Asignar una nueva clave temporal a un cliente si tiene problemas de acceso.

### Exportaciones y Reportes
- **Descarga a Excel (.CSV):** Exporta la base de datos de clientes con un clic, formateada para abrirse directamente en Microsoft Excel sin caracteres extraños.
- **Reporte Oficial en PDF:** Genera un informe limpio con membrete de Privae Textil para imprimir o enviar a socios y contabilidad.

---

## 8. Diseño Minimalista de Lujo

Toda la aplicación fue diseñada bajo un estándar visual sobrio y elegante:
- Colores neutros (negro profundo, grises de precisión y blanco de alto contraste).
- Cero colores estridentes o distractores.
- Cero emojis informales: se utilizan únicamente iconos vectoriales finos y tipografía formal.
- Totalmente adaptable a computadoras de escritorio, laptops y dispositivos móviles.

---

## 9. Resumen de Accesos Rápidos

- **Portal Principal de Herramientas:** Tu dirección web principal (`/`).
- **Panel Administrativo:** `/admin` (acceso restringido exclusivamente para tu cuenta de administrador).
- **Área de Cliente (Mi Cuenta):** `/account` (donde los clientes ven sus días, facturas y métodos de pago).
