"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  Sparkles, 
  Layers, 
  Pipette, 
  Scissors, 
  LayoutGrid, 
  User, 
  ShieldAlert, 
  LogOut, 
  Crown,
  ChevronDown
} from "lucide-react";

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUserData(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserData(null);
    router.push("/auth/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/tools/remove-bg", label: "Remover Fondo", icon: Scissors },
    { href: "/tools/enhance", label: "Mejorar Calidad", icon: Sparkles },
    { href: "/tools/remove-color", label: "Eliminar Color", icon: Pipette },
    { href: "/tools/clean-alpha", label: "Quitar Semitransparencias", icon: Layers },
    { href: "/tools/dtf-builder", label: "Armador DTF (58cm)", icon: LayoutGrid, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo & Marca Blanco y Negro */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-black font-black text-lg shadow-glow-white">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-black tracking-wider text-white text-base">
                PRIVAE <span className="text-neutral-400 font-normal">TEXTIL</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-medium">
                HERRAMIENTAS DTF · 300 DPI
              </span>
            </div>
          </Link>

          {/* Menú de Herramientas */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? "bg-white text-black font-bold shadow-sm"
                      : item.highlight
                      ? "text-white bg-neutral-900 border border-neutral-700 hover:bg-neutral-800"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Estado de Suscripción y Perfil */}
        <div className="flex items-center gap-3">
          {userData ? (
            <div className="flex items-center gap-3">
              {/* Badges Monocromáticos */}
              {userData.role === "ADMIN" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-white text-black px-2.5 py-0.5 text-xs font-bold">
                  <Crown className="h-3 w-3" /> Admin
                </span>
              ) : userData.subscription.status === "ACTIVE" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-white px-2.5 py-0.5 text-xs font-bold border border-neutral-700">
                  <Crown className="h-3 w-3" /> Premium Activo
                </span>
              ) : userData.subscription.status === "GRACE_PERIOD" ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 text-white px-2.5 py-0.5 text-xs font-bold border border-white">
                  <ShieldAlert className="h-3 w-3" /> Gracia: {userData.subscription.daysRemaining}d
                </span>
              ) : userData.subscription.status === "TRIAL" ? (
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                  userData.subscription.isAccessGranted
                    ? "bg-neutral-900 text-white border-neutral-700"
                    : "bg-neutral-950 text-neutral-400 border-neutral-800 line-through"
                }`}>
                  {userData.subscription.isAccessGranted
                    ? `Prueba: ${userData.subscription.daysRemaining} días`
                    : "Prueba Vencida"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-900 text-neutral-400 px-2.5 py-0.5 text-xs font-bold border border-neutral-800">
                  Suspendido
                </span>
              )}

              {/* Menú Usuario */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
                >
                  <User className="h-3.5 w-3.5 text-neutral-300" />
                  <span className="max-w-[100px] truncate">{userData.name || userData.email}</span>
                  <ChevronDown className="h-3 w-3 text-neutral-400" />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-neutral-800 bg-neutral-950 py-1 shadow-2xl z-50">
                    <Link
                      href="/account"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs text-neutral-200 hover:bg-neutral-900"
                    >
                      <User className="h-3.5 w-3.5 text-neutral-400" /> Mi Cuenta & Suscripción
                    </Link>

                    {userData.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-white font-semibold hover:bg-neutral-900"
                      >
                        <Crown className="h-3.5 w-3.5 text-white" /> Panel Administrador
                      </Link>
                    )}

                    <hr className="my-1 border-neutral-800" />

                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-neutral-400 hover:text-white hover:bg-neutral-900"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-black hover:bg-neutral-200 transition-colors"
              >
                Probar 5 Días Gratis
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
