"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Sparkles,
  Clock,
  AlertTriangle,
  Lock,
  X,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export interface WelcomeUserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription?: {
    status: string;
    trialEndsAt: string;
    gracePeriodEndsAt: string | null;
    isAccessGranted: boolean;
    daysRemaining: number;
  };
}

interface UserWelcomeNotificationProps {
  user: WelcomeUserData | null;
}

export function UserWelcomeNotification({ user }: UserWelcomeNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || typeof window === "undefined") return;

    const triggerFlag = sessionStorage.getItem("privae_welcome_trigger");
    const lastWelcomedId = sessionStorage.getItem("privae_last_welcomed_user_id");

    // Se muestra si hubo login reciente o si cambió el usuario activo
    const shouldShow = triggerFlag === user.id || triggerFlag === "new_user" || lastWelcomedId !== user.id;

    if (shouldShow) {
      sessionStorage.setItem("privae_last_welcomed_user_id", user.id);
      sessionStorage.removeItem("privae_welcome_trigger");

      // Pequeño retardo para que la página termine de renderizarse suavemente
      const mountTimer = setTimeout(() => {
        setVisible(true);
        setProgress(100);
      }, 400);

      return () => clearTimeout(mountTimer);
    }
  }, [user?.id]);

  // Manejo de temporizador y barra de progreso de cierre automático
  useEffect(() => {
    if (!visible) return;

    const totalDuration = 8000; // 8 segundos
    const stepInterval = 50;
    const stepPercent = (stepInterval / totalDuration) * 100;

    progressIntervalRef.current = setInterval(() => {
      if (!isPaused) {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(progressIntervalRef.current!);
            setVisible(false);
            return 0;
          }
          return Math.max(0, prev - stepPercent);
        });
      }
    }, stepInterval);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [visible, isPaused]);

  if (!visible || !user) return null;

  // Lógica de personalización según el usuario (Rol, Estado de suscripción, Nombre/Email)
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const isAdmin = user.role === "ADMIN";
  const subStatus = user.subscription?.status || "TRIAL";
  const daysRemaining = user.subscription?.daysRemaining ?? 5;
  const isAccessGranted = user.subscription?.isAccessGranted ?? true;

  let config = {
    badgeIcon: <Sparkles className="h-3.5 w-3.5" />,
    badgeLabel: "CLIENTE PRIVAE",
    title: `¡Bienvenido, ${displayName}!`,
    subtitle: "Consola de Preparación y Salida DTF",
    description: "Acceso listo a las herramientas de preimpresión a 300 DPI de Privae Textil.",
    actionHref: "/tools/dtf-builder",
    actionLabel: "Armar Pliego 58 cm",
    pillTag: user.email,
  };

  if (isAdmin) {
    config = {
      badgeIcon: <Crown className="h-3.5 w-3.5 text-white" />,
      badgeLabel: "ADMINISTRADOR MASTER",
      title: `¡Bienvenido al Panel, ${displayName}!`,
      subtitle: "Consola Central de Administración",
      description: "Tienes control total sobre clientes, analítica de pagos, configuración de pasarela y auditoría técnica.",
      actionHref: "/admin",
      actionLabel: "Ir al Panel Admin",
      pillTag: "Acceso Maestro",
    };
  } else if (subStatus === "ACTIVE") {
    config = {
      badgeIcon: <ShieldCheck className="h-3.5 w-3.5 text-white" />,
      badgeLabel: "CLIENTE PREMIUM VIP",
      title: `¡Bienvenido de vuelta, ${displayName}!`,
      subtitle: "Membresía Activa · Salida Oficial 300 DPI",
      description: "Disfrutas de uso ilimitado en las 5 herramientas de preimpresión y armado de metros DTF sin restricciones.",
      actionHref: "/tools/dtf-builder",
      actionLabel: "Taller DTF (58 cm)",
      pillTag: "Plan Premium",
    };
  } else if (subStatus === "TRIAL" && isAccessGranted) {
    config = {
      badgeIcon: <Clock className="h-3.5 w-3.5 text-white" />,
      badgeLabel: `PRUEBA GRATIS (${daysRemaining} DÍAS)`,
      title: `¡Bienvenido a Privae, ${displayName}!`,
      subtitle: `Te restan ${daysRemaining} días de prueba gratuita`,
      description: "Todas las herramientas están desbloqueadas para remover fondos, escalar resolución y armar tus pliegos.",
      actionHref: "/tools/remove-bg",
      actionLabel: "Comenzar a Preparar",
      pillTag: `Vigencia: ${daysRemaining} días`,
    };
  } else if (subStatus === "GRACE" || subStatus === "GRACE_PERIOD") {
    config = {
      badgeIcon: <AlertTriangle className="h-3.5 w-3.5 text-white" />,
      badgeLabel: "PERIODO DE GRACIA",
      title: `¡Bienvenido, ${displayName}!`,
      subtitle: "Aviso de facturación pendiente",
      description: "Tus herramientas siguen habilitadas. Te sugerimos revisar tu método de pago en Mi Cuenta para evitar pausas.",
      actionHref: "/account",
      actionLabel: "Revisar Facturación",
      pillTag: "Actualización Requerida",
    };
  } else if (subStatus === "SUSPENDED" || (!isAccessGranted && subStatus === "TRIAL")) {
    config = {
      badgeIcon: <Lock className="h-3.5 w-3.5 text-white" />,
      badgeLabel: "CUENTA REGISTRADA",
      title: `Bienvenido de vuelta, ${displayName}`,
      subtitle: "Periodo de evaluación concluido",
      description: "Activa tu suscripción mensual para reanudar el procesamiento a 300 DPI y descarga de pliegos.",
      actionHref: "/account",
      actionLabel: "Activar Membresía",
      pillTag: "Pausa Temporal",
    };
  }

  const initialLetter = (displayName || "U").charAt(0).toUpperCase();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -18, scale: 0.96, transition: { duration: 0.2 } }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="fixed top-16 sm:top-20 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-md pointer-events-auto"
          role="status"
          aria-live="polite"
        >
          <div className="relative overflow-hidden rounded-2xl border border-neutral-700/80 bg-neutral-950/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl">
            {/* Header del Toast: Avatar + Badge + Botón Cerrar */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 font-black text-sm text-white shadow-sm">
                  {isAdmin ? <Crown className="h-5 w-5 text-white" /> : initialLetter}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-200">
                      {config.badgeIcon}
                      <span>{config.badgeLabel}</span>
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm sm:text-base font-bold text-white tracking-tight leading-snug">
                    {config.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setVisible(false)}
                className="rounded-lg border border-transparent p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-900 hover:border-neutral-800 transition-colors"
                title="Cerrar notificación"
                aria-label="Cerrar notificación"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mensaje descriptivo personalizado */}
            <div className="mt-3 space-y-2">
              <p className="text-xs text-neutral-300 leading-relaxed">
                {config.description}
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px] text-neutral-400">
                <span className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-neutral-300">
                  {user.email}
                </span>
                <span className="rounded-md border border-neutral-800 bg-neutral-900/80 px-2 py-0.5 text-neutral-300">
                  {config.pillTag}
                </span>
              </div>
            </div>

            {/* Acciones del Toast */}
            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-3">
              <span className="text-[10px] font-mono text-neutral-500">
                Privae Textil DTF
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisible(false)}
                  className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors"
                >
                  Entendido
                </button>

                <Link
                  href={config.actionHref}
                  onClick={() => setVisible(false)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition-all shadow-sm active:scale-95"
                >
                  <span>{config.actionLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Barra de progreso inferior de auto-dismiss */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-800 overflow-hidden">
              <div
                style={{ width: `${progress}%` }}
                className="h-full bg-white transition-[width] duration-75 ease-linear"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UserWelcomeNotification;
