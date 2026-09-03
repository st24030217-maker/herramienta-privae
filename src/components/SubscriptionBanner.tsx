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
      <div className="bg-[#16181D] border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Período de gracia activo:</strong> Restan <strong>{daysRemaining} días</strong> para regularizar el acceso al taller.
          </span>
          <Link
            href="/account"
            className="ml-2 font-mono font-semibold underline text-[#F3F4F6] hover:text-white"
          >
            Actualizar facturación
          </Link>
        </div>
      </div>
    );
  }

  if (status === "TRIAL" && !isAccessGranted) {
    return (
      <div className="bg-[#16181D] border-b border-[#20232A] px-4 py-3 text-center text-xs text-[#F3F4F6]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-mono">
          <AlertTriangle className="h-4 w-4 text-[#00A3FF] shrink-0" />
          <span>
            El período de prueba de 5 días ha concluido. Reactiva las herramientas de preimpresión.
          </span>
          <Link
            href="/account"
            className="ml-3 inline-flex items-center gap-1 rounded bg-[#00A3FF] px-3 py-1 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors font-sans"
          >
            Activar cuenta de producción
          </Link>
        </div>
      </div>
    );
  }

  if (status === "TRIAL" && daysRemaining <= 2) {
    return (
      <div className="bg-[#16181D] border-b border-[#20232A] px-4 py-2 text-center text-xs text-[#8E95A5]">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-mono text-[11px]">
          <Clock className="h-3.5 w-3.5 text-[#00A3FF] shrink-0" />
          <span>
            Quedan <strong className="text-[#F3F4F6]">{daysRemaining} días</strong> de prueba técnica.
          </span>
          <Link
            href="/account"
            className="ml-2 font-semibold text-[#00A3FF] underline hover:text-white"
          >
            Configurar plan continuo
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
