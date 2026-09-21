"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  X, 
  ScanSearch, 
  Scissors, 
  Pipette, 
  Layers, 
  Sparkles, 
  LayoutGrid, 
  CheckCircle2, 
  Lightbulb, 
  ArrowRight, 
  Keyboard,
  Maximize2
} from "lucide-react";

export function UserGuideModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Cerrar con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const steps = [
    {
      title: "1. Checar Calidad",
      desc: "Usa el Semáforo DTF para revisar si tu imagen tiene fondos fantasmas, sombras raras o si está pixelada.",
      tip: "Te dice el tamaño máximo en centímetros a 300 DPI para no estirarla de más.",
      href: "/tools/scanner",
      icon: ScanSearch
    },
    {
      title: "2. Quitar Fondo",
      desc: "Elimina fondos en 1 clic. Selecciona 'Solo por fuera' para proteger letras o detalles interiores.",
      tip: "Usa el visor de fondo negro para asegurar que no queden orillas lechosas.",
      href: "/tools/remove-bg",
      icon: Scissors
    },
    {
      title: "3. Borrar Color",
      desc: "Quita fondos negros puros (#000000) o blancos con un botón para que la tela sea el fondo.",
      tip: "En playeras oscuras, quitar el fondo negro ahorra tinta y deja el transfer súper suave.",
      href: "/tools/remove-color",
      icon: Pipette
    },
    {
      title: "4. Limpiar Bordes (Choke)",
      desc: "Encoge la base blanca 1 o 2 píxeles para que la tinta blanca no se asome por fuera de los colores.",
      tip: "Activa 'Base Blanca Sólida al 100%' para que los colores se vean vivos en prendas negras.",
      href: "/tools/clean-alpha",
      icon: Layers
    },
    {
      title: "5. +Calidad y Nitidez",
      desc: "Aumenta la resolución (2X, 3X, 4X) con interpolación bicúbica y máscara de enfoque profesional.",
      tip: "Limpia imágenes con compresión JPG y las deja listas a 300 DPI certificados.",
      href: "/tools/enhance",
      icon: Sparkles
    },
    {
      title: "6. Armar Metros de 58 cm",
      desc: "Acomoda tus diseños en el rollo de 58 cm. Pellizca las 4 esquinas circulares para achicar o agrandar de forma proporcional.",
      tip: "Usa 'Llenar Todo el Metro con Copias' para duplicar rápido y 'Modo Espejo' si tu rip lo requiere.",
      href: "/tools/dtf-builder",
      icon: LayoutGrid
    }
  ];

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/30 bg-[#0D0E11]/95 px-4 py-2.5 text-xs font-mono font-bold text-white shadow-2xl backdrop-blur-md hover:scale-105 hover:bg-white hover:text-black hover:border-white transition-all active:scale-95 group"
        title="Abrir Guía Rápida de Uso"
      >
        <BookOpen className="h-4 w-4 text-white group-hover:text-black transition-colors" />
        <span className="tracking-wide">Guía de Uso</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-3xl border border-[#20232A] bg-[#16181D] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-[#20232A] px-6 py-4 bg-[#0D0E11]">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white border border-white/20">
                  <BookOpen className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Guía Rápida de Taller DTF
                  </h3>
                  <p className="text-[11px] text-[#8E95A5]">
                    Aprende el flujo de trabajo para dejar tus archivos listos a la primera
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/guia"
                  onClick={() => setIsOpen(false)}
                  className="text-xs font-mono text-white underline hover:text-neutral-300 hidden sm:inline-block mr-2"
                >
                  Ver Manual Completo ↗
                </Link>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-1.5 text-[#8E95A5] hover:text-white hover:bg-[#20232A] transition-colors"
                  aria-label="Cerrar guía"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Selector de Pestañas de Pasos */}
            <div className="flex border-b border-[#20232A] bg-[#0D0E11]/60 overflow-x-auto custom-scrollbar px-2">
              {steps.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-3 text-xs font-mono font-bold whitespace-nowrap transition-colors border-b-2 flex items-center gap-1.5 ${
                    activeTab === idx
                      ? "border-white text-white bg-white/5"
                      : "border-transparent text-[#8E95A5] hover:text-white"
                  }`}
                >
                  <span>Paso {idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Contenido de la Pestaña Activa */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-5 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    PASO 0{activeTab + 1} DE 06
                  </span>
                  <h4 className="text-lg font-bold text-white">
                    {steps[activeTab].title}
                  </h4>
                  <p className="text-xs text-[#8E95A5] leading-relaxed">
                    {steps[activeTab].desc}
                  </p>
                </div>

                <Link
                  href={steps[activeTab].href}
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-neutral-200 px-4 py-2 text-xs font-bold text-black transition-all shadow shrink-0 active:scale-95"
                >
                  <span>Abrir</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Tip de Taller */}
              <div className="rounded-2xl border border-white/20 bg-white/5 p-4 space-y-1">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5" /> Consejo de Producción:
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {steps[activeTab].tip}
                </p>
              </div>

              {/* Atajos Rápidos Esenciales */}
              <div className="rounded-2xl border border-[#20232A] bg-[#0D0E11] p-4 space-y-2.5">
                <span className="text-xs font-mono font-bold text-[#8E95A5] uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard className="h-3.5 w-3.5 text-white" /> Trucos Rápidos del Taller:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-[#20232A] font-mono text-[10px] text-white font-bold">Ctrl + V</kbd>
                    <span className="text-[#8E95A5] text-[11px]">Pega imágenes directo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-[#20232A] font-mono text-[10px] text-white font-bold">Pellizcar</kbd>
                    <span className="text-[#8E95A5] text-[11px]">Cambia tamaño proporcional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-[#20232A] font-mono text-[10px] text-white font-bold">Rueda</kbd>
                    <span className="text-[#8E95A5] text-[11px]">Zoom al metro</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-0.5 rounded bg-[#20232A] font-mono text-[10px] text-white font-bold">Supr</kbd>
                    <span className="text-[#8E95A5] text-[11px]">Borra el diseño del pliego</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con Navegación de Pasos */}
            <div className="flex items-center justify-between border-t border-[#20232A] px-6 py-3.5 bg-[#0D0E11]">
              <button
                type="button"
                disabled={activeTab === 0}
                onClick={() => setActiveTab((t) => Math.max(0, t - 1))}
                className="px-3 py-1.5 rounded-lg border border-[#20232A] bg-[#16181D] text-xs font-mono font-bold text-white hover:bg-[#20232A] disabled:opacity-30 disabled:pointer-events-none transition-all"
              >
                ← Anterior
              </button>

              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`h-1.5 rounded-full cursor-pointer transition-all ${
                      activeTab === i ? "w-6 bg-white" : "w-1.5 bg-[#20232A]"
                    }`}
                  />
                ))}
              </div>

              {activeTab < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setActiveTab((t) => Math.min(steps.length - 1, t + 1))}
                  className="px-3 py-1.5 rounded-lg border border-white/20 bg-white text-xs font-mono font-bold text-black hover:bg-neutral-200 transition-all"
                >
                  Siguiente →
                </button>
              ) : (
                <Link
                  href="/guia"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-white/20 bg-white text-xs font-mono font-bold text-black hover:bg-neutral-200 transition-all"
                >
                  Manual Completo
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
