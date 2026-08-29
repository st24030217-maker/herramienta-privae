"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function CleanAlphaPage() {
  return (
    <ToolLayout
      title="04 · Quitar Semitransparencias (Especial DTF)"
      description="Detecta píxeles semitransparentes y corrige el canal alfa para dejar una transparencia pura apta para DTF, eliminando halos, sombras translúcidas y residuos que causan acumulación indeseada de tinta blanca. Soporta lienzos grandes de hasta 58 × 200 cm a 300 DPI."
      badge="Filtro DTF Puro 300 DPI"
      apiEndpoint="/api/process/clean-alpha"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Umbral Alpha */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Umbral de Corte Alfa:</span>
              <span className="font-mono text-amber-400">{customParams.threshold || 40} / 255</span>
            </div>
            <input
              type="range"
              min="5"
              max="150"
              value={customParams.threshold || 40}
              onChange={(e) => setCustomParam("threshold", e.target.value)}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Píxeles con opacidad menor a este valor se eliminan por completo.
            </span>
          </div>

          {/* Modo DTF Sólido */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="boostSolid"
              checked={customParams.boostSolid === "true"}
              onChange={(e) => setCustomParam("boostSolid", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
            />
            <label htmlFor="boostSolid" className="text-slate-200 cursor-pointer font-medium">
              Convertir Opacidades Válidas a 100% Sólido (Recomendado DTF)
            </label>
          </div>

          {/* Suavizado */}
          <div className="flex items-center gap-2 pt-4">
            <input
              type="checkbox"
              id="smoothEdges"
              checked={customParams.smoothEdges === "true"}
              onChange={(e) => setCustomParam("smoothEdges", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-blue-500"
            />
            <label htmlFor="smoothEdges" className="text-slate-200 cursor-pointer">
              Filtro de Limpieza de Ruido en Bordes
            </label>
          </div>
        </div>
      )}
    />
  );
}
