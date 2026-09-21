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
  /** Color de acento para marcas de calibración y brillo. Por defecto #00A3FF */
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
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    ) : null);

  // Variantes de estilo compatibles con el sistema de diseño DTF
  const variantClasses: Record<CornerButtonVariant, string> = {
    cyan: "bg-[#00A3FF] text-[#0D0E11] font-bold shadow-[0_0_15px_rgba(0,163,255,0.3)] hover:bg-[#38b6ff] hover:shadow-[0_0_20px_rgba(0,163,255,0.5)] border border-[#00A3FF]/40",
    dark: "bg-[#16181D] text-[#F3F4F6] font-semibold border border-[#20232A] hover:border-[#00A3FF]/60 hover:bg-[#20232A] shadow-sm",
    white: "bg-[#F3F4F6] text-[#0D0E11] font-bold border border-white hover:bg-white shadow-md",
    danger: "bg-red-500/15 text-red-400 font-semibold border border-red-500/30 hover:bg-red-500/25 shadow-sm",
  };

  const sizeClasses: Record<CornerButtonSize, string> = {
    sm: "px-3.5 py-1.5 text-xs gap-1.5 rounded-lg",
    md: "px-5 py-2.5 text-xs sm:text-sm gap-2 rounded-xl",
    lg: "px-7 py-3.5 text-sm sm:text-base gap-2.5 rounded-xl font-bold",
  };

  const buttonInner = (
    <>
      <span className="truncate">{children}</span>
      {resolvedIcon}
    </>
  );

  const sharedBtnClass = cn(
    "group relative inline-flex items-center justify-center transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer tracking-wide select-none",
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
          "--accent-glow": `${accentColor}22`,
        } as React.CSSProperties
      }
    >
      {/* Guías técnicas lineales de calibración DTF */}
      <div className="corner-line horizontal top" aria-hidden="true" />
      <div className="corner-line vertical right" aria-hidden="true" />
      <div className="corner-line horizontal bottom" aria-hidden="true" />
      <div className="corner-line vertical left" aria-hidden="true" />

      {/* Marcas de registro DTF en las 4 esquinas */}
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

      {/* Estilos técnicos encapsulados para las retículas */}
      <style>{`
        .corner-btn-wrapper {
          --dot-size: 5px;
          --line-weight: 1px;
          --padding: 0.55rem 0.75rem;
          --speed: 0.26s;
          --dot-color: var(--accent, #00A3FF);
          --line-color: var(--accent, rgba(0, 163, 255, 0.45));

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

        .corner-btn-wrapper:has(:hover) {
          animation: corner-bg-change calc(var(--speed) * 3) ease-in-out forwards;
        }
        @keyframes corner-bg-change {
          70%  { background-color: transparent; }
          100% { background-color: var(--accent-glow); }
        }

        /* ── Retículas / Marcas de Registro DTF ── */
        .corner-dot {
          position: absolute;
          width: var(--dot-size);
          height: var(--dot-size);
          border-radius: 50%;
          background-color: var(--dot-color);
          opacity: 0;
          box-shadow: 0 0 6px var(--dot-color);
          transition: all 0.25s ease-in-out;
          pointer-events: none;
        }
        .corner-btn-wrapper:has(:hover) .corner-dot.top.left {
          top: 50%; left: 20%;
          animation: corner-dot-tl var(--speed) ease-in-out forwards;
        }
        @keyframes corner-dot-tl {
          90%  { opacity: 0.7; }
          100% { top: calc(var(--dot-size) * -0.5); left: calc(var(--dot-size) * -0.5); opacity: 1; }
        }
        .corner-btn-wrapper:has(:hover) .corner-dot.top.right {
          top: 50%; right: 20%;
          animation: corner-dot-tr var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.4);
        }
        @keyframes corner-dot-tr {
          80%  { opacity: 0.7; }
          100% { top: calc(var(--dot-size) * -0.5); right: calc(var(--dot-size) * -0.5); opacity: 1; }
        }
        .corner-btn-wrapper:has(:hover) .corner-dot.bottom.right {
          bottom: 50%; right: 20%;
          animation: corner-dot-br var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 0.8);
        }
        @keyframes corner-dot-br {
          80%  { opacity: 0.7; }
          100% { bottom: calc(var(--dot-size) * -0.5); right: calc(var(--dot-size) * -0.5); opacity: 1; }
        }
        .corner-btn-wrapper:has(:hover) .corner-dot.bottom.left {
          bottom: 50%; left: 20%;
          animation: corner-dot-bl var(--speed) ease-in-out forwards;
          animation-delay: calc(var(--speed) * 1.2);
        }
        @keyframes corner-dot-bl {
          80%  { opacity: 0.7; }
          100% { bottom: calc(var(--dot-size) * -0.5); left: calc(var(--dot-size) * -0.5); opacity: 1; }
        }

        /* ── Líneas Guía de Registro ── */
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
            var(--line-color) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4)
          );
        }
        .corner-line.vertical {
          width: var(--line-weight);
          height: 100%;
          background-image: repeating-linear-gradient(
            0deg,
            transparent 0 calc(var(--line-weight) * 2),
            var(--line-color) calc(var(--line-weight) * 2) calc(var(--line-weight) * 4)
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
