"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface NotchNavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  highlight?: boolean;
}

export interface NotchNavbarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  leftItems?: NotchNavItem[];
  rightItems?: NotchNavItem[];
  leftWing?: React.ReactNode;
  rightWing?: React.ReactNode;
  mobileContent?: (onClose: () => void) => React.ReactNode;
  bgClassName?: string;
  strokeColor?: string;
}

export function NotchNavbar({
  className,
  logo,
  leftItems = [],
  rightItems = [],
  leftWing,
  rightWing,
  mobileContent,
  bgClassName = "bg-[#0A0B0E]/95 backdrop-blur-md",
  strokeColor = "#22242A",
  ...props
}: NotchNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 inset-x-0 z-50 h-16 flex px-0 select-none",
          className
        )}
        {...props}
      >
        {/* Left Side Bar */}
        <div className={cn("flex-1 h-10 z-20 relative min-w-0 flex items-center px-4", bgClassName)}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke={strokeColor} strokeWidth={1} />
          </svg>
          <div className="relative z-10 w-full">{leftWing}</div>
        </div>

        {/* Notch Container - 3 Slices */}
        <div className="flex h-16 relative z-10 shrink-0 -ml-px">
          {/* Left Slice (Curved Corner) */}
          <div className="w-[50px] h-full relative shrink-0">
            <div
              className={cn("absolute inset-0", bgClassName)}
              style={{ clipPath: "path('M0 0 H50 V64 C25 64 25 40 0 40 Z')" }}
            />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path
                d="M0 39.5 C25 39.5 25 63.5 50 63.5"
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
              />
            </svg>
          </div>

          {/* Center Slice (Content Area) */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
            <div className={cn("absolute inset-0", bgClassName)}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke={strokeColor} strokeWidth={1} />
              </svg>
            </div>

            {/* Inner Content Layer */}
            <div className="relative w-full h-full flex items-center justify-between pb-1 px-3 md:px-5 gap-2 sm:gap-3">
              {/* Desktop Left Nav */}
              <nav className="hidden lg:flex items-center gap-1 shrink-0 mt-2">
                {leftItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                        item.isActive
                          ? "bg-white/10 text-white"
                          : item.highlight
                          ? "bg-neutral-800 text-white hover:bg-neutral-700"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button
                className="lg:hidden mt-2 p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Alternar menú móvil"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4" />}
              </button>

              {/* Center Logo Slot */}
              <div className="flex justify-center shrink-0 mx-1 sm:mx-2 mt-2">
                {logo || (
                  <Link href="/" className="flex items-center gap-2 group">
                    <span className="font-semibold text-xs tracking-wider text-white">
                      PRIVAE DTF
                    </span>
                  </Link>
                )}
              </div>

              {/* Desktop Right Nav */}
              <nav className="hidden lg:flex items-center gap-1 shrink-0 mt-2">
                {rightItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap",
                        item.isActive
                          ? "bg-white/10 text-white"
                          : item.highlight
                          ? "bg-white text-black font-semibold hover:bg-neutral-200"
                          : "text-neutral-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Right Spacer / Indicator */}
              <div className="lg:hidden flex items-center gap-1 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-neutral-500"></span>
                <span className="font-mono text-[10px] text-neutral-400">300 DPI</span>
              </div>
            </div>
          </div>

          {/* Right Slice (Curved Corner) */}
          <div className="w-[50px] h-full relative shrink-0 -ml-px">
            <div
              className={cn("absolute inset-0", bgClassName)}
              style={{ clipPath: "path('M0 0 H50 V40 C25 40 25 64 0 64 Z')" }}
            />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 50 64">
              <path
                d="M0 63.5 C25 63.5 25 39.5 50 39.5"
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
              />
            </svg>
          </div>
        </div>

        {/* Right Side Bar */}
        <div className={cn("flex-1 h-10 z-20 relative min-w-0 -ml-px flex items-center justify-end px-4", bgClassName)}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke={strokeColor} strokeWidth={1} />
          </svg>
          <div className="relative z-10">{rightWing}</div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 bg-[#0A0B0E]/95 backdrop-blur-xl border-b border-[#22242A] p-4 lg:hidden"
          >
            {mobileContent ? (
              mobileContent(() => setIsMobileMenuOpen(false))
            ) : (
              <nav className="flex flex-col gap-1.5">
                {[...leftItems, ...rightItems].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 p-2.5 rounded-lg text-xs font-medium transition-colors",
                        item.isActive
                          ? "bg-white/10 text-white"
                          : "text-neutral-300 hover:bg-white/5"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default NotchNavbar;
