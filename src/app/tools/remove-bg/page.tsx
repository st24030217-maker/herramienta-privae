"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { ShieldCheck, Layers, Sparkles } from "lucide-react";

export default function RemoveBgPage() {
  return (
    <ToolLayout
      title="Quitar Fondo"
      description="Borra fondos blancos, negros o lisos dejando tu diseño recortado y listo para estampar. Cuida tus letras y detalles interiores para que no se borren por error."
      badge="Fondo Transparente"
      apiEndpoint="/api/process/remove-bg"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          {/* Selector de Fondo */}
          <div>
            <label className="block text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
              1. ¿Qué fondo tiene tu imagen?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "auto", title: "Automático", desc: "Detecta las orillas y el fondo solo" },
                { id: "white", title: "Fondo Blanco", desc: "Para imágenes y JPGs con fondo blanco" },
                { id: "black", title: "Fondo Negro", desc: "Para siluetas y diseños oscuros" },
              ].map((bg) => {
                const isSelected = (customParams.bgType || "auto") === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setCustomParam("bgType", bg.id)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-md ring-2 ring-[#00A3FF]"
                        : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                    }`}
                  >
                    <span className="font-bold text-sm text-[#F3F4F6]">{bg.title}</span>
                    <span className="font-mono text-[11px] text-[#8E95A5] mt-0.5">{bg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selector de Modo: Contiguo vs Global */}
          <div>
            <label className="block text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
              2. ¿Cómo quieres recortarlo?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "contiguous",
                  title: "Solo por fuera (Recomendado)",
                  desc: "Borra el fondo exterior y protege letras blancas, ojos o detalles de adentro.",
                  icon: ShieldCheck,
                },
                {
                  id: "global",
                  title: "En toda la imagen",
                  desc: "Borra ese color donde sea que aparezca, adentro o afuera.",
                  icon: Layers,
                },
              ].map((m) => {
                const isSelected = (customParams.mode || "contiguous") === m.id;
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setCustomParam("mode", m.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all active:scale-95 ${
                      isSelected
                        ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-md ring-2 ring-[#00A3FF]"
                        : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                    }`}
                  >
                    <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isSelected ? "text-[#00A3FF]" : "text-[#8E95A5]"}`} />
                    <div>
                      <span className="font-bold text-sm text-[#F3F4F6] block">{m.title}</span>
                      <span className="font-mono text-[11px] text-[#8E95A5] mt-0.5 block">{m.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-[#20232A]">
            {/* Fuerza de recorte */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">¿Qué tanto debe borrar? (Fuerza):</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.sensitivity || 35}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={customParams.sensitivity || 35}
                onChange={(e) => setCustomParam("sensitivity", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-[#00A3FF] cursor-pointer"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Súbelo si ves que todavía quedan manchas o sombras del fondo viejo.
              </span>
            </div>

            {/* Suavizado de orillas */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Suavizado de Orillas:</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.featherRadius || 2} px
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="8"
                value={customParams.featherRadius || 2}
                onChange={(e) => setCustomParam("featherRadius", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-[#00A3FF] cursor-pointer"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Difumina un poquito el borde para que no se vea cortado con tijera.
              </span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
