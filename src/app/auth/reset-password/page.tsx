"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { AnimatedContent } from "@/components/AnimatedContent";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setEmail(searchParams.get("email") || "");
    setToken(searchParams.get("token") || "");
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo restablecer la contraseña.");
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
      <div className="mb-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-xl mb-3 shadow-glow-white">
          P
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white uppercase">
          Nueva Contraseña
        </h2>
        <p className="mt-1 text-xs text-neutral-400">
          Define tu nueva contraseña segura para entrar a Privae Textil
        </p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-xs text-white">
          <AlertCircle className="h-4 w-4 shrink-0 text-white" />
          <span>{error}</span>
        </div>
      )}

      {success ? (
        <div className="rounded-lg bg-white/10 border border-white/20 p-4 text-xs text-white text-center space-y-2">
          <CheckCircle2 className="h-6 w-6 text-white mx-auto" />
          <p className="font-bold">¡Contraseña actualizada con éxito!</p>
          <p className="text-neutral-300">Redirigiendo al inicio de sesión...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-neutral-800 bg-black py-2 px-3 text-xs text-white focus:border-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 mb-1">
              Nueva Contraseña (mín. 6 caracteres)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-800 bg-black py-2 pl-9 pr-3 text-xs text-white focus:border-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Guardar Nueva Contraseña"
            )}
          </button>

          <div className="text-center pt-2">
            <Link href="/auth/login" className="text-xs text-neutral-400 hover:text-white">
              Cancelar y volver a Iniciar Sesión
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-black">
      <AnimatedContent distance={25} scale={0.96} duration={0.65} trigger="mount" className="w-full max-w-md">
        <Suspense fallback={<div className="text-center text-white text-xs">Cargando...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </AnimatedContent>
    </div>
  );
}
