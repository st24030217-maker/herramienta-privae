"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { ShieldCheck, Sparkles, Minimize2, Trash2 } from "lucide-react";

export default function CleanAlphaPage() {
  return (
    <ToolLayout
      title="Depurar Semitransparencias (Cama Blanca DTF)"
      description="Purga píxeles semitransparentes y halos lechosos que provocan depósitos sucios de tinta blanca en la tela. Incluye contracción de bordes (Choke 1-3 px) para evitar que la tinta blanca desborde los colores. Salida certificada a 300 DPI."
      badge="Control Cama Blanca DTF"
      apiEndpoint="/api/process/clean-alpha"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Umbral Alpha */}
            <div className="space-y-2 p-4 rounded-xl border border-[#20232A] bg-[#0D0E11]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Umbral de Corte de Píxel Translúcido:</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#16181D] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.threshold || 40} / 255
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                value={customParams.threshold || 40}
                onChange={(e) => setCustomParam("threshold", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#16181D] accent-[#00A3FF] cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Píxeles con opacidad menor a este valor se eliminan al 100% para evitar halos blancos lechosos.
              </span>
            </div>

            {/* Choke / Contracción Morfológica de Bordes */}
            <div className="space-y-2 p-4 rounded-xl border border-[#20232A] bg-[#0D0E11]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5] flex items-center gap-1.5">
                  <Minimize2 className="h-4 w-4 text-[#00A3FF]" /> Choke / Contraer Base Blanca:
                </span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#16181D] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.chokePixels || 0} px
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[
                  { val: "0", label: "0 px", desc: "Sin choke" },
                  { val: "1", label: "1 px", desc: "Sutil" },
                  { val: "2", label: "2 px", desc: "Recomendado" },
                  { val: "3", label: "3 px", desc: "Firme" },
                ].map((c) => {
                  const isSelected = String(customParams.chokePixels || "0") === c.val;
                  return (
                    <button
                      key={c.val}
                      type="button"
                      onClick={() => setCustomParam("chokePixels", c.val)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isSelected
                          ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-sm ring-1 ring-[#00A3FF]"
                          : "border-[#20232A] bg-[#16181D] text-[#8E95A5] hover:border-gray-500 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">{c.label}</span>
                      <span className="text-[9px] font-mono text-[#8E95A5] block">{c.desc}</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Contrae el borde del canal alfa hacia adentro para evitar que la tinta blanca desborde bajo el color.
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#20232A]">
            {/* Modo DTF Sólido */}
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
                <span className="text-sm font-bold text-[#F3F4F6] flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#00A3FF]" /> Base Sólida (100% Opacidad)
                </span>
                <span className="text-[11px] text-[#8E95A5] block">
                  Garantiza fondeado blanco opaco y uniforme en prendas oscuras.
                </span>
              </div>
            </label>

            {/* Suavizado Perimetral */}
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
                <span className="text-sm font-bold text-[#F3F4F6] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#00A3FF]" /> Suavizado de Contorno
                </span>
                <span className="text-[11px] text-[#8E95A5] block">
                  Elimina el escalonado en curvas para acabado textil suave al tacto.
                </span>
              </div>
            </label>

            {/* Limpieza de Motas / Despeckle */}
            <label
              htmlFor="removeSpeckles"
              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all active:scale-95 ${
                customParams.removeSpeckles !== "false"
                  ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white shadow-md ring-2 ring-[#00A3FF]"
                  : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40"
              }`}
            >
              <input
                type="checkbox"
                id="removeSpeckles"
                checked={customParams.removeSpeckles !== "false"}
                onChange={(e) => setCustomParam("removeSpeckles", e.target.checked ? "true" : "false")}
                className="h-5 w-5 rounded border-[#20232A] text-[#00A3FF] focus:ring-[#00A3FF] mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[#F3F4F6] flex items-center gap-1.5">
                  <Trash2 className="h-4 w-4 text-[#00A3FF]" /> Purgar Motas Aisladas
                </span>
                <span className="text-[11px] text-[#8E95A5] block">
                  Limpia partículas sueltas invisibles que ensucian la bobina en el RIP.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    />
  );
}
