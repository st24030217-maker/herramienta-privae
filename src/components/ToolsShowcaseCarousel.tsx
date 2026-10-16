"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import GlassSurface from "@/components/GlassSurface";
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

// Las 5 Herramientas Oficiales requeridas en Propuesta_Herramienta_Privae.pdf + Escáner de Diagnóstico
export const WORKSHOP_TOOLS: WorkshopToolItem[] = [
  {
    id: "remove-bg",
    src: "/tools/dtf_remover_fondo_minimal_bn.png",
    alt: "01 Remover Fondo",
    shortName: "01 · Remover Fondo",
    title: "01 · Remover Fondo (PNG 300 DPI)",
    subtitle: "Bordes limpios en cabello y formas irregulares • Transparencia Real",
    desc: "Sube tu imagen y el sistema detecta el sujeto u objeto principal, elimina el fondo con bordes limpios y conserva transparencia real en PNG a mínimo 300 DPI.",
    href: "/tools/remove-bg",
    badge: "MÓDULO 01 • REMOVER FONDO",
    action: "Abrir 01 · Remover Fondo",
    accent: "border-white/40 text-white bg-white/10",
    icon: Scissors,
  },
  {
    id: "enhance",
    src: "/tools/dtf_mejorar_calidad_minimal_bn.png",
    alt: "02 Mejorar Calidad / Resolución",
    shortName: "02 · Mejorar Calidad",
    title: "02 · Mejorar Calidad / Resolución",
    subtitle: "Superresolución sin deformar • Salida PNG 300 DPI",
    desc: "Sube una imagen de baja o media resolución y mejora su nitidez, tamaño y definición sin deformar el diseño, conservando la transparencia en PNG a mínimo 300 DPI.",
    href: "/tools/enhance",
    badge: "MÓDULO 02 • MEJORAR RESOLUCIÓN",
    action: "Abrir 02 · Mejorar Calidad",
    accent: "border-white/40 text-white bg-white/10",
    icon: Sparkles,
  },
  {
    id: "remove-color",
    src: "/tools/dtf_eliminar_color_minimal_bn.png",
    alt: "03 Eliminar un Color",
    shortName: "03 · Eliminar un Color",
    title: "03 · Eliminar un Color (Cuentagotas)",
    subtitle: "Selector visual con rango de tolerancia ajustable • PNG 300 DPI",
    desc: "Selecciona visualmente sobre la imagen el color que deseas retirar con el cuentagotas y conviértelo en transparencia con tolerancia regulable sin dañar otros colores.",
    href: "/tools/remove-color",
    badge: "MÓDULO 03 • ELIMINAR COLOR",
    action: "Abrir 03 · Eliminar un Color",
    accent: "border-white/40 text-white bg-white/10",
    icon: Pipette,
  },
  {
    id: "clean-alpha",
    src: "/tools/dtf_quitar_semitransparencias_minimal_bn.png",
    alt: "04 Quitar Semitransparencias",
    shortName: "04 · Quitar Semitransparencias",
    title: "04 · Quitar Semitransparencias (Hasta 58×200 cm)",
    subtitle: "Purificación de canal alfa apta para DTF • Soporta pliegos grandes",
    desc: "Detecta píxeles semitransparentes y corrige el canal alfa en imágenes individuales o archivos grandes de hasta 58 × 200 cm para eliminar residuos y halos no deseados a 300 DPI.",
    href: "/tools/clean-alpha",
    badge: "MÓDULO 04 • SEMITRANSPARENCIAS",
    action: "Abrir 04 · Quitar Semitransparencias",
    accent: "border-white/40 text-white bg-white/10",
    icon: Layers,
  },
  {
    id: "dtf-builder",
    src: "/tools/dtf_armador_archivos_minimal_bn.png",
    alt: "05 Armador de Archivos DTF",
    shortName: "05 · Armador DTF",
    title: "05 · Armador de Archivos DTF (58×100 y 58×200 cm)",
    subtitle: "Lienzo a escala con medidas en cm, acomodo automático y salida 300 DPI",
    desc: "Lienzo de trabajo con formatos exactos de 58 × 100 cm y 58 × 200 cm. Sube múltiples diseños, muévelos, escálalos proporcionalmente, duplícalos y exporta el pliego completo en PNG transparente a 300 DPI.",
    href: "/tools/dtf-builder",
    badge: "MÓDULO 05 • ARMADOR DTF",
    action: "Abrir 05 · Armador de Archivos DTF",
    accent: "border-white/40 text-white bg-white/10",
    icon: LayoutGrid,
  },
  {
    id: "scanner",
    src: "/tools/dtf_escaner_calidad_minimal_bn.png",
    alt: "Escáner de Calidad DTF",
    shortName: "06 · Escáner DTF",
    title: "06 · Escáner de Calidad DTF",
    subtitle: "Revisión de Transparencia, Halos y Resolución 300 DPI",
    desc: "Verifica antes de imprimir si tu archivo cumple con transparencia real, ausencia de semitransparencias y resolución efectiva en centímetros.",
    href: "/tools/scanner",
    badge: "MÓDULO 06 • CONTROL DE CALIDAD",
    action: "Abrir 06 · Escáner de Calidad",
    accent: "border-white/40 text-white bg-white/10",
    icon: ScanSearch,
  },
];

