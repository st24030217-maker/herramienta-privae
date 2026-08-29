"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function EnhancePage() {
  return (
    <ToolLayout
      title="02 · Mejorar Calidad / Resolución"
      description="Aumenta la nitidez, tamaño y definición de diseños de baja o media resolución sin deformarlos, optimizándolos para impresión DTF a 300 DPI."
      badge="Upscaling 300 DPI"
      apiEndpoint="/api/process/enhance"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">
              Factor de Escala:
            </label>
            <select
              value={customParams.scaleFactor || 2}
              onChange={(e) => setCustomParam("scaleFactor", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="2">2X (Doble Resolución - Recomendado)</option>
              <option value="4">4X (Ultra Alta Definición)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">
              Nivel de Enfoque / Nitidez:
            </label>
            <select
              value={customParams.sharpenLevel || "medium"}
              onChange={(e) => setCustomParam("sharpenLevel", e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="light">Suave (Bordes naturales)</option>
              <option value="medium">Medio (Óptimo para DTF)</option>
              <option value="strong">Intenso (Textos y vectores)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="denoise"
              checked={customParams.denoise === "true"}
              onChange={(e) => setCustomParam("denoise", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="denoise" className="text-slate-300 cursor-pointer">
              Reducción de Ruido / Granulado
            </label>
          </div>
        </div>
      )}
    />
  );
}
