"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { ShieldCheck, Layers, Sparkles } from "lucide-react";

export default function RemoveBgPage() {
  return (
    <ToolLayout
      title="Quitar Fondo (Depurar)"
      description="Aísla el estampado textil eliminando fondos lisos, claros u oscuros con algoritmo Flood-Fill de bordes conectados que protege los detalles interiores de tu arte (como letras y ojos blancos). Salida certificada a 300 DPI."
      badge="Transparencia Alfa DTF"
      apiEndpoint="/api/process/remove-bg"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          {/* Selector de Fondo con Botones Grandes */}
          <div>
            <label className="block text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
              1. Fondo a Depurar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "auto", title: "Automático (Muestreo)", desc: "Detecta bordes y fondo perimetral" },
                { id: "white", title: "Quitar Fondo Blanco", desc: "Artes sobre fondo blanco / JPG común" },
                { id: "black", title: "Quitar Fondo Negro", desc: "Siluetas y estampados oscuros" },
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
              2. Modo de Aislamiento Textil:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "contiguous",
                  title: "Fondo Exterior Contiguo (Recomendado)",
                  desc: "Recorta desde el borde exterior. Protege detalles blancos o claros dentro del diseño.",
                  icon: ShieldCheck,
                },
                {
                  id: "global",
                  title: "Todo el Lienzo (Purga Global)",
                  desc: "Elimina el color objetivo en cualquier parte donde aparezca, interior o exterior.",
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
            {/* Sensibilidad */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Sensibilidad de Recorte:</span>
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
                Aumenta si el fondo tiene sombras suaves o gradientes leves.
              </span>
            </div>

            {/* Suavizado */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Suavizado de Contorno Alfa (Feather):</span>
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
                Suaviza el borde sin desenfocar los colores ni el texto del diseño.
              </span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
