"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function RemoveBgPage() {
  return (
    <ToolLayout
      title="Limpieza y Recorte de Fondo"
      description="Aísla el sujeto principal, elimina el fondo con bordes limpios y conserva transparencia real en contornos y detalles finos. Salida certificada a 300 DPI."
      badge="Transparencia Alfa 300 DPI"
      apiEndpoint="/api/process/remove-bg"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-5">
          {/* Selector de Fondo con Botones Grandes */}
          <div>
            <label className="block text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
              1. Tipo de Fondo a Eliminar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "auto", title: "Automático", desc: "Muestreo perimetral multizona" },
                { id: "white", title: "Fondo Blanco", desc: "Ideal para diseños sobre blanco" },
                { id: "black", title: "Fondo Negro", desc: "Ideal para siluetas sobre negro" },
              ].map((bg) => {
                const isSelected = (customParams.bgType || "auto") === bg.id;
                return (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setCustomParam("bgType", bg.id)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-[#00A3FF] bg-[#00A3FF]/10 text-white shadow-sm ring-1 ring-[#00A3FF]"
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
                Aumenta si el fondo tiene sombras suaves o textura leve.
              </span>
            </div>

            {/* Suavizado */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Suavizado de Contorno (Feather):</span>
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
                Difumina el contorno perimetral para integración textil natural.
              </span>
            </div>
          </div>
        </div>
      )}
    />
  );
}
