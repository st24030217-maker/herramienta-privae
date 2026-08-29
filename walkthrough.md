# Walkthrough: Plataforma Web DTF 300 DPI - Privae Textil

Se ha desarrollado e integrado la aplicación web completa para la preparación de imágenes e impresión DTF para **Privae Textil**, cumpliendo con la totalidad de los requerimientos y especificaciones funcionales 2026.

---

## 🚀 Componentes y Herramientas Implementadas

### 1. Las 5 Herramientas DTF Requeridas
- **01 · Remover Fondo (`/tools/remove-bg`)**:
  - Detección de sujeto con bordes limpios, recorte con preservación de canal alfa real y tolerancia/feathering ajustable. Salida PNG a 300 DPI.
- **02 · Mejorar Calidad / Resolución (`/tools/enhance`)**:
  - Superresolución 2X y 4X con interpolación Lanczos3 de alta precisión, realce de bordes/Unsharp Mask adaptativo y reducción de ruido.
- **03 · Eliminar un Color (`/tools/remove-color`)**:
  - Cuentagotas y selector de color interactivo con cálculo de distancia cromática Euclidiana y slider de tolerancia en tiempo real.
- **04 · Quitar Semitransparencias (`/tools/clean-alpha`)**:
  - Motor de depuración de canal alfa para DTF. Elimina halos y residuos semitransparentes que causan acumulación indeseada de tinta blanca en impresoras DTF.
- **05 · Armador de Archivos DTF (`/tools/dtf-builder`)**:
  - Lienzo interactivo en **58 × 100 cm** y **58 × 200 cm**.
  - Carga múltiple de archivos PNG, transformación con medidas exactas en cm, rotación, duplicado y advertencia de resolución efectiva (< 250 DPI).
  - Exportador backend que genera el PNG maestro a 300 DPI reales (hasta 6,850 × 23,622 píxeles).

---

### 2. Sistema de Usuarios, Prueba de 5 Días y Suscripciones
- **Prueba Gratuita**: 5 días automáticos asignados en el registro.
- **Período de Gracia**: 3 días naturales en caso de fallo de pago.
- **Autenticación**: JWT seguro en cookies HttpOnly y encriptación bcrypt.
- **Área de Usuario (`/account`)**: Consulta de días restantes, estado de suscripción y botones de gestión.

---

### 3. Panel Administrativo (`/admin`)
- Métricas globales en tiempo real: usuarios registrados, suscripciones activas, usuarios en prueba, suspendidos y total de imágenes procesadas.
- Buscador interactivo de clientes con opción de activar o suspender acceso con 1 clic.

---

## 🛠️ Cómo Iniciar el Servidor de Desarrollo

Para ejecutar y probar la aplicación en tu navegador:

```bash
npm run dev
```

La plataforma estará disponible en `http://localhost:3000`.
