"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import CardNav from "@/components/CardNav";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { UserWelcomeNotification } from "./UserWelcomeNotification";

interface UserData {
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

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUserData(data.user);
        } else {
          setUserData(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("privae_last_welcomed_user_id");
        sessionStorage.removeItem("privae_welcome_trigger");
      }
    } catch {}
    await fetch("/api/auth/logout", { method: "POST" });
    setUserData(null);
    window.location.href = "/auth/login";
  };

  const storeUrl = process.env.NEXT_PUBLIC_STORE_URL || "https://privaetextil.com";

  // Estructura de tarjetas con animación Spring de CardNav (@react-bits)
  const cardNavItems = [
    {
      label: "01 & 02 Preparación",
      description: "Remoción de fondo y superresolución 300 DPI.",
      links: [
        { label: "01 · Remover Fondo", href: "/tools/remove-bg" },
        { label: "02 · Mejorar Calidad", href: "/tools/enhance" },
      ],
    },
    {
      label: "03 & 04 Alfa & Color",
      description: "Cuentagotas selector y eliminación de semitransparencias.",
      links: [
        { label: "03 · Eliminar Color", href: "/tools/remove-color" },
        { label: "04 · Quitar Semitransparencias", href: "/tools/clean-alpha" },
      ],
    },
    {
      label: "05 & 06 Taller DTF",
      description: "Armador de pliegos 58cm, escáner y tienda oficial.",
      links: [
        { label: "05 · Armador de Pliegos DTF", href: "/tools/dtf-builder" },
        { label: "06 · Escáner de Calidad DTF", href: "/tools/scanner" },
        { label: "← Tienda Oficial Privae Textil", href: storeUrl },
        { label: "Manual y Guía de Uso", href: "/guia" },
      ],
    },
    {
      label: userData ? (userData.name || "Usuario DTF") : "Cuenta Privae",
      description: userData
        ? `${userData.email} · ${
            userData.role === "ADMIN"
              ? "Administrador"
              : userData.subscription.status === "ACTIVE"
              ? "Plan Premium Activo"
              : `Prueba (${userData.subscription.daysRemaining} días)`
          }`
        : "Acceso técnico y registro gratuito.",
      links: userData
        ? [
            { label: "Mi Cuenta & Suscripción", href: "/account" },
            ...(userData.role === "ADMIN"
              ? [{ label: "Panel Administrador", href: "/admin" }]
              : []),
            { label: "Cerrar Sesión", href: "#", onClick: handleLogout },
          ]
        : [
            { label: "Iniciar Sesión", href: "/auth/login" },
            { label: "Registrarse (5 Días Gratis)", href: "/auth/register" },
          ],
    },
  ];

  const ctaConfig = userData
    ? {
        label: userData.role === "ADMIN" ? "Admin" : "Mi Cuenta",
        href: userData.role === "ADMIN" ? "/admin" : "/account",
      }
    : {
        label: "Prueba 5 Días",
        href: "/auth/register",
      };

  return (
    <>
      {/* Barra de utilidades superior discreta */}
      <div className="w-full bg-[#0A0B0E]/80 border-b border-white/5 py-1 px-4 text-center select-none text-[10px] font-mono text-neutral-400 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            ← Ir a Tienda Oficial Privae Textil
          </a>
        </div>
        <div className="hidden sm:flex items-center gap-3">
          <span>Estándar DTF: 58 cm</span>
          <span className="text-neutral-600">·</span>
          <span>Resolución: 300 DPI</span>
          <span className="text-neutral-600">·</span>
          <span>Transparencia Real</span>
        </div>
        <div className="flex items-center gap-2">
          {userData ? (
            <span className="text-neutral-300">
              {userData.role === "ADMIN" ? "ADMINISTRADOR" : "USUARIO DTF"}
            </span>
          ) : (
            <Link href="/auth/login" className="hover:text-white transition-colors">
              Ingresar
            </Link>
          )}
        </div>
      </div>

      {/* HEADER PRINCIPAL FLOTANTE CON CARDNAV (@react-bits) */}
      <header className="sticky top-2 z-50 w-full px-3 sm:px-6 pointer-events-none">
        <div className="pointer-events-auto max-w-5xl mx-auto">
          <CardNav
            logo="/logo.png"
            logoAlt="Privae Textil"
            logoHref="/"
            items={cardNavItems}
            cta={ctaConfig}
            theme="dark"
            surface="glass"
            cardEffect="rise"
            stagger={0.08}
            bounce={0.16}
            speed={1.05}
            cardHeight={210}
            maxWidth={980}
            linkComponent={Link as any}
            ariaLabel="Navegación Privae DTF"
          />
        </div>
      </header>

      {/* Banner de Estado de Suscripción si aplica */}
      {userData?.subscription && (
        <SubscriptionBanner
          status={userData.subscription.status}
          daysRemaining={userData.subscription.daysRemaining}
          isAccessGranted={userData.subscription.isAccessGranted}
        />
      )}

      {/* Notificación de Bienvenida Personalizada por Usuario */}
      <UserWelcomeNotification user={userData} />
    </>
  );
}

export default Navbar;
