"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, X } from "lucide-react";

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
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDismissed = sessionStorage.getItem("privae_banner_dismissed");
      if (isDismissed === "true") {
        setDismissed(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("privae_banner_dismissed", "true");
    }
  };

  if (dismissed || !status || status === "ACTIVE") return null;

  if (status === "GRACE_PERIOD") {
    return (
      <div className="bg-[#16181D] border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-200 relative">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 pr-8">
          <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Período de gracia:</strong> Restan <strong>{daysRemaining} días</strong> para regularizar el acceso al taller.
          </span>
          <Link
            href="/account"
            className="ml-2 font-mono font-semibold underline text-[#F3F4F6] hover:text-white"
          >
            Actualizar facturación
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400/70 hover:text-amber-200 p-1 rounded-md"
          title="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (status === "TRIAL" && !isAccessGranted) {
    return (
      <div className="bg-[#16181D] border-b border-[#20232A] px-4 py-2.5 text-center text-xs text-[#F3F4F6] relative">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-mono pr-8">
          <AlertTriangle className="h-4 w-4 text-[#00A3FF] shrink-0" />
          <span>
            Período de prueba concluido. Reactiva las herramientas de preimpresión.
          </span>
          <Link
            href="/account"
            className="ml-3 inline-flex items-center gap-1 rounded-lg bg-[#00A3FF] px-3 py-1 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors font-sans"
          >
            Activar cuenta
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-white p-1 rounded-md"
          title="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  if (status === "TRIAL" && daysRemaining <= 2) {
    return (
      <div className="bg-[#16181D] border-b border-[#20232A] px-4 py-2 text-center text-xs text-[#8E95A5] relative">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 font-mono text-[11px] pr-8">
          <Clock className="h-3.5 w-3.5 text-[#00A3FF] shrink-0" />
          <span>
            Quedan <strong className="text-[#F3F4F6]">{daysRemaining} días</strong> de prueba técnica.
          </span>
          <Link
            href="/account"
            className="ml-2 font-semibold text-[#00A3FF] underline hover:text-white"
          >
            Configurar plan
          </Link>
        </div>
        <button
          onClick={handleDismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E95A5] hover:text-white p-1 rounded-md"
          title="Ocultar aviso"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return null;
}

