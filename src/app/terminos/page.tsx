import React from "react";
import Link from "next/link";
import { FileCheck2, Clock, CreditCard, ShieldAlert, Layers, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones de Uso y Suscripción | Privae Textil DTF",
  description:
    "Términos de acceso, prueba gratuita de 5 días, suscripción mensual, periodo de gracia de 3 días y uso de las 5 herramientas DTF a 300 DPI.",
};

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-white/15 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Condiciones del Servicio · Secciones 02 y 10</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-wide uppercase">
              Términos y Condiciones de Uso
            </h1>
            <p className="text-sm text-neutral-400">
              Reglas de acceso, prueba gratuita de 5 días, cobro recurrente mensual y uso de las herramientas DTF
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-white hover:bg-white hover:text-black transition-all shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Clock className="h-4 w-4 text-emerald-400" />
              <span>1. Prueba Gratuita de 5 Días por Cuenta</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Cada cuenta nueva recibe automáticamente 5 días naturales de prueba gratuita con acceso completo a las 5 herramientas. Al finalizar los 5 días, las funciones de procesamiento se bloquean automáticamente hasta contratar una suscripción Premium activa.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>2. Suscripción Mensual y Renovación Automática</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              El plan Premium opera bajo cobro recurrente mensual automático mediante pasarela certificada. El sistema envía un recordatorio por correo aproximadamente 3 días antes de la fecha de renovación o vencimiento. El usuario puede cancelar o reactivar en cualquier momento desde Mi Cuenta.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <ShieldAlert className="h-4 w-4 text-amber-400" />
              <span>3. Periodo de Gracia de 3 Días Naturales</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Si el cobro mensual de renovación falla o queda pendiente, se otorgan 3 días naturales de gracia con aviso visible en pantalla y por correo para actualizar el método de pago. Si al concluir los 3 días no se regulariza el pago, la suscripción se suspende y se bloquean las herramientas sin borrar la cuenta.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>4. Alcance de las 5 Herramientas DTF a 300 DPI</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              La suscripción incluye uso de: (01) Remover Fondo, (02) Mejorar Calidad/Resolución, (03) Eliminar un Color, (04) Quitar Semitransparencias hasta 58 × 200 cm, y (05) Armador de Archivos DTF en formatos exactos de 58 × 100 cm y 58 × 200 cm, con salida PNG transparente a mínimo 300 DPI.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 sm:p-8 space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            Reglas de Operación, Límites Técnicos y Propiedad Intelectual
          </h2>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">A. Calidad y Validación de Archivos</h3>
            <p>
              La plataforma conserva el canal alfa real (RGBA) sin agregar fondos blancos, marcas de agua ni compresión destructiva. El sistema valida formatos (`PNG`, `JPG`, `WEBP`), dimensiones y errores antes de finalizar cada operación.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">B. Uso Adecuado y Límites del Servidor</h3>
            <p>
              Para garantizar la estabilidad al procesar pliegos grandes de hasta 58 × 200 cm a 300 DPI (`6850 × 23622 px`), el sistema aplica límites de seguridad por archivo (hasta 80 MB) y protección contra abuso automatizado de solicitudes.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">C. Responsabilidad sobre Diseños Subidos</h3>
            <p>
              El usuario declara contar con los derechos de uso o autorización de sus clientes sobre las imágenes y logotipos que procesa y arma para impresión textil DTF.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-neutral-400">
          <span>Privae Textil · Especificación Funcional 2026</span>
          <div className="flex items-center gap-4">
            <Link href="/privacidad" className="text-white underline hover:text-neutral-300">
              Ver Política de Privacidad
            </Link>
            <Link href="/guia" className="text-white underline hover:text-neutral-300">
              Manual del Taller
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
