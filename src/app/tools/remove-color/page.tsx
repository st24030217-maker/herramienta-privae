"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { useState, useEffect } from "react";
import { Pipette } from "lucide-react";

export default function RemoveColorPage() {
  const [selectedHex, setSelectedHex] = useState<string>("#ffffff");
  const [hasEyeDropper, setHasEyeDropper] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      setHasEyeDropper(true);
    }
  }, []);

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "").trim();
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16) || 255;
      const g = parseInt(cleanHex[1] + cleanHex[1], 16) || 255;
      const b = parseInt(cleanHex[2] + cleanHex[2], 16) || 255;
      return { r, g, b };
    }
    const bigint = parseInt(cleanHex, 16);
    if (isNaN(bigint) || cleanHex.length !== 6) {
      return { r: 255, g: 255, b: 255 };
    }
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const currentRgb = hexToRgb(selectedHex);

  const handlePickColor = async () => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      try {
        // @ts-ignore
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          setSelectedHex(result.sRGBHex.toLowerCase());
        }
      } catch {
        // Usuario canceló con Esc
      }
    }
  };

  const presetColors = [
    { name: "Blanco Puro", hex: "#ffffff" },
    { name: "Negro Puro", hex: "#000000" },
    { name: "Verde Croma", hex: "#00ff00" },
    { name: "Azul Croma", hex: "#0000ff" },
    { name: "Gris Medio", hex: "#808080" },
  ];

  return (
    <ToolLayout
      title="Extracción Cromática Específica"
      description="Identifica y suprime un matiz de color puntual convirtiéndolo en transparencia RGBA limpia mediante cálculo de distancia cromática. Salida certificada a 300 DPI."
      badge="Muestreo RGB / Gotero"
      apiEndpoint="/api/process/remove-color"
      additionalFormData={(formData) => {
        const rgb = hexToRgb(selectedHex);
        formData.append("r", String(rgb.r));
        formData.append("g", String(rgb.g));
        formData.append("b", String(rgb.b));
      }}
      renderControls={(_, setCustomParam, customParams) => (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Selector de Color y Gotero Grande */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                Color a Retirar:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedHex.startsWith("#") ? selectedHex : `#${selectedHex}`}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border border-[#20232A] bg-[#0D0E11] p-1"
                  title="Abrir paleta de color"
                />
                <input
                  type="text"
                  value={selectedHex}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  placeholder="#ffffff"
                  className="w-28 rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2.5 text-sm font-mono text-[#F3F4F6] uppercase font-bold focus:border-[#00A3FF] focus:outline-none"
                />
                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={handlePickColor}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#00A3FF]/40 bg-[#00A3FF]/15 px-4 py-2.5 text-xs font-bold text-[#00A3FF] hover:bg-[#00A3FF]/25 transition-all shadow-sm active:scale-95"
                    title="Toma un color de cualquier parte de la pantalla"
                  >
                    <Pipette className="h-4 w-4" />
                    <span>Gotero</span>
                  </button>
                )}
              </div>
              <p className="font-mono text-xs text-[#8E95A5]">
                RGB: ({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
              </p>
            </div>

            {/* Tolerancia */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Tolerancia Cromática:</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.tolerance || 30}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={customParams.tolerance || 30}
                onChange={(e) => setCustomParam("tolerance", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-[#00A3FF] cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Radio de supresión euclidiana para sombras del mismo color.
              </span>
            </div>

            {/* Suavizado */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Transición de Borde:</span>
                <span className="text-sm font-bold text-[#00A3FF] bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.smoothness || 10}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={customParams.smoothness || 10}
                onChange={(e) => setCustomParam("smoothness", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-[#00A3FF] cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Atenúa el escalonado para bordes curvos nítidos.
              </span>
            </div>
          </div>

          {/* Muestras Rápidas con Botones Grandes */}
          <div className="pt-3 border-t border-[#20232A] space-y-2">
            <span className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider block">
              Muestras Rápidas de Taller:
            </span>
            <div className="flex flex-wrap gap-2.5">
              {presetColors.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setSelectedHex(p.hex)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                    selectedHex.toLowerCase() === p.hex.toLowerCase()
                      ? "border-[#00A3FF] bg-[#00A3FF]/15 text-white ring-1 ring-[#00A3FF]"
                      : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:text-[#F3F4F6] hover:border-[#8E95A5]/40"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/30 shadow-sm"
                    style={{ backgroundColor: p.hex }}
                  />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    />
  );
}
