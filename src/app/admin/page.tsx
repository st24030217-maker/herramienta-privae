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
  Activity
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  trialUsers: number;
  suspendedUsers: number;
  totalProcessings: number;
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
  } | null;
  _count: {
    toolUsages: number;
    payments: number;
  };
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch(`/api/admin/users?search=${encodeURIComponent(search)}`).then((r) => r.json()),
    ])
      .then(([statsData, usersData]) => {
        if (statsData.stats) setStats(statsData.stats);
        if (usersData.users) setUsers(usersData.users);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleUpdateStatus = async (userId: string, newStatus: string, addDays?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newStatus, addDays }),
      });
      if (res.ok) {
        setFeedback("Estado del usuario actualizado correctamente.");
        loadData();
      }
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-black text-white">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-white" />
            <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
              Panel Administrativo Privae Textil
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            Control de usuarios, estado de pruebas de 5 días, suscripciones y métricas de procesamiento.
          </p>
        </div>

        <button
          onClick={loadData}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-neutral-800"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Actualizar Datos
        </button>
      </div>

      {feedback && (
        <div className="mb-6 rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-xs text-white flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-white" /> {feedback}
        </div>
      )}

      {/* Tarjetas de Métricas en B&W */}
      {stats && (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Usuarios</span>
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Suscritos</span>
              <CreditCard className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.activeSubscriptions}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">En Prueba</span>
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.trialUsers}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Suspendidos</span>
              <ShieldAlert className="h-4 w-4 text-neutral-500" />
            </div>
            <div className="text-2xl font-black text-neutral-400">{stats.suspendedUsers}</div>
          </div>

          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
            <div className="flex items-center justify-between text-neutral-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Procesados</span>
              <Activity className="h-4 w-4 text-white" />
            </div>
            <div className="text-2xl font-black text-white">{stats.totalProcessings}</div>
          </div>
        </div>
      )}

      {/* Buscador de Usuarios */}
      <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Listado y Gestión de Clientes
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

        {/* Tabla de Usuarios */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-neutral-300">
            <thead className="border-b border-neutral-800 bg-black text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Registro</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Fin Prueba / Renovación</th>
                <th className="py-3 px-4">Uso (DTF)</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-850">
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
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{u.name || "Sin nombre"}</div>
                        <div className="text-[11px] text-neutral-400">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            status === "ACTIVE"
                              ? "bg-white text-black border-white"
                              : status === "TRIAL"
                              ? "bg-neutral-900 text-white border-neutral-700"
                              : status === "GRACE_PERIOD"
                              ? "bg-neutral-800 text-white border-white"
                              : "bg-black text-neutral-500 border-neutral-800 line-through"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-400 font-mono text-[11px]">
                        {u.subscription?.trialEndsAt
                          ? new Date(u.subscription.trialEndsAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-white font-bold">
                        {u._count.toolUsages} archivos
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5">
                        <button
                          onClick={() => handleUpdateStatus(u.id, "ACTIVE")}
                          disabled={actionLoading}
                          title="Activar Acceso Premium"
                          className="rounded bg-white text-black px-2 py-1 text-[10px] font-bold hover:bg-neutral-200"
                        >
                          Activar Premium
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(u.id, "SUSPENDED")}
                          disabled={actionLoading}
                          title="Suspender Usuario"
                          className="rounded bg-neutral-900 border border-neutral-700 px-2 py-1 text-[10px] font-bold text-neutral-400 hover:text-white"
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
    </div>
  );
}
