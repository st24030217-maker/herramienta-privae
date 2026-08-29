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
      title="03 · Eliminar un Color"
      description="Selecciona visualmente el color que deseas retirar (cuentagotas o paleta) y elimínalo convirtiéndolo en transparencia pura con tolerancia ajustable. Salida PNG a 300 DPI."
      badge="Cuentagotas & Tolerancia"
      apiEndpoint="/api/process/remove-color"
      additionalFormData={(formData) => {
        const rgb = hexToRgb(selectedHex);
        formData.append("r", String(rgb.r));
        formData.append("g", String(rgb.g));
        formData.append("b", String(rgb.b));
      }}
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          {/* Selector de Color */}
          <div>
            <label className="block text-slate-300 mb-1.5 font-medium">
              Color a Eliminar:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedHex}
                onChange={(e) => setSelectedHex(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-700 bg-slate-950 p-0.5"
              />
              <input
                type="text"
                value={selectedHex}
                onChange={(e) => setSelectedHex(e.target.value)}
                className="w-28 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-200 uppercase font-mono"
              />
            </div>
          </div>

          {/* Tolerancia */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Tolerancia de Color:</span>
              <span className="font-mono text-blue-400">{customParams.tolerance || 30}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="90"
              value={customParams.tolerance || 30}
              onChange={(e) => setCustomParam("tolerance", e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Aumenta para eliminar tonos similares cercanos.
            </span>
          </div>

          {/* Suavizado */}
          <div>
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Transición Suave de Borde:</span>
              <span className="font-mono text-blue-400">{customParams.smoothness || 10}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={customParams.smoothness || 10}
              onChange={(e) => setCustomParam("smoothness", e.target.value)}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500">
              Evita bordes dentados o pixelados.
            </span>
          </div>
        </div>
      )}
    />
  );
}
