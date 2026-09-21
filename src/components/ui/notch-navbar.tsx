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
  secondaryStrokeColor?: string;
}

export function NotchNavbar({
  className,
  logo,
  leftItems = [],
  rightItems = [],
  leftWing,
  rightWing,
  mobileContent,
  bgClassName = "bg-black/90 backdrop-blur-md",
  strokeColor = "#20232A",
  secondaryStrokeColor = "rgba(0, 163, 255, 0.2)",
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
            <line x1="0" y1="37.5" x2="100%" y2="37.5" stroke={secondaryStrokeColor} strokeWidth={0.5} />
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
              <path
                d="M0 37.5 C25 37.5 25 61.5 50 61.5"
                fill="none"
                stroke={secondaryStrokeColor}
                strokeWidth={0.5}
              />
            </svg>
          </div>

          {/* Center Slice (Content Area) */}
          <div className="flex-1 h-full relative min-w-0 -ml-px">
            <div className={cn("absolute inset-0", bgClassName)}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                <line x1="0" y1="63.5" x2="100%" y2="63.5" stroke={strokeColor} strokeWidth={1} />
                <line x1="0" y1="61.5" x2="100%" y2="61.5" stroke={secondaryStrokeColor} strokeWidth={0.5} />
              </svg>
            </div>

            {/* Inner Content Layer */}
            <div className="relative w-full h-full flex items-center justify-between pb-1 px-3 md:px-6 gap-2 sm:gap-4">
              {/* Desktop Left Nav */}
              <nav className="hidden lg:flex items-center gap-1.5 shrink-0 mt-2">
                {leftItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 whitespace-nowrap",
                        item.isActive
                          ? "bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/40 shadow-[0_0_10px_rgba(0,163,255,0.2)]"
                          : item.highlight
                          ? "text-white bg-[#20232A] border border-[#20232A] hover:border-[#00A3FF]/40"
                          : "text-[#8E95A5] hover:text-[#F3F4F6] hover:bg-white/5"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Menu Button (Left) */}
              <button
                className="lg:hidden mt-2 p-1.5 text-[#8E95A5] hover:text-[#F3F4F6] rounded-lg hover:bg-white/5 transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Alternar menú móvil"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-[#00A3FF]" /> : <Menu className="w-5 h-5" />}
              </button>

              {/* Center Logo Slot */}
              <div className="flex justify-center shrink-0 mx-1 sm:mx-3 mt-2">
                {logo || (
                  <Link href="/" className="flex items-center gap-2 group">
                    <span className="font-bold text-sm tracking-wider text-[#F3F4F6]">
                      PRIVAE <span className="text-[#00A3FF]">DTF</span>
                    </span>
                  </Link>
                )}
              </div>

              {/* Desktop Right Nav */}
              <nav className="hidden lg:flex items-center gap-1.5 shrink-0 mt-2">
                {rightItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all active:scale-95 whitespace-nowrap",
                        item.isActive
                          ? "bg-[#00A3FF]/15 text-[#00A3FF] border border-[#00A3FF]/40 shadow-[0_0_10px_rgba(0,163,255,0.2)]"
                          : item.highlight
                          ? "text-white bg-[#00A3FF]/20 text-[#00A3FF] border border-[#00A3FF]/40 hover:bg-[#00A3FF]/30 shadow-[0_0_12px_rgba(0,163,255,0.25)]"
                          : "text-[#8E95A5] hover:text-[#F3F4F6] hover:bg-white/5"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5 shrink-0 opacity-80 group-hover:opacity-100" />}
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Right Spacer / Indicator */}
              <div className="lg:hidden flex items-center gap-1.5 mt-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00A3FF]"></span>
                <span className="font-mono text-[10px] text-[#8E95A5]">300 DPI</span>
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
              <path
                d="M0 61.5 C25 61.5 25 37.5 50 37.5"
                fill="none"
                stroke={secondaryStrokeColor}
                strokeWidth={0.5}
              />
            </svg>
          </div>
        </div>

        {/* Right Side Bar */}
        <div className={cn("flex-1 h-10 z-20 relative min-w-0 -ml-px flex items-center justify-end px-4", bgClassName)}>
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            <line x1="0" y1="39.5" x2="100%" y2="39.5" stroke={strokeColor} strokeWidth={1} />
            <line x1="0" y1="37.5" x2="100%" y2="37.5" stroke={secondaryStrokeColor} strokeWidth={0.5} />
          </svg>
          <div className="relative z-10">{rightWing}</div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-x-0 top-16 z-40 bg-black/95 backdrop-blur-xl border-b border-[#20232A] p-4 lg:hidden shadow-2xl"
          >
            {mobileContent ? (
              mobileContent(() => setIsMobileMenuOpen(false))
            ) : (
              <nav className="flex flex-col gap-2">
                {[...leftItems, ...rightItems].map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors",
                        item.isActive
                          ? "bg-[#0D0E11] text-[#00A3FF] border border-[#00A3FF]/40"
                          : "text-[#F3F4F6] hover:bg-white/5"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {Icon && <Icon className="w-4 h-4 text-[#00A3FF]" />}
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
