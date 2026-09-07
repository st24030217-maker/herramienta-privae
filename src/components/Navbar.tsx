"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  ChevronDown,
  Menu,
  X,
  ScanSearch,
  Calculator
} from "lucide-react";
import { SubscriptionBanner } from "./SubscriptionBanner";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
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

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserData(null);
    router.push("/auth/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/tools/scanner", label: "Escáner DTF", icon: ScanSearch },
    { href: "/tools/remove-bg", label: "Remover Fondo", icon: Scissors },
    { href: "/tools/enhance", label: "Mejorar Calidad", icon: Sparkles },
    { href: "/tools/remove-color", label: "Eliminar Color", icon: Pipette },
    { href: "/tools/clean-alpha", label: "Quitar Semitransparencias", icon: Layers },
    { href: "/tools/pricing-calculator", label: "Calculadora Costos", icon: Calculator },
    { href: "/tools/dtf-builder", label: "Armador DTF (58cm)", icon: LayoutGrid, highlight: true },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#20232A] bg-[#16181D]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Marca Técnica Industrial y Botón Menú Móvil */}
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex md:hidden p-1.5 rounded border border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:text-[#F3F4F6]"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-[#20232A] bg-[#0D0E11] text-[#F3F4F6] font-mono font-bold text-sm">
                P
              </div>
              <div className="flex flex-col">
                <span className="font-bold tracking-tight text-[#F3F4F6] text-sm leading-tight">
                  PRIVAE <span className="text-[#8E95A5] font-normal">DTF</span>
                </span>
                <span className="font-mono text-[9px] tracking-wider text-[#8E95A5]">
                  300 DPI PRE-PRESS
                </span>
              </div>
            </Link>

            {/* Menú de Herramientas de Taller (Desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded transition-colors ${
                      isActive
                        ? "bg-[#0D0E11] text-[#F3F4F6] font-semibold border border-[#00A3FF]/40"
                        : item.highlight
                        ? "text-[#F3F4F6] bg-[#20232A]/60 border border-[#20232A] hover:bg-[#20232A]"
                        : "text-[#8E95A5] hover:text-[#F3F4F6] hover:bg-[#20232A]/40"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Estado de Suscripción y Perfil */}
          <div className="flex items-center gap-3">
            {userData ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Badges Técnicos de Acceso */}
                {userData.role === "ADMIN" ? (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded border border-[#20232A] bg-[#0D0E11] text-[#F3F4F6] px-2 py-0.5 font-mono text-[11px] font-semibold">
                    <Crown className="h-3 w-3 text-[#00A3FF]" /> ADMIN
                  </span>
                ) : userData.subscription.status === "ACTIVE" ? (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded border border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#00A3FF] px-2 py-0.5 font-mono text-[11px] font-semibold">
                    <Crown className="h-3 w-3" /> PREMIUM
                  </span>
                ) : userData.subscription.status === "GRACE_PERIOD" ? (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-300 px-2 py-0.5 font-mono text-[11px]">
                    <ShieldAlert className="h-3 w-3" /> GRACIA {userData.subscription.daysRemaining}D
                  </span>
                ) : userData.subscription.status === "TRIAL" ? (
                  <span className={`hidden sm:inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[11px] ${
                    userData.subscription.isAccessGranted
                      ? "border-[#20232A] bg-[#0D0E11] text-[#F3F4F6]"
                      : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] line-through"
                  }`}>
                    {userData.subscription.isAccessGranted
                      ? `PRUEBA: ${userData.subscription.daysRemaining}D`
                      : "PRUEBA VENCIDA"}
                  </span>
                ) : (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded border border-[#20232A] bg-[#0D0E11] text-[#8E95A5] px-2 py-0.5 font-mono text-[11px]">
                    SUSPENDIDO
                  </span>
                )}

                {/* Menú Usuario con Dropdown Ref */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2 rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-xs text-[#F3F4F6] hover:border-[#8E95A5]/40 transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-[#8E95A5]" />
                    <span className="max-w-[100px] sm:max-w-[130px] truncate">
                      {userData.name || userData.email}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-[#8E95A5] transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded border border-[#20232A] bg-[#16181D] py-1.5 shadow-2xl z-50">
                      <div className="px-4 py-2 border-b border-[#20232A] sm:hidden">
                        <p className="text-[11px] font-mono text-[#8E95A5]">Estado:</p>
                        <p className="text-xs font-semibold text-[#00A3FF]">
                          {userData.role === "ADMIN" ? "Administrador" : userData.subscription.status === "ACTIVE" ? "Plan Premium" : `Prueba: ${userData.subscription.daysRemaining} días`}
                        </p>
                      </div>

                      <Link
                        href="/account"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[#F3F4F6] hover:bg-[#20232A] transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-[#8E95A5]" /> Mi Cuenta & Suscripción
                      </Link>

                      {userData.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#00A3FF] font-medium hover:bg-[#20232A] transition-colors"
                        >
                          <Crown className="h-3.5 w-3.5" /> Panel Administrador
                        </Link>
                      )}

                      <hr className="my-1 border-[#20232A]" />

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-[#8E95A5] hover:text-red-400 hover:bg-[#20232A] transition-colors"
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
                  className="px-3 py-1.5 text-xs font-medium text-[#8E95A5] hover:text-[#F3F4F6]"
                >
                  Ingresar
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded border border-[#F3F4F6] bg-[#F3F4F6] px-3 py-1.5 text-xs font-bold text-[#0D0E11] hover:bg-white transition-colors"
                >
                  Prueba 5 días
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        {/* Menú Móvil Desplegable */}
        {mobileMenuOpen && (
          <div className="border-t border-[#20232A] bg-[#12141A] px-4 py-3 md:hidden space-y-1">
            <p className="font-mono text-[10px] uppercase tracking-wider text-[#8E95A5] mb-2 px-2">
              Herramientas DTF
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 text-xs rounded transition-colors ${
                    isActive
                      ? "bg-[#0D0E11] text-[#00A3FF] font-semibold border border-[#00A3FF]/40"
                      : "text-[#F3F4F6] hover:bg-[#16181D]"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[#00A3FF]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Banner de Estado de Suscripción visible */}
      {userData?.subscription && (
        <SubscriptionBanner
          status={userData.subscription.status}
          daysRemaining={userData.subscription.daysRemaining}
          isAccessGranted={userData.subscription.isAccessGranted}
        />
      )}
    </>
  );
}
