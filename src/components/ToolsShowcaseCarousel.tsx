"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  ExternalLink
} from "lucide-react";
import CircularCarousel from "@/components/CircularCarousel";

export interface WorkshopToolItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  subtitle: string;
  desc: string;
  href: string;
  badge: string;
  action: string;
}

export const WORKSHOP_TOOLS: WorkshopToolItem[] = [
  {
    id: "dtf-builder",
    src: "/tools/dtf-builder.svg",
    alt: "Armador de Metros DTF",
    title: "Armador de Metros DTF",
    subtitle: "Bobina 58.0 cm • Pliegos de 1m y 2m",
    desc: "Acomoda y organiza múltiples diseños en un lienzo calibrado de 58 cm de ancho. Duplica con 1 clic, calcula metros reales y exporta a 300 DPI con transparencia real.",
    href: "/tools/dtf-builder",
    badge: "MÓDULO PRINCIPAL",
    action: "Armar Metro DTF",
  },
  {
    id: "scanner",
    src: "/tools/scanner.svg",
    alt: "Checador & Escáner de Calidad",
    title: "Checador & Escáner de Calidad",
    subtitle: "Diagnóstico Preventivo • Calificación 0-100%",
    desc: "Revisa si el fondo está 100% transparente, detecta si hay manchas o halos que harían salir tinta blanca de más y calcula medidas máximas en centímetros para evitar estampados pixelados.",
    href: "/tools/scanner",
    badge: "CONTROL PREVENTIVO",
    action: "Escanear Diseño",
  },
  {
    id: "remove-bg",
    src: "/tools/remove-bg.svg",
    alt: "Quitar Fondo Inteligente",
    title: "Quitar Fondo Inteligente",
    subtitle: "Canal RGBA Puro para DTF",
    desc: "Elimina fondos de fotos y logotipos preservando las tipografías blancas y los detalles finos dentro del arte para que queden listos para imprimir directo en film.",
    href: "/tools/remove-bg",
    badge: "FONDO TRANSPARENTE",
    action: "Quitar Fondo",
  },
  {
    id: "enhance",
    src: "/tools/enhance.svg",
    alt: "Mejorar Calidad (Superresolución)",
    title: "Mejorar Calidad (Superresolución)",
    subtitle: "Nitidez 2X y 4X a 300 DPI",
    desc: "Multiplica la resolución y nitidez de imágenes de baja calidad para que tus fotos y logos no salgan borrosos ni con bordes dentados en la prenda.",
    href: "/tools/enhance",
    badge: "SUPERRESOLUCIÓN",
    action: "Mejorar Nitidez",
  },
  {
    id: "remove-color",
    src: "/tools/remove-color.svg",
    alt: "Borrar un Color Específico (Gotero)",
    title: "Borrar un Color Específico (Gotero)",
    subtitle: "Extracción Quirúrgica",
    desc: "Toca con el gotero cualquier color que te estorbe (fondos negros, blancos o manchas contaminantes) para volverlo 100% transparente con tolerancia regulable.",
    href: "/tools/remove-color",
    badge: "GOTERO DIRECTO",
    action: "Borrar Color",
  },
  {
    id: "clean-alpha",
    src: "/tools/clean-alpha.svg",
    alt: "Limpiar Bordes Blancos",
    title: "Limpiar Bordes Blancos",
    subtitle: "Anti-Halo Lechoso",
    desc: "Elimina sombras transparentes y halos lechosos alrededor de tu diseño para evitar que la base blanca del cabezal de impresión se desborde por los lados.",
    href: "/tools/clean-alpha",
    badge: "SIN MANCHAS DE TINTA",
    action: "Limpiar Bordes",
  },
];