const CAROUSEL_RING_ITEMS = [...WORKSHOP_TOOLS, ...WORKSHOP_TOOLS];

export function ToolsShowcaseCarousel() {
  const router = useRouter();
  const carouselApiRef = useRef<CircularCarouselApi | null>(null);
  const [rawIndex, setRawIndex] = useState(0);
  const [preset, setPreset] = useState<"cylinder" | "orbit" | "wheel" | "panorama">("cylinder");

  const activeToolIndex =
    ((rawIndex % WORKSHOP_TOOLS.length) + WORKSHOP_TOOLS.length) %
    WORKSHOP_TOOLS.length;
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

  const handleCardClick = (
    item: WorkshopToolItem,
    _index: number,
    wasActive?: boolean
  ) => {
    if (wasActive && item?.href) {
      router.push(item.href);
    }
  };

  return (
    <div className="relative w-full bg-transparent pt-6 pb-2 space-y-6">
      {/* LÁMPARA DE LUZ SUPERIOR + TÍTULO HERO TRANSPARENTE (SIN RECUADROS) */}
      <div className="relative flex flex-col items-center justify-center pt-10 sm:pt-14 pb-2 overflow-visible">
        <div className="pointer-events-none relative flex w-full max-w-4xl items-center justify-center isolate z-0 mb-4">
          <motion.div
            initial={{ opacity: 0.35, width: "12rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute top-0 right-1/2 h-48 w-[30rem] bg-gradient-conic from-white/75 via-transparent to-transparent [--conic-position:from_70deg_at_center_top] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_72%)] will-change-transform"
          />

          <motion.div
            initial={{ opacity: 0.35, width: "12rem" }}
            animate={{ opacity: 1, width: "30rem" }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
            }}
            className="absolute top-0 left-1/2 h-48 w-[30rem] bg-gradient-conic from-transparent via-transparent to-white/75 [--conic-position:from_290deg_at_center_top] [mask-image:radial-gradient(ellipse_at_top,black_20%,transparent_72%)] will-change-transform"
          />

          <motion.div
            initial={{ width: "8rem", opacity: 0.25 }}
            animate={{ width: "22rem", opacity: 0.55 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="absolute -top-6 z-20 h-28 w-80 rounded-full bg-white blur-3xl"
          />

          <motion.div
            initial={{ width: "12rem", opacity: 0.6 }}
            animate={{ width: "30rem", opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-30 h-0.5 w-[30rem] max-w-[88vw] bg-white shadow-[0_0_25px_4px_rgba(255,255,255,0.95)]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0.4, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 text-center max-w-4xl mx-auto px-2 space-y-3 mt-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-mono font-bold text-white uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>05 HERRAMIENTAS • 5 DÍAS PRUEBA GRATIS • 300 DPI • 58 CM DTF</span>
          </div>

          <h1 className="bg-gradient-to-b from-white via-white to-neutral-400 bg-clip-text text-transparent text-4xl sm:text-6xl lg:text-7xl font-black tracking-wide leading-none drop-shadow-[0_6px_30px_rgba(0,0,0,0.85)]">
            PREPARACIÓN DE IMÁGENES Y DTF
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto font-normal">
            Gira el carrusel 3D con el cursor o selecciona cualquiera de los 5 módulos oficiales de Privae Textil para preparar tus archivos a 300 DPI.
          </p>
        </motion.div>
      </div>

      {/* BARRA FLUIDA CON INDICADOR DESLIZANTE (SPRING LAYOUT ID) */}
      <AnimatedContent distance={20} delay={0.04} trigger="mount">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 max-w-5xl mx-auto px-2">
          {WORKSHOP_TOOLS.map((tool, idx) => {
            const Icon = tool.icon;
            const isSelected = idx === activeToolIndex;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => handleSelectPill(idx)}
                className={`relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-mono font-bold transition-colors duration-200 ${
                  isSelected
                    ? "text-black"
                    : "bg-white/5 text-neutral-300 border border-white/15 hover:border-white/40 hover:bg-white/10 hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="activeToolPill"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-full bg-white shadow-[0_0_25px_rgba(255,255,255,0.45)] -z-10"
                  />
                )}
                <Icon className={`h-4 w-4 transition-colors ${isSelected ? "text-black" : "text-white/80"}`} />
                <span>{tool.shortName}</span>
              </button>
            );
          })}
        </div>
      </AnimatedContent>

      {/* ESCENARIO 3D GIGANTE Y 100% TRANSPARENTE (60-120 FPS) */}
      <AnimatedContent distance={28} delay={0.08} trigger="mount">
        <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[540px] bg-transparent flex items-center justify-center select-none">
          <button
            type="button"
            onClick={() => carouselApiRef.current?.stepBy(-1)}
            aria-label="Servicio anterior"
            className="absolute left-1 sm:left-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:border-white hover:bg-white hover:text-black active:scale-95 shadow-2xl"
          >
            <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>

          <CircularCarousel
            apiRef={carouselApiRef}
            items={CAROUSEL_RING_ITEMS}
            preset={preset}
            intro="spin"
            cardWidth={340}
            aspectRatio={2848 / 1600}
            gap={26}
            tilt={preset === "orbit" ? -12 : -4}
            speed={9.5}
            momentum={0.82}
            autoplay="drift"
            pauseOnHover={true}
            draggable={true}
            depthFade={0.42}
            innerShade={0.45}
            cornerRadius={20}
            onChange={(index: number) => setRawIndex(index)}
            onItemClick={handleCardClick}
            className="w-full h-full bg-transparent"
          />

          <button
            type="button"
            onClick={() => carouselApiRef.current?.stepBy(1)}
            aria-label="Siguiente servicio"
            className="absolute right-1 sm:right-4 z-20 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full border border-white/25 bg-black/50 text-white backdrop-blur-md transition-transform duration-200 hover:scale-110 hover:border-white hover:bg-white hover:text-black active:scale-95 shadow-2xl"
          >
            <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
          </button>
        </div>
      </AnimatedContent>

      {/* PANEL FLOTANTE CON EFECTO GLASS SURFACE Y TRANSICIÓN SUAVE */}
      <AnimatedContent distance={24} delay={0.12} trigger="mount">
        <div className="max-w-4xl mx-auto px-2">
          <GlassSurface
            width={"100%" as any}
            height={"auto" as any}
            borderRadius={20}
            borderWidth={0.08}
            brightness={45}
            opacity={0.88}
            blur={14}
            className="w-full rounded-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.65)]"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-5 w-full p-2 sm:p-3">
              <div className="flex-1 min-h-[104px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentTool.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="space-y-1.5 text-center md:text-left"
                  >
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
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-col items-center md:items-end gap-3 shrink-0 w-full md:w-auto">
                <Link
                  href={currentTool.href}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-3 rounded-xl bg-white hover:bg-neutral-200 px-7 py-4 text-sm sm:text-base font-black text-black transition-all duration-200 shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-[1.03] active:scale-95"
                >
                  <span>{currentTool.action}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>

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
          </GlassSurface>
        </div>
      </AnimatedContent>
    </div>
  );
}

export default ToolsShowcaseCarousel;
