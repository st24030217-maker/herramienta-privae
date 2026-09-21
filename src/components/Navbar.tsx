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
    <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-400">
      <span className="h-1.5 w-1.5 rounded-full bg-neutral-400"></span>
      <span className="text-neutral-300 font-medium hidden sm:inline">TALLER DTF</span>
      <span className="text-neutral-600 hidden sm:inline">·</span>
      <span className="hidden md:inline">300 DPI</span>
      <span className="text-neutral-600 hidden md:inline">·</span>
      <span className="text-neutral-400 hidden md:inline">58 CM</span>
    </div>
  );

  // Logo central para el Notch
  const centerLogo = (
    <Link href="/" className="flex items-center gap-2 group px-1 py-0.5 rounded-md hover:opacity-85 transition-opacity">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 border border-neutral-800 text-white font-mono font-bold text-xs">
        P
      </div>
      <div className="flex flex-col text-left">
        <span className="font-bold tracking-tight text-white text-xs leading-none">
          PRIVAE <span className="text-neutral-400 font-normal">DTF</span>
        </span>
        <span className="font-mono text-[8px] tracking-wider text-neutral-500 leading-none mt-0.5">
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
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 px-2 py-0.5 font-mono text-[10px]">
              <Crown className="h-3 w-3 text-neutral-400" /> ADMIN
            </span>
          ) : userData.subscription.status === "ACTIVE" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-300 px-2 py-0.5 font-mono text-[10px]">
              <Crown className="h-3 w-3 text-neutral-400" /> PREMIUM
            </span>
          ) : userData.subscription.status === "GRACE_PERIOD" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-amber-900/40 bg-amber-950/20 text-amber-400 px-2 py-0.5 font-mono text-[10px]">
              <ShieldAlert className="h-3 w-3" /> {userData.subscription.daysRemaining}D
            </span>
          ) : userData.subscription.status === "TRIAL" ? (
            <span className="hidden xl:inline-flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-[10px] text-neutral-400">
              PRUEBA {userData.subscription.daysRemaining}D
            </span>
          ) : null}

          {/* Menú Usuario con Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs font-medium text-neutral-300 hover:border-neutral-700 active:scale-98 transition-all"
            >
              <User className="h-3.5 w-3.5 text-neutral-400" />
              <span className="max-w-[80px] sm:max-w-[120px] truncate text-[11px]">
                {userData.name || userData.email.split("@")[0]}
              </span>
              <ChevronDown className={`h-3 w-3 text-neutral-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-neutral-800 bg-[#111216] py-2 shadow-xl z-50 animate-in fade-in duration-100">
                <div className="px-4 py-2 border-b border-neutral-800">
                  <p className="text-[10px] font-mono text-neutral-500">Usuario DTF:</p>
                  <p className="text-xs font-medium text-neutral-200 truncate">{userData.email}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
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
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-neutral-300 hover:bg-neutral-800/60 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-neutral-400" /> Mi Cuenta & Suscripción
                </Link>

                {userData.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-white font-medium hover:bg-neutral-800/60 transition-colors"
                  >
                    <Crown className="h-3.5 w-3.5 text-neutral-400" /> Panel Administrador
                  </Link>
                )}

                <hr className="my-1 border-neutral-800" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-neutral-400 hover:text-red-400 hover:bg-neutral-800/60 transition-colors"
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
            className="px-2.5 py-1 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-black hover:bg-neutral-200 active:scale-98 transition-all"
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
                className={`flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium transition-colors ${
                  item.isActive
                    ? "bg-white/10 text-white"
                    : item.highlight
                    ? "text-white bg-neutral-800 hover:bg-neutral-700"
                    : "text-neutral-300 hover:bg-neutral-800/60"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 shrink-0 text-neutral-400" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="border-t border-neutral-800 pt-3">
        {userData ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-xs text-neutral-400 truncate max-w-[200px]">{userData.email}</span>
              <span className="font-mono text-[10px] text-neutral-300 font-semibold">
                {userData.role === "ADMIN" ? "ADMIN" : userData.subscription.status}
              </span>
            </div>
            <div className="flex gap-2">
              <Link
                href="/account"
                onClick={onClose}
                className="flex-1 text-center py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200"
              >
                Mi Cuenta
              </Link>
              {userData.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex-1 text-center py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-white"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => {
                  onClose();
                  handleLogout();
                }}
                className="px-3 py-2 rounded-lg bg-red-950/30 border border-red-900/40 text-xs font-medium text-red-400"
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
              className="flex-1 text-center py-2 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-medium text-neutral-200"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth/register"
              onClick={onClose}
              className="flex-1 text-center py-2 rounded-lg bg-white text-black text-xs font-semibold hover:bg-neutral-200"
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
        bgClassName="bg-[#0A0B0E]/95 backdrop-blur-md"
        strokeColor="#22242A"
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
