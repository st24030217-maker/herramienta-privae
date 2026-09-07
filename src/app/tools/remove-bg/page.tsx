"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function RemoveBgPage() {
  return (
    <ToolLayout
      title="Quitar Fondo (Depurar)"
      description="Depura el fondo de cualquier arte o diseño, aislando el estampado con bordes limpios y preservando transparencias reales sin halos lechosos. Salida certificada a 300 DPI."
      badge="Transparencia Alfa DTF"
      apiEndpoint="/api/process/remove-bg"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-5">
          {/* Selector de Fondo con Botones Grandes */}
          <div>
            <label className="block text-xs font-mono text-[#8E95A5] mb-2 uppercase tracking-wider">
              1. Fondo a Depurar (A la Mano):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "auto", title: "Automático (Muestreo)", desc: "Detecta bordes y fondo inteligente" },
                { id: "white", title: "Quitar Fondo Blanco", desc: "Artes sobre blanco / JPG común" },
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
