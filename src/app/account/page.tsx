"use client";

import React, { useEffect, useState } from "react";
import {
  Crown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  CreditCard,
  Calendar,
  Mail,
  ExternalLink,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { AnimatedContent } from "@/components/AnimatedContent";

interface UserAccountData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  subscription: {
    status: string;
    trialEndsAt: string;
    gracePeriodEndsAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
    planPrice: number;
    paymentMethodBrand: string | null;
    paymentMethodLast4: string | null;
    stripeSubscriptionId: string | null;
    isAccessGranted: boolean;
    daysRemaining: number;
  };
  payments?: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    invoiceUrl: string | null;
    failureReason: string | null;
    createdAt: string;
  }>;
  emailLogs?: Array<{
    id: string;
    eventType: string;
    subject: string;
    status: string;
    createdAt: string;
  }>;
}

export default function AccountPage() {
  const [user, setUser] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const fetchUserData = () => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUserData();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("payment") === "success") {
        setFeedback({
          text: "¡Pago aprobado con éxito en Stripe! Tu suscripción Premium está activa.",
          type: "success",
        });
        window.history.replaceState({}, "", "/account");
      } else if (params.get("payment") === "cancelled") {
        setFeedback({
          text: "El proceso de suscripción en Stripe fue cancelado.",
          type: "info",
        });
        window.history.replaceState({}, "", "/account");
      }
    }
  }, []);

  const handleStripeCheckout = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo iniciar el checkout de Stripe.");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setFeedback({
        text: err.message || "Error al conectar con Stripe.",
        type: "error",
      });
      setActionLoading(false);
    }
  };

  const handleStripePortal = async () => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.error || "No se pudo abrir el portal de facturación."
        );
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setFeedback({
        text: err.message || "Error al conectar con el portal de Stripe.",
        type: "error",
      });
      setActionLoading(false);
    }
  };

  const handleManageSubscription = async (action: "cancel" | "reactivate") => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/subscription/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar la suscripción.");
      }
      setFeedback({
        text: data.message || "Suscripción actualizada correctamente.",
        type: "success",
      });
      fetchUserData();
    } catch (err: any) {
      setFeedback({
        text: err.message || "Error al gestionar la suscripción.",
        type: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-white" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-white">Sesión no iniciada</h2>
        <p className="mt-2 text-xs text-neutral-400">
          Por favor inicia sesión para ver tu estado de prueba y suscripción.
        </p>
      </div>
    );
  }

  const sub = user.subscription;
  const priceFormatted = `$${(sub.planPrice || 19.99).toFixed(2)} USD/mes`;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      <AnimatedContent distance={20} trigger="mount">
        <div className="border-b border-neutral-800 pb-5">
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Área de Usuario · Mi Cuenta & Suscripción
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Consulta el estado de tu prueba de 5 días, tu suscripción Premium, próxima fecha de cobro, método de pago y opciones de cancelación o reactivación.
          </p>
        </div>
      </AnimatedContent>

      {/* Aviso prioritario si está en los 3 días naturales de gracia por pago fallido */}
      {sub.status === "GRACE_PERIOD" && (
        <div className="rounded-2xl border-2 border-amber-400/70 bg-amber-500/10 p-5 text-amber-100 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-amber-300 text-sm uppercase">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Aviso de Pago Pendiente — Periodo de Gracia Activo (3 Días Naturales)</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Tu último cobro de renovación falló o quedó pendiente. Tienes{" "}
              <strong>{sub.daysRemaining} día(s) restantes de gracia</strong> para actualizar tu método de pago o realizar el cobro antes de que se suspenda el acceso a las herramientas Premium.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleStripeCheckout}
              disabled={actionLoading}
              className="rounded-xl bg-white px-4 py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition-all"
            >
              Realizar Pago Ahora
            </button>
            <button
              onClick={handleStripePortal}
              disabled={actionLoading}
              className="rounded-xl border border-amber-300/50 bg-black/50 px-4 py-2.5 text-xs font-bold text-white hover:bg-black/80 transition-all"
            >
              Actualizar Tarjeta
            </button>
          </div>
        </div>
      )}

      {/* Aviso si la prueba de 5 días o el periodo de gracia terminó */}
      {!sub.isAccessGranted && (
        <div className="rounded-2xl border-2 border-red-500/60 bg-red-500/10 p-5 text-red-100 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-black text-red-300 text-sm uppercase">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>Acceso a Herramientas Premium Bloqueado</span>
            </div>
            <p className="text-xs text-red-100/90 leading-relaxed">
              {sub.status === "SUSPENDED"
                ? "Finalizaron los 3 días de gracia sin regularizar el pago. Tu cuenta sigue conservada: reactiva tu suscripción para volver a procesar archivos."
                : "Tu prueba gratuita de 5 días ha terminado. Contrata tu suscripción Premium mensual para desbloquear los 5 módulos a 300 DPI."}
            </p>
          </div>
          <button
            onClick={handleStripeCheckout}
            disabled={actionLoading}
            className="rounded-xl bg-white px-5 py-3 text-xs font-black text-black hover:bg-neutral-200 transition-all shrink-0 shadow-glow-white"
          >
            Activar Suscripción Premium ({priceFormatted})
          </button>
        </div>
      )}

      {feedback && (
        <div
          className={`flex items-center justify-between gap-2 rounded-lg p-3.5 text-xs border ${
            feedback.type === "success"
              ? "bg-white/10 border-white/20 text-white"
              : "bg-red-500/10 border-red-500/30 text-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="hover:opacity-70 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      <AnimatedContent distance={25} delay={0.1} trigger="mount">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Tarjeta de Perfil y Estado de Acceso */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-lg shrink-0">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="truncate">
                <h3 className="font-bold text-white text-base truncate">
                  {user.name || "Usuario Privae"}
                </h3>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-800 space-y-2.5 text-xs text-neutral-400">
              <div className="flex items-center justify-between">
                <span>Fecha de alta:</span>
                <strong className="text-white font-mono">
                  {new Date(user.createdAt).toLocaleDateString("es-MX")}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Rol de cuenta:</span>
                <strong className="text-white font-mono">{user.role}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Acceso 5 Herramientas:</span>
                <strong
                  className={
                    sub.isAccessGranted
                      ? "text-emerald-400 font-bold"
                      : "text-red-400 font-bold"
                  }
                >
                  {sub.isAccessGranted ? "ACTIVO (300 DPI)" : "BLOQUEADO"}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Método de pago:</span>
                <strong className="text-white font-mono">
                  {sub.paymentMethodLast4
                    ? `${(sub.paymentMethodBrand || "Tarjeta").toUpperCase()} •••• ${sub.paymentMethodLast4}`
                    : "Pasarela Stripe"}
                </strong>
              </div>
            </div>
          </div>

          {/* Tarjeta Principal de Suscripción, Fechas de Cobro y Acciones */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:col-span-2 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Estado de Prueba / Suscripción Mensual
              </h3>

              {sub.status === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-3 py-1 text-xs font-bold">
                  <Crown className="h-3.5 w-3.5" /> Suscripción Premium Activa
                </span>
              ) : sub.status === "GRACE_PERIOD" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 px-3 py-1 text-xs font-bold border border-amber-400/50">
                  <AlertTriangle className="h-3.5 w-3.5" /> Periodo de Gracia (3 Días)
                </span>
              ) : sub.status === "TRIAL" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1 text-xs font-bold border border-neutral-700">
                  <Clock className="h-3.5 w-3.5" /> Prueba Gratuita (5 Días)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 text-red-300 px-3 py-1 text-xs font-bold border border-red-500/30">
                  {sub.status === "SUSPENDED" ? "Suspendida por Falta de Pago" : "Finalizada / Cancelada"}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl bg-black p-4 border border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-500 block mb-1">Días Restantes:</span>
                <span className="font-mono text-lg font-bold text-white">
                  {sub.daysRemaining} días
                </span>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">
                  {sub.status === "ACTIVE"
                    ? sub.cancelAtPeriodEnd
                      ? "Fecha de Cancelación:"
                      : "Próxima Fecha de Cobro:"
                    : sub.status === "GRACE_PERIOD"
                    ? "Fin de los 3 Días de Gracia:"
                    : "Fin de Prueba (5 Días):"}
                </span>
                <span className="font-mono text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                  {sub.status === "ACTIVE" && sub.currentPeriodEnd
                    ? new Date(sub.currentPeriodEnd).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : sub.status === "GRACE_PERIOD" && sub.gracePeriodEndsAt
                    ? new Date(sub.gracePeriodEndsAt).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : new Date(sub.trialEndsAt).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                </span>
              </div>

              <div>
                <span className="text-neutral-500 block mb-1">Costo del Plan:</span>
                <span className="font-mono text-sm font-bold text-white">
                  {priceFormatted}
                </span>
                <span className="block text-[10px] text-neutral-500">
                  {sub.cancelAtPeriodEnd
                    ? "Renovación automática desactivada"
                    : "Renovación mensual automática"}
                </span>
              </div>
            </div>

            {/* Acciones de Suscripción, Método de Pago y Cancelación / Reactivación */}
            <div className="pt-1 flex flex-wrap items-center gap-3">
              {sub.status !== "ACTIVE" ? (
                <button
                  onClick={handleStripeCheckout}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black text-black hover:bg-neutral-200 transition-all shadow-glow-white disabled:opacity-50"
                >
                  {actionLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  <span>
                    {sub.status === "SUSPENDED" || sub.status === "CANCELED"
                      ? `Reactivar Suscripción Premium (${priceFormatted})`
                      : `Contratar Suscripción Premium (${priceFormatted})`}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleStripePortal}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition-all disabled:opacity-50"
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Método de Pago y Facturas (Stripe)</span>
                  </button>

                  {sub.cancelAtPeriodEnd ? (
                    <button
                      onClick={() => handleManageSubscription("reactivate")}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Reactivar Renovación Automática</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleManageSubscription("cancel")}
                      disabled={actionLoading}
                      className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-xs font-bold text-neutral-300 hover:border-red-500/50 hover:text-red-300 transition-all disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Cancelar Suscripción</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </AnimatedContent>

      {/* Historial de Pagos y Notificaciones Automáticas */}
      <AnimatedContent distance={25} delay={0.18} trigger="mount">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Historial de Pagos */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-white" />
                <span>Historial de Cobros y Renovaciones</span>
              </h3>
            </div>

            {!user.payments || user.payments.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                Aún no se registran cobros en tu cuenta.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {user.payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-neutral-800 bg-black p-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white">
                        ${p.amount.toFixed(2)} {p.currency}
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        {new Date(p.createdAt).toLocaleDateString("es-MX")}
                        {p.failureReason ? ` • ${p.failureReason}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                          p.status === "PAID"
                            ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                            : "bg-red-500/15 text-red-300 border-red-500/30"
                        }`}
                      >
                        {p.status === "PAID" ? "APROBADO" : "FALLIDO"}
                      </span>
                      {p.invoiceUrl && (
                        <a
                          href={p.invoiceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-white"
                          title="Ver recibo"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Avisos y Correos Enviados */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-white" />
                <span>Avisos y Correos de tu Cuenta</span>
              </h3>
            </div>

            {!user.emailLogs || user.emailLogs.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4 text-center">
                No hay notificaciones recientes registradas.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {user.emailLogs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-neutral-800 bg-black p-3 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded">
                        {log.eventType}
                      </span>
                      <span className="font-mono text-[10px] text-neutral-500">
                        {new Date(log.createdAt).toLocaleDateString("es-MX")}
                      </span>
                    </div>
                    <p className="text-neutral-300 text-xs">{log.subject}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}
