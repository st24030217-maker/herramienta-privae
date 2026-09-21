"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CornerButtonVariant = "cyan" | "dark" | "white" | "danger";
export type CornerButtonSize = "sm" | "md" | "lg";

export interface CornerButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Enlace opcional (si se define, renderiza Next.js Link) */
  href?: string;
  /** Variante de color minimalista */
  variant?: CornerButtonVariant;
  /** Tamaño del botón */
  size?: CornerButtonSize;
  /** Icono personalizado a la derecha */
  icon?: React.ReactNode;
  /** Mostrar icono por defecto (ArrowRight). Por defecto true. */
  showIcon?: boolean;
  /** Clases CSS extra para el contenedor exterior */
  wrapperClassName?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CornerButton({
  children = "Continuar",
  href,
  variant = "cyan",
  size = "md",
  icon,
  showIcon = true,
  className,
  wrapperClassName,
  style,
  disabled,
  ...props
}: CornerButtonProps) {
  const resolvedIcon =
    icon ??
    (showIcon ? (
      <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5 opacity-80 group-hover:opacity-100" />
    ) : null);

  // Variantes minimalistas y mate (sin resplandores ni sombras de neón)
  const variantClasses: Record<CornerButtonVariant, string> = {
    cyan: "bg-[#00A3FF] text-[#0D0E11] font-semibold hover:bg-[#38b6ff] border border-transparent",
    dark: "bg-[#16181D] text-[#E5E7EB] font-medium border border-[#27272A] hover:bg-[#20232A] hover:border-neutral-600 hover:text-white",
    white: "bg-[#F3F4F6] text-[#0D0E11] font-semibold border border-transparent hover:bg-white",
    danger: "bg-red-950/30 text-red-400 font-medium border border-red-900/40 hover:bg-red-900/30 hover:border-red-800",
  };

  const sizeClasses: Record<CornerButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-4 py-2 text-xs sm:text-sm gap-2 rounded-lg",
    lg: "px-6 py-2.5 text-sm gap-2.5 rounded-lg font-semibold",
  };

  const buttonInner = (
    <>
      <span className="truncate">{children}</span>
      {resolvedIcon}
    </>
  );

  const sharedBtnClass = cn(
    "group relative inline-flex items-center justify-center transition-all duration-150 active:scale-98 disabled:opacity-40 disabled:pointer-events-none cursor-pointer tracking-normal select-none shadow-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <div className={cn("corner-btn-wrapper", wrapperClassName)}>
      {/* Marcas de precisión en las 4 esquinas (minimalistas, sin brillo) */}
      <span className="corner-bracket top left" aria-hidden="true" />
      <span className="corner-bracket top right" aria-hidden="true" />
      <span className="corner-bracket bottom right" aria-hidden="true" />
      <span className="corner-bracket bottom left" aria-hidden="true" />

      {href ? (
        <Link href={href} className={sharedBtnClass} style={style}>
          {buttonInner}
        </Link>
      ) : (
        <button
          className={sharedBtnClass}
          style={style}
          disabled={disabled}
          {...props}
        >
          {buttonInner}
        </button>
      )}

      {/* Estilos minimalistas para marcas de esquina */}
      <style>{`
        .corner-btn-wrapper {
          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 3px;
          background-color: transparent;
          user-select: none;
        }

        .corner-bracket {
          position: absolute;
          width: 5px;
          height: 5px;
          border-color: #3f3f46;
          border-style: solid;
          pointer-events: none;
          transition: all 0.18s ease-out;
        }

        .corner-bracket.top.left {
          top: 0;
          left: 0;
          border-width: 1px 0 0 1px;
        }
        .corner-bracket.top.right {
          top: 0;
          right: 0;
          border-width: 1px 1px 0 0;
        }
        .corner-bracket.bottom.right {
          bottom: 0;
          right: 0;
          border-width: 0 1px 1px 0;
        }
        .corner-bracket.bottom.left {
          bottom: 0;
          left: 0;
          border-width: 0 0 1px 1px;
        }

        /* Expansión sutil y limpia al hover (sin glow) */
        .corner-btn-wrapper:hover .corner-bracket.top.left {
          top: -2px;
          left: -2px;
          border-color: #a1a1aa;
        }
        .corner-btn-wrapper:hover .corner-bracket.top.right {
          top: -2px;
          right: -2px;
          border-color: #a1a1aa;
        }
        .corner-btn-wrapper:hover .corner-bracket.bottom.right {
          bottom: -2px;
          right: -2px;
          border-color: #a1a1aa;
        }
        .corner-btn-wrapper:hover .corner-bracket.bottom.left {
          bottom: -2px;
          left: -2px;
          border-color: #a1a1aa;
        }
      `}</style>
    </div>
  );
}

export default CornerButton;
