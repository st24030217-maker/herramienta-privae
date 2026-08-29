"use client";

import React, { useEffect, useState } from "react";
import { 
  Crown, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw,
  Sparkles
} from "lucide-react";

interface UserAccountData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  subscription: {
    status: string;
    trialEndsAt: string;
    gracePeriodEndsAt: string | null;
    isAccessGranted: boolean;
    daysRemaining: number;
  };
}

export default function AccountPage() {
  const [user, setUser] = useState<UserAccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchUserData = () => {
    fetch("/api/auth/me")
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
  }, []);

  const handleSimulateSubscription = async (action: string) => {
    setActionLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscription/simulate-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setMessage("¡Operación completada con éxito!");
        fetchUserData();
      }
    } catch {
      setMessage("Error al realizar la acción.");
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
          Por favor inicia sesión para ver tu estado de suscripción.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 border-b border-neutral-800 pb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
          Mi Cuenta & Membresía
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-neutral-400">
          Gestiona el estado de tu prueba, suscripción recurrente y métodos de pago de Privae Textil.
        </p>
      </div>

      {message && (
        <div className="mb-6 flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-xs text-white">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-white" />
          <span>{message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Tarjeta de Información de Usuario */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:col-span-1">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-lg mb-4">
            {user.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <h3 className="font-bold text-white text-base truncate">{user.name || "Usuario"}</h3>
          <p className="text-xs text-neutral-400 truncate">{user.email}</p>
          <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs text-neutral-400">
            <div>
              Rol: <strong className="text-white">{user.role}</strong>
            </div>
            <div>
              Acceso a herramientas:{" "}
              <strong className={user.subscription.isAccessGranted ? "text-white underline" : "text-neutral-500 line-through"}>
                {user.subscription.isAccessGranted ? "Habilitado" : "Bloqueado"}
              </strong>
            </div>
          </div>
        </div>

        {/* Tarjeta de Estado de Suscripción */}
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 md:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Estado de Membresía
            </h3>

            {user.subscription.status === "ACTIVE" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-3 py-1 text-xs font-bold">
                <Crown className="h-3.5 w-3.5" /> Plan Premium Activo
              </span>
            ) : user.subscription.status === "GRACE_PERIOD" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1 text-xs font-bold border border-white">
                <AlertTriangle className="h-3.5 w-3.5" /> Gracia (3 Días)
              </span>
            ) : user.subscription.status === "TRIAL" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-3 py-1 text-xs font-bold border border-neutral-700">
                <Clock className="h-3.5 w-3.5" /> Prueba 5 Días
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-neutral-400 px-3 py-1 text-xs font-bold border border-neutral-800">
                Inactivo
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl bg-black p-4 border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 block mb-0.5">Días Restantes de Acceso:</span>
              <span className="font-mono text-base font-bold text-white">
                {user.subscription.daysRemaining} días
              </span>
            </div>

            <div>
              <span className="text-neutral-500 block mb-0.5">Fecha Fin de Prueba:</span>
              <span className="font-mono text-xs text-neutral-300">
                {new Date(user.subscription.trialEndsAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {user.subscription.status !== "ACTIVE" ? (
              <button
                onClick={() => handleSimulateSubscription("SUBSCRIBE_MONTHLY")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-xs font-bold text-black hover:bg-neutral-200 transition-all shadow-glow-white"
              >
                <Sparkles className="h-4 w-4" /> Suscribirme al Plan Premium ($19.99/mes)
              </button>
            ) : (
              <button
                onClick={() => handleSimulateSubscription("CANCEL_SUBSCRIPTION")}
                disabled={actionLoading}
                className="rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
              >
                Cancelar Suscripción
              </button>
            )}

            <button
              onClick={() => handleSimulateSubscription("RESET_TRIAL")}
              disabled={actionLoading}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
            >
              Reiniciar 5 Días de Prueba (Demo)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
