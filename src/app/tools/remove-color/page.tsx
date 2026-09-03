"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { useState } from "react";
import { Pipette } from "lucide-react";

export default function RemoveColorPage() {
  const [selectedHex, setSelectedHex] = useState<string>("#ffffff");

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "");
    const bigint = parseInt(cleanHex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  return (
    <ToolLayout
      title="Extracción Cromática Específica"
      description="Identifica y suprime un matiz de color puntual convirtiéndolo en transparencia RGBA limpia mediante cálculo de distancia cromática. Salida certificada a 300 DPI."
      badge="Muestreo RGB / Euclidiano"
      apiEndpoint="/api/process/remove-color"
      additionalFormData={(formData) => {
        const rgb = hexToRgb(selectedHex);
        formData.append("r", String(rgb.r));
        formData.append("g", String(rgb.g));
        formData.append("b", String(rgb.b));
      }}
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Selector de Color */}
          <div>
            <label className="block text-[#8E95A5] mb-1.5 font-mono">
              Color a Retirar:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedHex}
                onChange={(e) => setSelectedHex(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-[#20232A] bg-[#0D0E11] p-0.5"
              />
              <input
                type="text"
                value={selectedHex}
                onChange={(e) => setSelectedHex(e.target.value)}
                className="w-24 rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-[#F3F4F6] uppercase font-mono text-xs focus:border-[#00A3FF] focus:outline-none"
              />
            </div>
          </div>

          {/* Tolerancia */}
          <div>
            <div className="flex justify-between text-[#F3F4F6] mb-1.5 font-mono">
              <span className="text-[#8E95A5]">Tolerancia Cromática:</span>
              <span className="text-[#00A3FF] font-semibold">{customParams.tolerance || 30}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={customParams.tolerance || 30}
              onChange={(e) => setCustomParam("tolerance", e.target.value)}
              className="w-full accent-[#00A3FF] cursor-pointer"
            />
            <span className="text-[10px] text-[#8E95A5]/60 font-mono">
              Amplitud del radio de supresión euclidiana.
            </span>
          </div>

          {/* Suavizado */}
          <div>
            <div className="flex justify-between text-[#F3F4F6] mb-1.5 font-mono">
              <span className="text-[#8E95A5]">Transición de Borde:</span>
              <span className="text-[#00A3FF] font-semibold">{customParams.smoothness || 10}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={customParams.smoothness || 10}
              onChange={(e) => setCustomParam("smoothness", e.target.value)}
              className="w-full accent-[#00A3FF] cursor-pointer"
            />
            <span className="text-[10px] text-[#8E95A5]/60 font-mono">
              Atenúa el escalonado en bordes curvos.
            </span>
          </div>
        </div>
      )}
    />
  );
}