export function ToolsShowcaseCarousel() {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [preset, setPreset] = useState<"cylinder" | "orbit" | "wheel" | "panorama">("cylinder");

  const currentTool = WORKSHOP_TOOLS[activeIndex] || WORKSHOP_TOOLS[0];

  const handleSelectTool = (item: any) => {
    if (item?.href) {
      router.push(item.href);
    } else if (currentTool?.href) {
      router.push(currentTool.href);
    }
  };

  return (
    <div className="relative rounded-3xl border border-[#20232A] bg-gradient-to-b from-[#16181D]/90 via-[#0D0E11] to-[#0A0B0E] p-6 sm:p-10 overflow-hidden shadow-2xl space-y-6">
      {/* Encabezado del Carrusel 3D */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#20232A] pb-5">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-mono font-bold text-white uppercase tracking-wider mb-2">
            <Rotate3d className="h-3.5 w-3.5 animate-spin-slow" />
            <span>Selector 3D Circular de Herramientas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
            Gira y Elige la Función para tu Taller
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-[#8E95A5]">
            Arrastra el carrusel en 3D, selecciona cualquiera de las funciones oficiales y entra directo a trabajar.
          </p>
        </div>

        {/* Selector de Perspectiva 3D */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0D0E11] border border-[#20232A] p-1.5 rounded-xl self-start sm:self-auto">
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
              onClick={() => setPreset(p.key)}
              className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                preset === p.key
                  ? "bg-white text-black shadow-glow-white"
                  : "text-[#8E95A5] hover:text-white hover:bg-[#16181D]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Contenedor del Carrusel Circular */}
      <div className="relative h-[380px] sm:h-[430px] w-full rounded-2xl bg-black/60 border border-[#20232A] overflow-hidden flex items-center justify-center">
        <CircularCarousel
          items={WORKSHOP_TOOLS}
          preset={preset}
          cardWidth={240}
          aspectRatio={1}
          gap={20}
          tilt={preset === "orbit" ? -14 : -4}
          speed={10}
          autoplay="drift"
          pauseOnHover={true}
          draggable={true}
          onChange={(index: number) => setActiveIndex(index)}
          onItemClick={(item: any) => handleSelectTool(item)}
          className="w-full h-full"
        />

        {/* Indicador de Ayuda / Arrastre */}
        <div className="absolute top-3 right-3 pointer-events-none rounded-lg border border-white/10 bg-black/70 px-2.5 py-1 text-[11px] font-mono text-neutral-400 backdrop-blur-sm hidden sm:block">
          Arrastra • Clic en tarjeta para abrir
        </div>
      </div>

      {/* Tarjeta de Control & Selección Activa */}
      <div className="rounded-2xl border border-white/20 bg-[#16181D] p-5 sm:p-6 shadow-xl transition-all">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-bold text-white border border-white/30 bg-white/10 px-2.5 py-0.5 rounded-full">
                {currentTool.badge}
              </span>
              <span className="font-mono text-xs text-[#8E95A5]">
                {currentTool.subtitle}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {currentTool.title}
            </h3>

            <p className="text-xs sm:text-sm text-[#8E95A5] leading-relaxed max-w-3xl">
              {currentTool.desc}
            </p>
          </div>

          {/* Botón de Entrada Directa a la Herramienta Seleccionada */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <Link
              href={currentTool.href}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-white hover:bg-neutral-200 px-6 py-3.5 text-xs sm:text-sm font-black text-black transition-all shadow-glow-white active:scale-95"
            >
              <span>{currentTool.action}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Mini Paginador de Herramientas */}
        <div className="mt-5 pt-4 border-t border-[#20232A] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-[#8E95A5]">
          <div className="flex items-center gap-1.5">
            {WORKSHOP_TOOLS.map((t, idx) => (
              <span
                key={t.id}
                className={`h-2 rounded-full transition-all ${
                  idx === activeIndex ? "w-6 bg-white" : "w-2 bg-neutral-700"
                }`}
              />
            ))}
          </div>
          <span>
            Herramienta <strong>{activeIndex + 1}</strong> de <strong>{WORKSHOP_TOOLS.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

export default ToolsShowcaseCarousel;
