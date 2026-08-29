"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function RemoveBgPage() {
  return (
    <ToolLayout
      title="01 · Remover Fondo"
      description="Detecta el sujeto/objeto principal, elimina el fondo con bordes limpios y conserva transparencia real en cabello y detalles finos. Salida PNG a 300 DPI."
      badge="PNG Transparente 300 DPI"
      apiEndpoint="/api/process/remove-bg"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Sensibilidad de Recorte:</span>
              <span className="font-mono text-blue-400">{customParams.sensitivity || 35}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={customParams.sensitivity || 35}
              onChange={(e) => setCustomParam("sensitivity", e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Suavizado de Bordes (Feather):</span>
              <span className="font-mono text-blue-400">{customParams.featherRadius || 2}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={customParams.featherRadius || 2}
              onChange={(e) => setCustomParam("featherRadius", e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
          </div>
        </div>
      )}
    />
  );
}
