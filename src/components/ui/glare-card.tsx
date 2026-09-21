"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export interface GlareCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  /** Intensidad máxima de la inclinación 3D (por defecto 15 grados) */
  maxTilt?: number;
  /** Color de brillo secundario (por defecto cian DTF #00A3FF) */
  glareColor?: "cyan" | "white" | "neutral";
}

export const GlareCard = ({
  children,
  className,
  maxTilt = 12,
  glareColor = "cyan",
  ...props
}: GlareCardProps) => {
  const isPointerInside = useRef(false);
  const refElement = useRef<HTMLDivElement>(null);
  const state = useRef({
    glare: { x: 50, y: 50 },
    background: { x: 50, y: 50 },
    rotate: { x: 0, y: 0 },
  });

  const updateStyles = () => {
    if (refElement.current) {
      const { background, rotate, glare } = state.current;
      refElement.current.style.setProperty("--m-x", `${glare.x}%`);
      refElement.current.style.setProperty("--m-y", `${glare.y}%`);
      refElement.current.style.setProperty("--r-x", `${rotate.x}deg`);
      refElement.current.style.setProperty("--r-y", `${rotate.y}deg`);
      refElement.current.style.setProperty("--bg-x", `${background.x}%`);
      refElement.current.style.setProperty("--bg-y", `${background.y}%`);
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const rotateFactor = maxTilt / 15;
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    const percentage = {
      x: Math.max(0, Math.min(100, (100 / rect.width) * position.x)),
      y: Math.max(0, Math.min(100, (100 / rect.height) * position.y)),
    };
    const delta = {
      x: percentage.x - 50,
      y: percentage.y - 50,
    };

    const { background, rotate, glare } = state.current;
    background.x = 50 + percentage.x / 4 - 12.5;
    background.y = 50 + percentage.y / 3 - 16.67;
    rotate.x = -(delta.y / 3.5) * rotateFactor;
    rotate.y = (delta.x / 3.5) * rotateFactor;
    glare.x = percentage.x;
    glare.y = percentage.y;

    updateStyles();
  };

  const handlePointerEnter = () => {
    isPointerInside.current = true;
    if (refElement.current) {
      setTimeout(() => {
        if (isPointerInside.current) {
          refElement.current?.style.setProperty("--duration", "0s");
        }
      }, 250);
      refElement.current.style.setProperty("--opacity", "1");
    }
  };

  const handlePointerLeave = () => {
    isPointerInside.current = false;
    if (refElement.current) {
      refElement.current.style.removeProperty("--duration");
      refElement.current.style.setProperty("--r-x", `0deg`);
      refElement.current.style.setProperty("--r-y", `0deg`);
      refElement.current.style.setProperty("--opacity", "0");
    }
  };

  // Glare gradient selector adaptado a la estética minimalista y mate de Privae
  const glareGradients = {
    cyan: "radial-gradient(farthest-corner circle at var(--m-x) var(--m-y), rgba(0, 163, 255, 0.22) 10%, rgba(255, 255, 255, 0.12) 25%, transparent 70%)",
    white: "radial-gradient(farthest-corner circle at var(--m-x) var(--m-y), rgba(255, 255, 255, 0.20) 12%, rgba(255, 255, 255, 0.06) 30%, transparent 65%)",
    neutral: "radial-gradient(farthest-corner circle at var(--m-x) var(--m-y), rgba(200, 210, 225, 0.15) 10%, transparent 60%)",
  };

  return (
    <div
      style={{
        perspective: "900px",
      }}
      className="relative isolate w-full"
    >
      <div
        ref={refElement}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        style={
          {
            "--m-x": "50%",
            "--m-y": "50%",
            "--r-x": "0deg",
            "--r-y": "0deg",
            "--bg-x": "50%",
            "--bg-y": "50%",
            "--duration": "300ms",
            "--opacity": "0",
            transform: "rotateY(var(--r-y)) rotateX(var(--r-x))",
            transition: "transform var(--duration) cubic-bezier(0.16, 1, 0.3, 1)",
            transformStyle: "preserve-3d",
          } as React.CSSProperties
        }
        className={cn(
          "relative overflow-hidden rounded-xl border border-[#20232A] bg-[#16181D] transition-colors duration-300 hover:border-[#2E333D]",
          className
        )}
        {...props}
      >
        {/* Capa de reflejo fotoluminiscente / Glare Sheen (minimalista, mate y fluido) */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 will-change-transform"
          style={{
            opacity: "var(--opacity)",
            background: glareGradients[glareColor],
            mixBlendMode: "screen",
          }}
        />

        {/* Reflejo lineal sutil de pasada diagonal */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 will-change-transform"
          style={{
            opacity: "var(--opacity)",
            background: `linear-gradient(
              135deg,
              transparent 0%,
              rgba(255, 255, 255, 0.05) calc(var(--m-x) - 20%),
              rgba(0, 163, 255, 0.12) var(--m-x),
              rgba(255, 255, 255, 0.06) calc(var(--m-x) + 15%),
              transparent 100%
            )`,
            mixBlendMode: "overlay",
          }}
        />

        {/* Contenido interactivo */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between">
          {children}
        </div>
      </div>
    </div>
  );
};
