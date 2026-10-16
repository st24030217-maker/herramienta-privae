import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Trash2, Server, CreditCard, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Política de Privacidad y Protección de Archivos | Privae Textil DTF",
  description:
    "Política de privacidad, confidencialidad de diseños, eliminación automática de archivos y seguridad de datos de Privae Textil.",
};

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between border-b border-white/15 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Cumplimiento de Seguridad y Operación · Sección 10</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-wide uppercase">
              Política de Privacidad y Protección de Diseños
            </h1>
            <p className="text-sm text-neutral-400">
              Plataforma Web Premium para Preparación de Imágenes y DTF — Privae Textil
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
              <Lock className="h-4 w-4 text-emerald-400" />
              <span>1. Privacidad Estricta de los Archivos del Cliente</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Todos los diseños, logotipos, fotografías y pliegos DTF (hasta 58 × 200 cm a 300 DPI) subidos por el usuario son 100% privados y propiedad exclusiva del cliente. Ningún otro usuario puede acceder, visualizar ni descargar archivos ajenos.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Trash2 className="h-4 w-4 text-emerald-400" />
              <span>2. Procesamiento en Memoria y Eliminación Automática</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Las 5 herramientas procesan los buffers RGBA directamente en memoria RAM del servidor y devuelven el archivo PNG a 300 DPI al instante. Los originales y resultados temporales se purgan automáticamente tras el periodo de retención configurado en el Panel Administrativo (por defecto 60 minutos).
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              <span>3. No Almacenamiento de Tarjetas Bancarias</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Cumpliendo el estándar de seguridad PCI-DSS, esta aplicación jamás almacena números completos de tarjetas, códigos CVV ni datos bancarios sensibles. Todo cobro recurrente mensual se procesa directamente a través de la pasarela certificada Stripe.
            </p>
          </div>

          <div className="rounded-2xl border border-white/15 bg-neutral-950 p-5 space-y-2">
            <div className="flex items-center gap-2 text-white font-bold">
              <Server className="h-4 w-4 text-emerald-400" />
              <span>4. Cifrado de Contraseñas y Sesiones Seguras</span>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Las contraseñas se almacenan únicamente mediante hash criptográfico irreversible (`bcrypt`). Las sesiones de usuario utilizan cookies seguras `HttpOnly` firmadas con JWT sobre HTTPS, con control de acceso por cuenta y protección contra abuso de carga (`rate-limit`).
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 sm:p-8 space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <h2 className="text-xl font-black text-white uppercase tracking-wide">
            Detalle del Tratamiento de Datos y Comunicaciones
          </h2>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">A. Datos Recopilados</h3>
            <p>
              Recopilamos únicamente el nombre o nombre del taller, correo electrónico, contraseña cifrada, estado de la prueba gratuita de 5 días, estado de la suscripción mensual e historial técnico básico de operaciones (herramienta utilizada, nombre de archivo de referencia, fecha y resolución de salida 300 DPI) para brindar soporte técnico.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">B. Correos Transaccionales Automáticos</h3>
            <p>
              Al registrarte, autorizas el envío exclusivo de correos transaccionales operativos relacionados con tu cuenta:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-neutral-300">
              <li>Bienvenida e inicio de tu prueba gratuita de 5 días.</li>
              <li>Aviso de finalización del periodo de prueba gratuita.</li>
              <li>Recordatorio automático 3 días antes de la fecha de renovación o cobro mensual.</li>
              <li>Confirmación de pago aprobado y continuidad del servicio Premium.</li>
              <li>Aviso inmediato de pago fallido e inicio del periodo de gracia de 3 días naturales.</li>
              <li>Aviso de suspensión al concluir el periodo de gracia con enlace para reactivar tu cuenta.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white uppercase">C. Conservación de la Cuenta tras Vencimiento</h3>
            <p>
              Si tu prueba de 5 días concluye o finalizan los 3 días naturales de gracia tras un pago pendiente, las herramientas Premium se bloquearán temporalmente pero tu cuenta no será eliminada de inmediato, permitiéndote reactivar tu suscripción en cualquier momento sin perder tu configuración.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-xs text-neutral-400">
          <span>Privae Textil · Especificación Funcional 2026</span>
          <div className="flex items-center gap-4">
            <Link href="/terminos" className="text-white underline hover:text-neutral-300">
              Ver Términos y Condiciones de Uso
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
