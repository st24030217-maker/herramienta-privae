"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  CreditCard,
  Clock,
  ShieldAlert,
  Search,
  CheckCircle2,
  RefreshCw,
  Crown,
  Activity,
  Settings,
  Mail,
  History,
  AlertTriangle,
  ExternalLink,
  Save,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  graceUsers: number;
  suspendedUsers: number;
  totalProcessings: number;
  errorProcessings: number;
}

interface AdminUserItem {
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
    planPrice: number;
  } | null;
  _count: {
    toolUsages: number;
    payments: number;
  };
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "users" | "payments" | "settings" | "support"
  >("users");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [recentUsages, setRecentUsages] = useState<any[]>([]);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Configuración dinámica del Plan y Pasarela (Sección 02 y 09)
  const [planPriceUsd, setPlanPriceUsd] = useState("19.99");
  const [stripePriceId, setStripePriceId] = useState("");
  const [fileRetentionMinutes, setFileRetentionMinutes] = useState("60");
  const [storeReturnUrl, setStoreReturnUrl] = useState("https://privaetextil.com");

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch(`/api/admin/users?search=${encodeURIComponent(search)}`).then((r) =>
        r.json()
      ),
    ])
      .then(([statsData, usersData]) => {
        if (statsData.stats) setStats(statsData.stats);
        if (statsData.recentPayments) setRecentPayments(statsData.recentPayments);
        if (statsData.recentUsages) setRecentUsages(statsData.recentUsages);
        if (statsData.recentEmails) setRecentEmails(statsData.recentEmails);
        if (statsData.auditLogs) setAuditLogs(statsData.auditLogs);
        if (statsData.config) {
          setPlanPriceUsd(String(statsData.config.planPriceUsd || 19.99));
          setStripePriceId(statsData.config.stripePriceId || "");
          setFileRetentionMinutes(
            String(statsData.config.fileRetentionMinutes || 60)
          );
          setStoreReturnUrl(
            statsData.config.storeReturnUrl || "https://privaetextil.com"
          );
        }
        if (usersData.users) setUsers(usersData.users);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleUpdateStatus = async (
    userId: string,
    newStatus: string,
    addDays?: number
  ) => {
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus, addDays }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "No se pudo actualizar el estado.");
      }
      setFeedback(
        "Estado del usuario actualizado y registrado en la bitácora de cambios."
      );
      loadData();
    } catch (err: any) {
      setFeedback(err.message || "Error al actualizar estado.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planPriceUsd,
          stripePriceId,
          fileRetentionMinutes,
          storeReturnUrl,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Error al guardar la configuración.");
      }
      setFeedback(
        "Configuración de precio del plan y pasarela guardada sin modificar código."
      );
      loadData();
    } catch (err: any) {
      setFeedback(err.message || "Error al guardar configuración.");
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-white space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-white" />
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Panel Administrativo · Privae Textil
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Gestión de usuarios, pruebas de 5 días, suscripciones, pagos de pasarela, configuración de precio y soporte técnico.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar Panel
        </button>
      </div>

      {feedback && (
        <div className="rounded-xl bg-neutral-900 border border-neutral-700 p-3.5 text-xs text-white flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-neutral-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Tarjetas de Métricas */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Usuarios</span>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Premium Activos</span>
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.activeSubscriptions}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">En Prueba 5D</span>
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.trialUsers}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">En Gracia 3D</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-300">
              {stats.graceUsers}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Suspendidos</span>
              <ShieldAlert className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="text-2xl font-black text-neutral-400">
              {stats.suspendedUsers}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-1">
              <span className="text-[11px] font-bold uppercase">Archivos / Errores</span>
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">
              {stats.totalProcessings}{" "}
              <span className="text-xs font-mono text-neutral-400">
                ({stats.errorProcessings} err)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Navegación por Pestañas del Panel Administrativo (Sección 09) */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3">
        {[
          {
            id: "users" as const,
            label: "1. Usuarios, Pruebas y Accesos",
            icon: Users,
          },
          {
            id: "payments" as const,
            label: "2. Pagos, Renovaciones y Fallos",
            icon: CreditCard,
          },
          {
            id: "settings" as const,
            label: "3. Configurar Precio / Pasarela",
            icon: Settings,
          },
          {
            id: "support" as const,
            label: "4. Soporte, Errores, Correos y Bitácora",
            icon: Activity,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                active
                  ? "bg-white text-black shadow"
                  : "bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* PESTAÑA 1: USUARIOS, FECHAS DE PRUEBA Y CONTROL DE ACCESO */}
      {activeTab === "users" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
              Ver y Buscar Usuarios · Control de Pruebas (5 Días) y Suscripciones
            </h2>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por correo o nombre..."
                className="w-full rounded-lg border border-neutral-800 bg-black py-2 pl-9 pr-3 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="border-b border-neutral-800 bg-black text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-3">Usuario</th>
                  <th className="py-3 px-3">Fecha de Alta</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Fin Prueba / Cobro</th>
                  <th className="py-3 px-3">Uso DTF</th>
                  <th className="py-3 px-3 text-right">Acciones de Acceso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500">
                      No se encontraron usuarios.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => {
                    const status = u.subscription?.status || "TRIAL";
                    return (
                      <tr key={u.id} className="hover:bg-neutral-900/50">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white">
                            {u.name || "Sin nombre"}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            {u.email}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-400 font-mono text-[11px]">
                          {new Date(u.createdAt).toLocaleDateString("es-MX")}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                              status === "ACTIVE"
                                ? "bg-white text-black border-white"
                                : status === "TRIAL"
                                ? "bg-neutral-900 text-white border-neutral-700"
                                : status === "GRACE_PERIOD"
                                ? "bg-amber-500/20 text-amber-300 border-amber-400/50"
                                : "bg-red-500/15 text-red-300 border-red-500/30"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-300 font-mono text-[11px]">
                          {status === "ACTIVE" && u.subscription?.currentPeriodEnd
                            ? `Renueva: ${new Date(
                                u.subscription.currentPeriodEnd
                              ).toLocaleDateString("es-MX")}`
                            : status === "GRACE_PERIOD" &&
                              u.subscription?.gracePeriodEndsAt
                            ? `Gracia: ${new Date(
                                u.subscription.gracePeriodEndsAt
                              ).toLocaleDateString("es-MX")}`
                            : u.subscription?.trialEndsAt
                            ? `Prueba: ${new Date(
                                u.subscription.trialEndsAt
                              ).toLocaleDateString("es-MX")}`
                            : "-"}
                        </td>
                        <td className="py-3 px-3 font-mono text-white font-bold">
                          {u._count.toolUsages} archivos
                        </td>
                        <td className="py-3 px-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleUpdateStatus(u.id, "ACTIVE")}
                            disabled={actionLoading}
                            className="rounded bg-white text-black px-2.5 py-1 text-[10px] font-bold hover:bg-neutral-200"
                          >
                            Activar Premium
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(u.id, "TRIAL", 5)}
                            disabled={actionLoading}
                            className="rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-[10px] font-bold text-neutral-200 hover:bg-neutral-800"
                          >
                            Dar 5D Prueba
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(u.id, "GRACE_PERIOD")
                            }
                            disabled={actionLoading}
                            className="rounded bg-amber-500/20 border border-amber-500/40 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-500/30"
                          >
                            Gracia 3D
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateStatus(u.id, "SUSPENDED")
                            }
                            disabled={actionLoading}
                            className="rounded bg-red-500/15 border border-red-500/30 px-2 py-1 text-[10px] font-bold text-red-300 hover:bg-red-500/25"
                          >
                            Suspender
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: PAGOS, RENOVACIONES Y FALLOS DE PASARELA */}
      {activeTab === "payments" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-300">
            Pagos, Renovaciones Mensuales y Fallos Reportados por la Pasarela (Stripe)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="border-b border-neutral-800 bg-black text-[11px] uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="py-3 px-3">Fecha</th>
                  <th className="py-3 px-3">Cliente</th>
                  <th className="py-3 px-3">Monto</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Referencia / Motivo de Fallo</th>
                  <th className="py-3 px-3 text-right">Recibo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {recentPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500">
                      No hay pagos ni fallos registrados todavía.
                    </td>
                  </tr>
                ) : (
                  recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-900/50">
                      <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">
                        {new Date(p.createdAt).toLocaleString("es-MX")}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-white">
                          {p.user?.name || "Cliente"}
                        </div>
                        <div className="text-[11px] text-neutral-400">
                          {p.user?.email}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-white">
                        ${Number(p.amount).toFixed(2)} {p.currency}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            p.status === "PAID"
                              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                              : "bg-red-500/15 text-red-300 border-red-500/30"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-neutral-400">
                        {p.failureReason || p.gatewayReference || "-"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {p.invoiceUrl ? (
                          <a
                            href={p.invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-white hover:underline"
                          >
                            <span>Ver</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PESTAÑA 3: CONFIGURACIÓN DEL PRECIO DEL PLAN Y PASARELA SIN MODIFICAR CÓDIGO */}
      {activeTab === "settings" && (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 max-w-2xl space-y-5">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">
              Configuración de Precio Mensual, Pasarela Stripe y Privacidad de Archivos
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Modifica el precio mensual de la suscripción Premium o el ID de precio de Stripe en tiempo real sin necesidad de modificar el código fuente.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Precio Mensual del Plan Premium (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                value={planPriceUsd}
                onChange={(e) => setPlanPriceUsd(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-sm font-mono text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Stripe Price ID (Opcional — ej. price_1Qxyz... si usas catálogo fijo en Stripe)
              </label>
              <input
                type="text"
                value={stripePriceId}
                onChange={(e) => setStripePriceId(e.target.value)}
                placeholder="Dejar vacío para usar el precio dinámico configurado arriba"
                className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                Eliminación Automática de Archivos Temporales (minutos)
              </label>
              <input
                type="number"
                min="5"
                max="1440"
                value={fileRetentionMinutes}
                onChange={(e) => setFileRetentionMinutes(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
              <span className="text-[11px] text-neutral-500 block mt-1">
                Los archivos se procesan en memoria privada por usuario y se purgan tras este periodo.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1">
                URL de Regreso a la Tienda Privae Textil
              </label>
              <input
                type="url"
                value={storeReturnUrl}
                onChange={(e) => setStoreReturnUrl(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-black px-3.5 py-2.5 text-xs font-mono text-white focus:border-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-xs font-black text-black hover:bg-neutral-200 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Guardar Configuración del Plan</span>
            </button>
          </form>
        </div>
      )}

      {/* PESTAÑA 4: SOPORTE TÉCNICO, ERRORES DE PROCESAMIENTO, CORREOS Y BITÁCORA DE CAMBIOS */}
      {activeTab === "support" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Uso Básico y Errores de Procesamiento */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Uso de las 5 Herramientas y Errores de Procesamiento</span>
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {recentUsages.length === 0 ? (
                <p className="text-xs text-neutral-500">Sin operaciones registradas.</p>
              ) : (
                recentUsages.map((u) => (
                  <div
                    key={u.id}
                    className="rounded-xl border border-neutral-800 bg-black p-3 text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-bold text-white">
                        {u.toolName} • {u.inputName || "Archivo DTF"}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        {u.user?.email} • {u.outputDpi} DPI{" "}
                        {u.canvasSize ? `• ${u.canvasSize}` : ""}
                      </div>
                      {u.errorMessage && (
                        <div className="text-[11px] text-red-400 mt-1">
                          Error: {u.errorMessage}
                        </div>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        u.status === "ERROR"
                          ? "bg-red-500/20 text-red-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {u.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Registro Básico de Cambios (AuditLog) y Correos Automáticos */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <History className="h-4 w-4" />
                <span>Registro Básico de Cambios Administrativos</span>
              </h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {auditLogs.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    Sin cambios administrativos registrados.
                  </p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-xl border border-neutral-800 bg-black p-2.5 text-xs"
                    >
                      <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                        <span>{log.action}</span>
                        <span>
                          {new Date(log.createdAt).toLocaleString("es-MX")}
                        </span>
                      </div>
                      <div className="text-white text-xs mt-0.5">
                        {log.targetUserEmail ? `${log.targetUserEmail}: ` : ""}
                        {log.details}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-neutral-800 bg-neutral-950 p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Eventos y Correos Automáticos Enviados (Sección 08)</span>
              </h3>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {recentEmails.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    Sin correos automáticos registrados.
                  </p>
                ) : (
                  recentEmails.map((em) => (
                    <div
                      key={em.id}
                      className="rounded-xl border border-neutral-800 bg-black p-2.5 text-xs"
                    >
                      <div className="flex justify-between font-mono text-[10px] text-neutral-400">
                        <span className="text-white font-bold">{em.eventType}</span>
                        <span>
                          {new Date(em.createdAt).toLocaleString("es-MX")}
                        </span>
                      </div>
                      <div className="text-neutral-300 text-[11px] truncate">
                        Para: {em.recipient} — {em.subject}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
