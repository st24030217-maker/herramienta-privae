"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function CleanAlphaPage() {
  return (
    <ToolLayout
      title="Depurar Semitransparencias (Cama Blanca DTF)"
      description="Purga los píxeles semitransparentes y halos lechosos que provocan depósitos sucios de tinta blanca en la tela. Convierte el estampado en base sólida y nítida para impresión DTF. Salida certificada a 300 DPI."
      badge="Control Cama Blanca DTF"
      apiEndpoint="/api/process/clean-alpha"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Umbral Alpha */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Umbral de Corte de Píxel Translúcido:</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.threshold || 40} / 255
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={customParams.threshold || 40}
                onChange={(e) => setCustomParam("threshold", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-[#00A3FF] cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Píxeles con opacidad menor a este valor se eliminan al 100% para evitar halos blancos.
              </span>
            </div>

            {/* Modo DTF Sólido - Tarjeta Botón Grande */}
            <div>
              <label
                htmlFor="boostSolid"
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all active:scale-95 ${
                  customParams.boostSolid === "true"
                    ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-md ring-2 ring-[#00A3FF]"
                    : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40"
                }`}
              >
                <input
                  type="checkbox"
                  id="boostSolid"
                  checked={customParams.boostSolid === "true"}
                  onChange={(e) => setCustomParam("boostSolid", e.target.checked ? "true" : "false")}
                  className="h-5 w-5 rounded border-[#20232A] text-[#00A3FF] focus:ring-[#00A3FF] mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#F3F4F6] block flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-[#00A3FF]" /> Base Sólida DTF (100% Opacidad)
                  </span>
                  <span className="text-[11px] text-[#8E95A5] block">
                    Fuerza 100% opacidad en la tinta para cama blanca densa y colores vibrantes en prendas oscuras.
                  </span>
                </div>
              </label>
            </div>

            {/* Suavizado Perimetral - Tarjeta Botón Grande */}
            <div>
              <label
                htmlFor="smoothEdges"
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all active:scale-95 ${
                  customParams.smoothEdges === "true"
                    ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-md ring-2 ring-[#00A3FF]"
                    : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40"
                }`}
              >
                <input
                  type="checkbox"
                  id="smoothEdges"
                  checked={customParams.smoothEdges === "true"}
                  onChange={(e) => setCustomParam("smoothEdges", e.target.checked ? "true" : "false")}
                  className="h-5 w-5 rounded border-[#20232A] text-[#00A3FF] focus:ring-[#00A3FF] mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[#F3F4F6] block flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-[#00A3FF]" /> Suavizado de Contorno Textil
                  </span>
                  <span className="text-[11px] text-[#8E95A5] block">
                    Elimina el serruchado perimetral dejando un tacto suave y acabado limpio al transferir.
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
