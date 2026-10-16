"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  LayoutGrid,
  ScanSearch,
  Scissors,
  Pipette,
  Layers,
  Rotate3d,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import CircularCarousel, { CircularCarouselApi } from "@/components/CircularCarousel";
import { AnimatedContent } from "@/components/AnimatedContent";

export interface WorkshopToolItem {
  id: string;
  src: string;
  alt: string;
  shortName: string;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  badge: string;
  action: string;
  accent: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const WORKSHOP_TOOLS: WorkshopToolItem[] = [
  {
    id: "dtf-builder",
    src: "/tools/dtf-builder.svg",
    alt: "Armar Metro DTF",
    shortName: "Armar Metro DTF",
    title: "Armar Metro DTF (Bobina 58 cm)",
    subtitle: "Pliegos de 1 metro y 2 metros • 300 DPI",
    desc: "Acomoda varios diseños en tu lienzo de 58 cm de ancho, duplica logos con 1 clic y descarga tu archivo listo para imprimir.",
    href: "/tools/dtf-builder",
    badge: "SERVICIO #1 • MÓDULO PRINCIPAL",
    action: "Abrir Armador de Metros DTF",
    accent: "border-emerald-400/50 text-emerald-300 bg-emerald-500/10",
    icon: LayoutGrid,
  },
  {
    id: "scanner",
    src: "/tools/scanner.svg",
    alt: "Checar Calidad DTF",
    shortName: "Checar Calidad",
    title: "Checador & Escáner de Calidad DTF",
    subtitle: "Semáforo Preventivo 0 a 100%",
    desc: "Revisa en segundos si tu imagen tiene fondo 100% transparente, si tiene buena resolución (300 DPI) y qué medida máxima aguanta sin pixelarse.",
    href: "/tools/scanner",
    badge: "SERVICIO #2 • DIAGNÓSTICO",
    action: "Escanear mi Diseño Ahora",
    accent: "border-blue-400/50 text-blue-300 bg-blue-500/10",
    icon: ScanSearch,
  },
  {
    id: "remove-bg",
    src: "/tools/remove-bg.svg",
    alt: "Quitar Fondo",
    shortName: "Quitar Fondo",
    title: "Quitar Fondo Inteligente",
    subtitle: "Transparencia Pura RGBA",
    desc: "Borra el fondo de cualquier foto o logotipo cuidando las letras blancas y los detalles internos para que quede listo para DTF.",
    href: "/tools/remove-bg",
    badge: "SERVICIO #3 • TRANSPARENCIA",
    action: "Quitar Fondo a mi Imagen",
    accent: "border-purple-400/50 text-purple-300 bg-purple-500/10",
    icon: Scissors,
  },
  {
    id: "enhance",
    src: "/tools/enhance.svg",
    alt: "Subir Calidad 4X",
    shortName: "Subir Calidad 4X",
    title: "Mejorar Calidad y Nitidez (4X)",
    subtitle: "Superresolución a 300 DPI",
    desc: "Convierte imágenes borrosas o bajadas de WhatsApp en archivos ultra nítidos a 300 DPI para que tu estampado salga perfecto.",
    href: "/tools/enhance",
    badge: "SERVICIO #4 • SUPERRESOLUCIÓN",
    action: "Subir Calidad 4X Ahora",
    accent: "border-amber-400/50 text-amber-300 bg-amber-500/10",
    icon: Sparkles,
  },
  {
    id: "remove-color",
    src: "/tools/remove-color.svg",
    alt: "Borrar un Color",
    shortName: "Borrar un Color",
    title: "Borrar un Color Específico (Gotero)",
    subtitle: "Extracción Directa con 1 Clic",
    desc: "Toca con el gotero cualquier color que te estorbe (fondos negros, blancos o manchas) para volverlo 100% transparente al instante.",
    href: "/tools/remove-color",
    badge: "SERVICIO #5 • GOTERO DIRECTO",
    action: "Usar Gotero Quita-Color",
    accent: "border-pink-400/50 text-pink-300 bg-pink-500/10",
    icon: Pipette,
  },
  {
    id: "clean-alpha",
    src: "/tools/clean-alpha.svg",
    alt: "Limpiar Bordes",
    shortName: "Limpiar Bordes",
    title: "Limpiar Bordes y Halos Blancos",
    subtitle: "Cero Filtración de Base Blanca",
    desc: "Elimina las orillas blancas y manchas fantasma alrededor de tu recorte para que la tinta blanca de la máquina no se asome.",
    href: "/tools/clean-alpha",
    badge: "SERVICIO #6 • ANTI-HALO",
    action: "Limpiar Bordes de mi Diseño",
    accent: "border-cyan-400/50 text-cyan-300 bg-cyan-500/10",
    icon: Layers,
  },
];

// Duplicamos los 6 servicios (12 tarjetas en el anillo 360°) para que el cilindro 3D tenga gran diámetro y amplitud visual
const CAROUSEL_RING_ITEMS = [...WORKSHOP_TOOLS, ...WORKSHOP_TOOLS];

export function ToolsShowcaseCarousel() {
  const router = useRouter();
  const carouselApiRef = useRef<CircularCarouselApi | null>(null);
  const [rawIndex, setRawIndex] = useState(0);
  const [preset, setPreset] = useState<"cylinder" | "orbit" | "wheel" | "panorama">("cylinder");

  const activeToolIndex = ((rawIndex % WORKSHOP_TOOLS.length) + WORKSHOP_TOOLS.length) % WORKSHOP_TOOLS.length;
  const currentTool = WORKSHOP_TOOLS[activeToolIndex] || WORKSHOP_TOOLS[0];

  const handleSelectPill = (toolIdx: number) => {
    if (toolIdx === activeToolIndex) {
      router.push(WORKSHOP_TOOLS[toolIdx].href);
      return;
    }
    const candidateA = toolIdx;
    const candidateB = toolIdx + WORKSHOP_TOOLS.length;
    const distA = Math.abs(rawIndex - candidateA);
    const distB = Math.abs(rawIndex - candidateB);
    const targetRingIndex = distA <= distB ? candidateA : candidateB;
    carouselApiRef.current?.focusIndex(targetRingIndex);
    setRawIndex(targetRingIndex);
  };

  const handleCardClick = (item: WorkshopToolItem, _index: number, wasActive?: boolean) => {
    if (wasActive && item?.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="relative w-full bg-transparent pt-6 pb-2 space-y-6">
      {/* LÁMPARA DE LUZ SUPERIOR + TÍTULO HERO TRANSPARENTE (SIN RECUADROS) */}
      <div className="relative flex flex-col items-center justify-center pt-10 sm:pt-14 pb-2 overflow-visible">
        {/* Efecto Aceternity Lamp Transparente arriba del título */}
        <div className="pointer-events-none relative flex w-full max-w-4xl items-center justify-center isolate z-0 mb-4">
          {/* Cono de luz izquierdo */}
          <motion.div
            initial={{ opacity: 0.35, width: "12rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.1, duration: 0.85, ease: "easeInOut" }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute top-0 right-1/2 h-48 w-[30rem] bg-gradient-conic from-white/75 via-transparent to-transparent [--conic-position:from_70deg_at_center_top] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_72%)]"
          />

          {/* Cono de luz derecho */}
          <motion.div
            initial={{ opacity: 0.35, width: "12rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.1, duration: 0.85, ease: "easeInOut" }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute top-0 left-1/2 h-48 w-[30rem] bg-gradient-conic from-transparent via-transparent to-white/75 [--conic-position:from_290deg_at_center_top] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_72%)]"
          />

          {/* Resplandor difuso central bajo la lámpara */}
          <motion.div
            initial={{ width: "8rem", opacity: 0.25 }}
            animate={{ width: "22rem", opacity: 0.55 }}
            transition={{ delay: 0.1, duration: 0.85, ease: "easeInOut" }}
            className="absolute -top-6 z-20 h-28 w-80 rounded-full bg-white blur-3xl"
          />

          {/* Tubo luminoso horizontal de la lámpara */}
          <motion.div
            initial={{ width: "12rem", opacity: 0.6 }}
            animate={{ width: "30rem", opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.85, ease: "easeInOut" }}
            className="relative z-30 h-0.5 w-[30rem] max-w-[88vw] bg-white shadow-[0_0_25px_4px_rgba(255,255,255,0.95)]"
          />
        </div>

        {/* Contenido Hero iluminado por la lámpara */}
        <motion.div
          initial={{ opacity: 0.4, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.75, ease: "easeOut" }}
          className="relative z-10 text-center max-w-4xl mx-auto px-2 space-y-3 mt-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-mono font-bold text-white uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>TALLER DTF PRIVAE • BOBINA 58 CM • 300 DPI</span>
          </div>

          <h1 className="bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent text-4xl sm:text-6xl lg:text-7xl font-black tracking-wide leading-none drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]">
            ELIGE EL SERVICIO PARA TU DISEÑO
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto font-normal">
            Gira el carrusel 3D, usa las flechas o toca cualquier servicio para preparar e imprimir tus archivos al instante.
          </p>
        </motion.div>
      </div>

      {/* BARRA INTUITIVA DE ACCESO RÁPIDO A LOS 6 SERVICIOS */}
      <AnimatedContent distance={25} delay={0.08} trigger="mount">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-5xl mx-auto px-2">
          {WORKSHOP_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = idx === activeToolIndex;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleSelectPill(idx)}
                className={`group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-mono font-bold transition-all duration-200 backdrop-blur-md ${
                  isSelected
                    ? "bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.45)] scale-105"
                    : "bg-white/5 text-neutral-300 border border-white/15 hover:border-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-black" : "text-white/80"}`} />
                <span>{tool.shortName}</span>
              </button>
            );
          })}
        </div>
      </AnimatedContent>

      {/* ESCENARIO 3D GIGANTE Y 100% TRANSPARENTE (SIN BORDES NI CAJAS) */}
      <AnimatedContent distance={40} delay={0.14} trigger="mount">
        <div className="relative w-full h-[460px] sm:h-[560px] lg:h-[600px] bg-transparent flex items-center justify-center select-none">
          {/* Botón Flotante Izquierdo */}
          <button
            type="button"
            onClick={() => carouselApiRef.current?.stepBy(-1)}
            aria-label="Servicio anterior"
            className="absolute left-1 sm:left-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white hover:bg-white hover:text-black active:scale-95 shadow-2xl"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          {/* Carrusel Circular 3D Transparente */}
          <CircularCarousel
            apiRef={carouselApiRef}
            items={CAROUSEL_RING_ITEMS}
            preset={preset}
            intro="spin"
            cardWidth={295}
            aspectRatio={600 / 720}
            gap={22}
            tilt={preset === "orbit" ? -12 : -4}
            speed={8}
            autoplay="drift"
            pauseOnHover={true}
            draggable={true}
            depthFade={0.42}
            innerShade={0.45}
            cornerRadius={22}
            onChange={(index: number) => setRawIndex(index)}
            onItemClick={handleCardClick}
            className="w-full h-full bg-transparent"
          />

          {/* Botón Flotante Derecho */}
          <button
            type="button"
            onClick={() => carouselApiRef.current?.stepBy(1)}
            aria-label="Siguiente servicio"
            className="absolute right-1 sm:right-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md transition-all hover:scale-110 hover:border-white hover:bg-white hover:text-black active:scale-95 shadow-2xl"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>
      </AnimatedContent>

      {/* PANEL FLOTANTE DE ACCIÓN DIRECTA DEL SERVICIO SELECCIONADO */}
      <AnimatedContent distance={30} delay={0.2} trigger="mount">
        <div className="max-w-4xl mx-auto px-2">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 rounded-2xl border border-white/20 bg-black/55 backdrop-blur-xl px-6 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="space-y-1.5 text-center md:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <span className={`font-mono text-xs font-bold border px-3 py-0.5 rounded-full ${currentTool.accent}`}>
                  {currentTool.badge}
                </span>
                <span className="font-mono text-xs text-neutral-400">
                  {currentTool.subtitle}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wide">
                {currentTool.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                {currentTool.desc}
              </p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
              <Link
                href={currentTool.href}
                className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-neutral-200 px-7 py-4 text-sm sm:text-base font-black text-black transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-95"
              >
                <span>{currentTool.action}</span>
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Selector compacto de vista 3D */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
                <Rotate3d className="h-3.5 w-3.5 text-white/70 mr-1" />
                <span>Vista 3D:</span>
                {(
                  [
                    { key: "cylinder", label: "Cilindro" },
                    { key: "orbit", label: "Órbita" },
                    { key: "wheel", label: "Rueda" },
                    { key: "panorama", label: "Panorama" },
                  ] as const
                ).map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setPreset(p.key)}
                    className={`rounded-md px-2 py-0.5 transition-all ${
                      preset === p.key
                        ? "bg-white/20 text-white font-bold"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedContent>
    </div>
  );
}

export default ToolsShowcaseCarousel;
