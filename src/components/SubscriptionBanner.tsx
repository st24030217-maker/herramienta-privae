"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Sparkles } from "lucide-react";

interface SubscriptionBannerProps {
  status?: string;
  daysRemaining?: number;
  isAccessGranted?: boolean;
}

export function SubscriptionBanner({
  status,
  daysRemaining = 0,
  isAccessGranted = true,
}: SubscriptionBannerProps) {
  if (!status || status === "ACTIVE") return null;

  if (status === "GRACE_PERIOD") {
    return (
      <div className="bg-neutral-900 border-b border-neutral-700 px-4 py-2.5 text-center text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-white shrink-0" />
          <span>
            <strong>Aviso de Pago Pendiente:</strong> Cuentas con <strong>{daysRemaining} días de gracia</strong> antes de la suspensión de tus herramientas.
          </span>
          <Link
            href="/account"
            className="ml-2 font-bold underline hover:text-neutral-300"
          >
            Actualizar método de pago →
          </Link>
        </div>
      </div>
    );
  }

  if (status === "TRIAL" && !isAccessGranted) {
    return (
      <div className="bg-neutral-950 border-b border-neutral-800 px-4 py-3 text-center text-xs text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-white shrink-0" />
          <span>
            <strong>Tu prueba gratuita de 5 días ha concluido.</strong> Desbloquea acceso ilimitado a todas las herramientas DTF.
          </span>
          <Link
            href="/account"
            className="ml-3 inline-flex items-center gap-1 rounded bg-white px-3 py-1 text-xs font-bold text-black hover:bg-neutral-200"
          >
            <Sparkles className="h-3 w-3" /> Activar Plan Premium
          </Link>
        </div>
      </div>
    );
  }

  if (status === "TRIAL" && daysRemaining <= 2) {
    return (
      <div className="bg-neutral-900 border-b border-neutral-800 px-4 py-2 text-center text-xs text-neutral-300">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <Clock className="h-3.5 w-3.5 text-white shrink-0" />
          <span>
            Te quedan <strong>{daysRemaining} días</strong> de tu prueba gratuita.
          </span>
          <Link
            href="/account"
            className="ml-2 font-bold text-white underline hover:text-neutral-300"
          >
            Suscríbete ahora para no perder acceso
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
