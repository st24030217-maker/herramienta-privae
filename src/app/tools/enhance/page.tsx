"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { Sparkles, SlidersHorizontal } from "lucide-react";

export default function EnhancePage() {
  return (
    <ToolLayout
      title="Interpolación y Nitidez de Resolución"
      description="Aumenta la densidad de píxeles, nitidez y definición de artes rasterizados sin distorsión geométrica. Interpolación adaptativa para salida certificada a 300 DPI."
      badge="Lanczos3 a 300 DPI"
      apiEndpoint="/api/process/enhance"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Factor de Escala con Botones Grandes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                1. Factor de Escala:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { val: "2", label: "2X", desc: "Duplicar Píxeles" },
                  { val: "4", label: "4X", desc: "Ultra Resolución" },
                ].map((scale) => {
                  const isSelected = String(customParams.scaleFactor || "2") === scale.val;
                  return (
                    <button
                      key={scale.val}
                      type="button"
                      onClick={() => setCustomParam("scaleFactor", scale.val)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-sm ring-1 ring-[#00A3FF]"
                          : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                      }`}
                    >
                      <span className="text-base font-extrabold text-[#F3F4F6] block">{scale.label}</span>
                      <span className="text-[10px] font-mono text-[#8E95A5] block">{scale.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Máscara de Enfoque con Botones Grandes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                2. Máscara de Enfoque:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "light", label: "Suave" },
                  { val: "medium", label: "Estándar" },
                  { val: "strong", label: "Intenso" },
                ].map((lvl) => {
                  const isSelected = (customParams.sharpenLevel || "medium") === lvl.val;
                  return (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => setCustomParam("sharpenLevel", lvl.val)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-sm ring-1 ring-[#00A3FF]"
                          : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#F3F4F6] block">{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reducción de Ruido - Tarjeta Táctil */}
            <div className="flex flex-col justify-end">
              <label
                htmlFor="denoise"
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  customParams.denoise === "true"
                    ? "border-[#00A3FF] bg-[#00A3FF]/10 text-white shadow-sm"
                    : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40"
                }`}
              >
                <input
                  type="checkbox"
                  id="denoise"
                  checked={customParams.denoise === "true"}
                  onChange={(e) => setCustomParam("denoise", e.target.checked ? "true" : "false")}
                  className="h-5 w-5 rounded border-[#20232A] text-[#00A3FF] focus:ring-[#00A3FF] mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#F3F4F6] block">
                    Filtro de Ruido y Granulado
                  </span>
                  <span className="text-[11px] text-[#8E95A5] block">
                    Limpia artefactos de compresión JPEG antes de escalar.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      )}
    />
  );
}
