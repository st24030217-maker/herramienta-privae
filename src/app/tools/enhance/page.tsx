"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { Sparkles, SlidersHorizontal, ShieldCheck } from "lucide-react";

export default function EnhancePage() {
  return (
    <ToolLayout
      title="+ Mejorar Calidad y Nitidez"
      description="Aumenta el tamaño y la nitidez de tus diseños para que no salgan borrosos ni pixelados al estamparlos en la tela. Deja tu imagen lista a 300 DPI reales."
      badge="Calidad 300 DPI"
      apiEndpoint="/api/process/enhance"
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Factor de Escala con Botones Grandes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                1. ¿Cuánto quieres agrandarla?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: "2", label: "2X", desc: "Doble de tamaño" },
                  { val: "3", label: "3X", desc: "Mucha nitidez" },
                  { val: "4", label: "4X", desc: "Máxima calidad" },
                ].map((scale) => {
                  const isSelected = String(customParams.scaleFactor || "2") === scale.val;
                  return (
                    <button
                      key={scale.val}
                      type="button"
                      onClick={() => setCustomParam("scaleFactor", scale.val)}
                      className={`p-3 rounded-xl border text-center transition-all active:scale-95 ${
                        isSelected
                          ? "border-white bg-white/10 text-white shadow-md ring-2 ring-white"
                          : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                      }`}
                    >
                      <span className="text-base font-extrabold text-[#F3F4F6] block">{scale.label}</span>
                      <span className="text-[10px] font-mono text-[#8E95A5] block">{scale.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Máscara de Enfoque con Botones Grandes */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                2. Enfoque y Nitidez:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { val: "none", label: "Apagado" },
                  { val: "light", label: "Suave" },
                  { val: "medium", label: "Normal" },
                  { val: "strong", label: "Bien definido" },
                ].map((lvl) => {
                  const isSelected = (customParams.sharpenLevel || "medium") === lvl.val;
                  return (
                    <button
                      key={lvl.val}
                      type="button"
                      onClick={() => setCustomParam("sharpenLevel", lvl.val)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-white bg-white/10 text-white shadow-sm ring-1 ring-white"
                          : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold text-[#F3F4F6] block">{lvl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Reducción de Ruido - Tarjeta Táctil */}
            <div className="flex flex-col justify-end">
              <label
                htmlFor="denoise"
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  customParams.denoise === "true"
                    ? "border-white bg-white/10 text-white shadow-sm"
                    : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:border-[#8E95A5]/40"
                }`}
              >
                <input
                  type="checkbox"
                  id="denoise"
                  checked={customParams.denoise === "true"}
                  onChange={(e) => setCustomParam("denoise", e.target.checked ? "true" : "false")}
                  className="h-5 w-5 rounded border-[#20232A] text-white focus:ring-white mt-0.5"
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#F3F4F6] block">
                    Quitar Borroso y Pixeles (JPG)
                  </span>
                  <span className="text-[11px] text-[#8E95A5] block">
                    Limpia el grano y lo borroso de fotos o imágenes bajadas de internet.
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
