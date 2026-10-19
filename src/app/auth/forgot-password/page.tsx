"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { AnimatedContent } from "@/components/AnimatedContent";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setResetUrl(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo procesar la solicitud.");
      }
      setSuccessMsg(data.message || "Enlace de recuperación generado.");
      if (data.resetUrl) setResetUrl(data.resetUrl);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 bg-black">
      <AnimatedContent distance={25} scale={0.96} duration={0.65} trigger="mount" className="w-full max-w-md">
        <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-black font-black text-xl mb-3 shadow-glow-white">
              P
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase">
              Recuperar Contraseña
            </h2>
            <p className="mt-1 text-xs text-neutral-400">
              Ingresa tu correo registrado para restablecer tu acceso a Privae Textil
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-neutral-900 border border-neutral-700 p-3 text-xs text-white">
              <AlertCircle className="h-4 w-4 shrink-0 text-white" />
              <span>{error}</span>
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-white/10 border border-white/20 p-4 text-xs text-white space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-white shrink-0" />
                  <span>Solicitud Procesada</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">{successMsg}</p>
                {resetUrl && (
                  <div className="pt-2">
                    <Link
                      href={resetUrl}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-white px-4 py-2.5 text-xs font-black text-black hover:bg-neutral-200 transition-all"
                    >
                      Restablecer Contraseña Ahora →
                    </Link>
                  </div>
                )}
              </div>

              <Link
                href="/auth/login"
                className="flex items-center justify-center gap-2 text-xs text-neutral-400 hover:text-white pt-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Volver a Iniciar Sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
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
                  "Enviar Enlace de Recuperación"
                )}
              </button>

              <div className="mt-4 text-center">
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio de sesión
                </Link>
              </div>
            </form>
          )}
        </div>
      </AnimatedContent>
    </div>
  );
}
