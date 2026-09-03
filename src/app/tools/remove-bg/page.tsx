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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <div className="flex justify-between text-[#F3F4F6] mb-1.5 font-mono">
              <span className="text-[#8E95A5]">Sensibilidad de Recorte:</span>
              <span className="text-[#00A3FF] font-semibold">{customParams.sensitivity || 35}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={customParams.sensitivity || 35}
              onChange={(e) => setCustomParam("sensitivity", e.target.value)}
              className="w-full accent-[#00A3FF] cursor-pointer"
            />
          </div>
          <div>
            <div className="flex justify-between text-[#F3F4F6] mb-1.5 font-mono">
              <span className="text-[#8E95A5]">Suavizado de Bordes (Feather):</span>
              <span className="text-[#00A3FF] font-semibold">{customParams.featherRadius || 2} px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={customParams.featherRadius || 2}
              onChange={(e) => setCustomParam("featherRadius", e.target.value)}
              className="w-full accent-[#00A3FF] cursor-pointer"
            />
          </div>
        </div>
      )}
    />
  );
}
