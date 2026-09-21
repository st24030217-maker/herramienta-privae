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
  ScanSearch
} from "lucide-react";
import { SubscriptionBanner } from "./SubscriptionBanner";
import { NotchNavbar, type NotchNavItem } from "./ui/notch-navbar";

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

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUserData(null);
    router.push("/auth/login");
    router.refresh();
  };

  // Herramientas divididas a la izquierda y derecha del centro del Notch
  const leftNavItems: NotchNavItem[] = [
    { 
      label: "Escáner DTF", 
      href: "/tools/scanner", 
      icon: ScanSearch, 
      isActive: pathname === "/tools/scanner" 
    },
    { 
      label: "Quitar Fondo", 
      href: "/tools/remove-bg", 
      icon: Scissors, 
      isActive: pathname === "/tools/remove-bg" 
    },
    { 
      label: "+Mejorar", 
      href: "/tools/enhance", 
      icon: Sparkles, 
      isActive: pathname === "/tools/enhance" 
    },
  ];

  const rightNavItems: NotchNavItem[] = [
    { 
      label: "Quitar Color", 
      href: "/tools/remove-color", 
      icon: Pipette, 
      isActive: pathname === "/tools/remove-color" 
    },
    { 
      label: "Depurar Alfa", 
      href: "/tools/clean-alpha", 
      icon: Layers, 
      isActive: pathname === "/tools/clean-alpha" 
    },
    { 
      label: "Armador 58cm", 
      href: "/tools/dtf-builder", 
      icon: LayoutGrid, 
      isActive: pathname === "/tools/dtf-builder",
      highlight: true 
    },
  ];

  const allNavItems = [...leftNavItems, ...rightNavItems];

  // Contenido para el ala izquierda (Left Wing)
  const leftWingContent = (
    <div className="flex items-center gap-2 font-mono text-[11px] text-[#8E95A5]">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00A3FF] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00A3FF]"></span>
      </span>
      <span className="text-[#F3F4F6] font-semibold hidden sm:inline">TALLER DTF</span>
      <span className="text-[#8E95A5]/60 hidden sm:inline">·</span>
      <span className="hidden md:inline">300 DPI</span>
      <span className="text-[#8E95A5]/60 hidden md:inline">·</span>
      <span className="text-[#00A3FF] hidden md:inline">58.0 CM</span>
    </div>
  );

  // Logo central para el Notch
  const centerLogo = (
    <Link href="/" className="flex items-center gap-2 group px-1 py-0.5 rounded-lg hover:bg-white/5 transition-all">
      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-[#00A3FF]/50 bg-[#0D0E11] text-[#F3F4F6] font-mono font-black text-xs shadow-[0_0_12px_rgba(0,163,255,0.3)] group-hover:scale-105 group-hover:border-[#00A3FF] transition-all">
        P
      </div>
      <div className="flex flex-col text-left">
        <span className="font-black tracking-tight text-[#F3F4F6] text-xs leading-none">
          PRIVAE <span className="text-[#00A3FF]">DTF</span>
        </span>
        <span className="font-mono text-[8px] tracking-wider text-[#8E95A5] leading-none mt-0.5">
          PRE-PRESS
        </span>
      </div>
    </Link>
  );

  // Contenido para el ala derecha (Right Wing)
  const rightWingContent = (
    <div className="flex items-center gap-2 sm:gap-3">
      {userData ? (
        <div className="flex items-center gap-2">
          {/* Badge de rol / suscripción */}
          {userData.role === "ADMIN" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-[#20232A] bg-[#0D0E11] text-[#F3F4F6] px-2 py-0.5 font-mono text-[10px] font-semibold">
              <Crown className="h-3 w-3 text-[#00A3FF]" /> ADMIN
            </span>
          ) : userData.subscription.status === "ACTIVE" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#00A3FF] px-2 py-0.5 font-mono text-[10px] font-semibold">
              <Crown className="h-3 w-3" /> PREMIUM
            </span>
          ) : userData.subscription.status === "GRACE_PERIOD" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 px-2 py-0.5 font-mono text-[10px]">
              <ShieldAlert className="h-3 w-3" /> {userData.subscription.daysRemaining}D
            </span>
          ) : userData.subscription.status === "TRIAL" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-[#20232A] bg-[#0D0E11] px-2 py-0.5 font-mono text-[10px] text-[#8E95A5]">
              PRUEBA {userData.subscription.daysRemaining}D
            </span>
          ) : null}

          {/* Menú Usuario con Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-[#20232A] bg-[#0D0E11] px-2.5 py-1 text-xs font-semibold text-[#F3F4F6] hover:border-[#8E95A5]/40 active:scale-95 transition-all shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-[#00A3FF]" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate text-[11px]">
                {userData.name || userData.email.split("@")[0]}
              </span>
              <ChevronDown className={`h-3 w-3 text-[#8E95A5] transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-[#20232A] bg-[#12141A] py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2 border-b border-[#20232A]">
                  <p className="text-[10px] font-mono text-[#8E95A5]">Usuario DTF:</p>
                  <p className="text-xs font-semibold text-[#F3F4F6] truncate">{userData.email}</p>
                  <p className="text-[11px] font-semibold text-[#00A3FF] mt-0.5">
                    {userData.role === "ADMIN" 
                      ? "Administrador" 
                      : userData.subscription.status === "ACTIVE" 
                      ? "Plan Premium Activo" 
                      : `Prueba: ${userData.subscription.daysRemaining} días restantes`}
                  </p>
                </div>

                <Link
                  href="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#F3F4F6] hover:bg-[#20232A] transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-[#8E95A5]" /> Mi Cuenta & Suscripción
                </Link>

                {userData.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-[#00A3FF] font-semibold hover:bg-[#20232A] transition-colors"
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
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-[#8E95A5] hover:text-red-400 hover:bg-[#20232A] transition-colors"
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
            className="px-2.5 py-1 text-xs font-medium text-[#8E95A5] hover:text-[#F3F4F6] transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-[#00A3FF] px-3 py-1 text-xs font-bold text-black hover:bg-[#38b6ff] active:scale-95 transition-all shadow-[0_0_10px_rgba(0,163,255,0.3)] whitespace-nowrap"
          >
            Prueba 5d
          </Link>
        </div>
      ) : null}
    </div>
  );

  // Render del menú móvil
  const renderMobileContent = (onClose: () => void) => (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-[#8E95A5] mb-2 px-1">
          Herramientas de Preparación DTF
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                  item.isActive
                    ? "bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/40"
                    : item.highlight
                    ? "text-[#00A3FF] bg-[#00A3FF]/10 border border-[#00A3FF]/30"
                    : "text-[#F3F4F6] hover:bg-[#16181D]"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0 text-[#00A3FF]" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-[#20232A] pt-3">
        {userData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs text-[#8E95A5] truncate max-w-[200px]">{userData.email}</span>
              <span className="font-mono text-[10px] text-[#00A3FF] font-semibold">
                {userData.role === "ADMIN" ? "ADMIN" : userData.subscription.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/account"
                onClick={onClose}
                className="flex-1 text-center py-2 rounded-xl bg-[#16181D] border border-[#20232A] text-xs font-semibold text-[#F3F4F6]"
              >
                Mi Cuenta
              </Link>
              {userData.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex-1 text-center py-2 rounded-xl bg-[#00A3FF]/10 border border-[#00A3FF]/30 text-xs font-semibold text-[#00A3FF]"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  onClose();
                  handleLogout();
                }}
                className="px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs font-semibold text-red-400"
              >
                Salir
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/auth/login"
              onClick={onClose}
              className="flex-1 text-center py-2 rounded-xl bg-[#16181D] border border-[#20232A] text-xs font-semibold text-[#F3F4F6]"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="flex-1 text-center py-2 rounded-xl bg-[#00A3FF] text-black text-xs font-bold shadow-[0_0_12px_rgba(0,163,255,0.3)]"
            >
              Prueba Gratuita
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <NotchNavbar
        logo={centerLogo}
        leftItems={leftNavItems}
        rightItems={rightNavItems}
        leftWing={leftWingContent}
        rightWing={rightWingContent}
        mobileContent={renderMobileContent}
        bgClassName="bg-[#0D0E11]/95 backdrop-blur-md"
        strokeColor="#20232A"
        secondaryStrokeColor="rgba(0, 163, 255, 0.25)"
      />

      {/* Banner de Estado de Suscripción si aplica */}
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

export default Navbar;
