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
  /** Variante de color adaptada a Privae DTF */
  variant?: CornerButtonVariant;
  /** Tamaño del botón */
  size?: CornerButtonSize;
  /** Icono personalizado a la derecha */
  icon?: React.ReactNode;
  /** Mostrar icono por defecto (ArrowRight). Por defecto true. */
  showIcon?: boolean;
  /** Color de las líneas y marcas de calibración animadas. Por defecto #00A3FF */
  accentColor?: string;
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
  accentColor = "#00A3FF",
  className,
  wrapperClassName,
  style,
  disabled,
  ...props
}: CornerButtonProps) {
  const resolvedIcon =
    icon ??
    (showIcon ? (
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" />
    ) : null);

  // Variantes limpias y mate (sin bordes brillosos ni halos de neón)
  const variantClasses: Record<CornerButtonVariant, string> = {
    cyan: "bg-[#00A3FF] text-[#0D0E11] font-bold hover:bg-[#38b6ff] border border-transparent shadow-none",
    dark: "bg-[#16181D] text-[#E5E7EB] font-semibold border border-[#27272A] hover:bg-[#20232A] hover:border-neutral-500 shadow-none",
    white: "bg-[#F3F4F6] text-[#0D0E11] font-bold border border-transparent hover:bg-white shadow-none",
    danger: "bg-red-950/40 text-red-400 font-semibold border border-red-900/50 hover:bg-red-900/40 shadow-none",
  };

  const sizeClasses: Record<CornerButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2 rounded-xl",
    lg: "px-7 py-3 text-sm sm:text-base gap-2.5 rounded-xl font-bold",
  };

  const buttonInner = (
    <>
      <span className="truncate">{children}</span>
      {resolvedIcon}
    </>
  );

  const sharedBtnClass = cn(
    "corner-btn group relative inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wide select-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <div
      className={cn("corner-btn-wrapper", wrapperClassName)}
      style={
        {
          "--accent": accentColor,
          "--dot-color": accentColor,
          "--line-color": accentColor,
        } as React.CSSProperties
      }
    >
      {/* Guías lineales perimetrales animadas (secuencia horaria) */}
      <div className="corner-line horizontal top" aria-hidden="true" />
      <div className="corner-line vertical right" aria-hidden="true" />
      <div className="corner-line horizontal bottom" aria-hidden="true" />
      <div className="corner-line vertical left" aria-hidden="true" />

      {/* Marcas de registro en las 4 esquinas animadas secuencialmente */}
      <div className="corner-dot top left" aria-hidden="true" />
      <div className="corner-dot top right" aria-hidden="true" />
      <div className="corner-dot bottom right" aria-hidden="true" />
      <div className="corner-dot bottom left" aria-hidden="true" />

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

      {/* Animaciones originales completas (líneas trazadas + puntos proyectados) */}
      <style>{`
        .corner-btn-wrapper {
          --dot-size: 5px;
          --line-weight: 1px;
          --padding: 0.5rem 0.65rem;
          --speed: 0.28s;

          position: relative;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: var(--padding);
          background-color: transparent;
          transition: background-color 0.25s ease-in-out;
          user-select: none;
          border-radius: 0.75rem;
        }

        /* ── Puntos de Esquina Animados ── */
        .corner-dot {
          position: absolute;
          width: var(--dot-size);
          height: var(--dot-size);
          border-radius: 50%;
          background-color: var(--dot-color, #00A3FF);
          opacity: 0;
          transition: all 0.25s ease-in-out;
          pointer-events: none;
        }

        .corner-btn-wrapper:has(:hover) .corner-dot.top.left {
          top: 50%; left: 20%;
          animation: corner-dot-tl var(--speed) ease-in-out forwards;
        }
        @keyframes corner-dot-tl {
          90%  { opacity: 0.75; }
          100% { top: calc(var(--dot-size) * -0.5); left: calc(var(--dot-size) * -0.5); opacity: 1; }
        }

        .corner-btn-wrapper:has(:hover) .corner-dot.top.right {
          top: 50%; right: 20%;
          animation: corner-dot-tr var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.4);
        }
        @keyframes corner-dot-tr {
          80%  { opacity: 0.75; }
          100% { top: calc(var(--dot-size) * -0.5); right: calc(var(--dot-size) * -0.5); opacity: 1; }
        }

        .corner-btn-wrapper:has(:hover) .corner-dot.bottom.right {
          bottom: 50%; right: 20%;
          animation: corner-dot-br var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.8);
        }
        @keyframes corner-dot-br {
          80%  { opacity: 0.75; }
          100% { bottom: calc(var(--dot-size) * -0.5); right: calc(var(--dot-size) * -0.5); opacity: 1; }
        }

        .corner-btn-wrapper:has(:hover) .corner-dot.bottom.left {
          bottom: 50%; left: 20%;
          animation: corner-dot-bl var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 1.2);
        }
        @keyframes corner-dot-bl {
          80%  { opacity: 0.75; }
          100% { bottom: calc(var(--dot-size) * -0.5); left: calc(var(--dot-size) * -0.5); opacity: 1; }
        }

        /* ── Líneas Perimetrales Animadas ── */
        .corner-line {
          position: absolute;
          transition: all 0.25s ease-in-out;
          pointer-events: none;
        }

        .corner-line.horizontal {
          height: var(--line-weight);
          width: 100%;
          background-image: repeating-linear-gradient(
            90deg,
            transparent 0 calc(var(--line-weight) * 2),
            var(--line-color, #00A3FF) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4)
          );
        }

        .corner-line.vertical {
          width: var(--line-weight);
          height: 100%;
          background-image: repeating-linear-gradient(
            0deg,
            transparent 0 calc(var(--line-weight) * 2),
            var(--line-color, #00A3FF) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4)
          );
        }

        .corner-line.top    { top:    calc(var(--line-weight) * -0.5); transform-origin: top left;    transform: scaleX(0); }
        .corner-line.bottom { bottom: calc(var(--line-weight) * -0.5); transform-origin: bottom right; transform: scaleX(0); }
        .corner-line.left   { left:   calc(var(--line-weight) * -0.5); transform-origin: bottom left;  transform: scaleY(0); }
        .corner-line.right  { right:  calc(var(--line-weight) * -0.5); transform-origin: top right;    transform: scaleY(0); }

        .corner-btn-wrapper:has(:hover) .corner-line.top {
          animation: corner-line-top var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.4);
        }
        @keyframes corner-line-top    { 100% { transform: scaleX(1); } }

        .corner-btn-wrapper:has(:hover) .corner-line.bottom {
          animation: corner-line-bottom var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 1.2);
        }
        @keyframes corner-line-bottom { 100% { transform: scaleX(1); } }

        .corner-btn-wrapper:has(:hover) .corner-line.left {
          animation: corner-line-left var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 1.5);
        }
        @keyframes corner-line-left   { 100% { transform: scaleY(1); } }

        .corner-btn-wrapper:has(:hover) .corner-line.right {
          animation: corner-line-right var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.8);
        }
        @keyframes corner-line-right  { 100% { transform: scaleY(1); } }
      `}</style>
    </div>
  );
}

export default CornerButton;
