"use client";

import { ToolLayout } from "@/components/ToolLayout";

export default function EnhancePage() {
  return (
    <ToolLayout
      title="Interpolación y Nitidez de Resolución"
      description="Aumenta la densidad de píxeles, nitidez y definición de artes rasterizados sin distorsión geométrica. Interpolación adaptativa para salida certificada a 300 DPI."
      badge="Lanczos3 a 300 DPI"
      apiEndpoint="/api/process/enhance"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
          <div>
            <label className="block text-[#8E95A5] mb-1.5 font-mono">
              Factor de Escala:
            </label>
            <select
              value={customParams.scaleFactor || 2}
              onChange={(e) => setCustomParam("scaleFactor", e.target.value)}
              className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-3 py-2 font-mono text-[#F3F4F6] focus:border-[#00A3FF] focus:outline-none"
            >
              <option value="2">2X (Duplicar Resolución)</option>
              <option value="4">4X (Ultra Alta Definición)</option>
            </select>
          </div>

          <div>
            <label className="block text-[#8E95A5] mb-1.5 font-mono">
              Máscara de Enfoque:
            </label>
            <select
              value={customParams.sharpenLevel || "medium"}
              onChange={(e) => setCustomParam("sharpenLevel", e.target.value)}
              className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-3 py-2 font-mono text-[#F3F4F6] focus:border-[#00A3FF] focus:outline-none"
            >
              <option value="light">Suave (Contornos naturales)</option>
              <option value="medium">Medio (Calibrado DTF estándar)</option>
              <option value="strong">Intenso (Textos y trazos duros)</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 pt-6">
            <input
              type="checkbox"
              id="denoise"
              checked={customParams.denoise === "true"}
              onChange={(e) => setCustomParam("denoise", e.target.checked ? "true" : "false")}
              className="h-4 w-4 rounded border-[#20232A] bg-[#0D0E11] text-[#00A3FF] focus:ring-[#00A3FF]"
            />
            <label htmlFor="denoise" className="text-[#8E95A5] cursor-pointer font-mono">
              Filtro de reducción de ruido
            </label>
          </div>
        </div>
      )}
    />
  );
}
