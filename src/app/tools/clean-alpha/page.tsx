"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function CleanAlphaPage() {
  return (
    <ToolLayout
      title="Depuración de Canal Alfa y Tinta Blanca"
      description="Identifica píxeles semitransparentes y purga el canal alfa RGBA para evitar que el software RIP de la impresora DTF genere depósitos irregulares o halos de tinta blanca de respaldo."
      badge="Prevención de Mancha Blanca DTF"
      apiEndpoint="/api/process/clean-alpha"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Umbral Alpha */}
          <div>
            <div className="flex justify-between text-[#F3F4F6] mb-1.5 font-mono">
              <span className="text-[#8E95A5]">Umbral de Corte Alfa:</span>
              <span className="text-[#00A3FF] font-semibold">{customParams.threshold || 40} / 255</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={customParams.threshold || 40}
              onChange={(e) => setCustomParam("threshold", e.target.value)}
              className="w-full accent-[#00A3FF] cursor-pointer"
            />
            <span className="text-[10px] text-[#8E95A5]/60 font-mono">
              Píxeles bajo este nivel se convierten en 0% alfa.
            </span>
          </div>

          {/* Modo DTF Sólido */}
          <div className="flex items-center gap-2.5 pt-4">
            <input
              type="checkbox"
              id="boostSolid"
              checked={customParams.boostSolid === "true"}
              onChange={(e) => setCustomParam("boostSolid", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-[#20232A] bg-[#0D0E11] text-[#00A3FF] focus:ring-[#00A3FF]"
            />
            <label htmlFor="boostSolid" className="text-[#F3F4F6] cursor-pointer font-mono text-[11px]">
              Forzar opacidad al 100% (Base sólida DTF)
            </label>
          </div>

          {/* Suavizado */}
          <div className="flex items-center gap-2.5 pt-4">
            <input
              type="checkbox"
              id="smoothEdges"
              checked={customParams.smoothEdges === "true"}
              onChange={(e) => setCustomParam("smoothEdges", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-[#20232A] bg-[#0D0E11] text-[#00A3FF] focus:ring-[#00A3FF]"
            />
            <label htmlFor="smoothEdges" className="text-[#8E95A5] cursor-pointer font-mono text-[11px]">
              Filtro de contorno perimetral
            </label>
          </div>
        </div>
      )}
    />
  );
}
