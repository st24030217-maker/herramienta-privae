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
        // El usuario canceló la selección con Escape
      }
    }
  };

  const presetColors = [
    { name: "Blanco", hex: "#ffffff" },
    { name: "Negro", hex: "#000000" },
    { name: "Verde croma", hex: "#00ff00" },
    { name: "Azul croma", hex: "#0000ff" },
    { name: "Gris neutro", hex: "#808080" },
  ];

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
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            {/* Selector de Color y Cuentagotas */}
            <div>
              <label className="block text-[#8E95A5] mb-1.5 font-mono">
                Color a Retirar:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedHex.startsWith("#") ? selectedHex : `#${selectedHex}`}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  className="h-9 w-11 cursor-pointer rounded border border-[#20232A] bg-[#0D0E11] p-0.5"
                  title="Elegir color en paleta"
                />
                <input
                  type="text"
                  value={selectedHex}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  placeholder="#ffffff"
                  className="w-24 rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-[#F3F4F6] uppercase font-mono text-xs focus:border-[#00A3FF] focus:outline-none"
                />
                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={handlePickColor}
                    className="flex items-center gap-1 rounded border border-[#00A3FF]/40 bg-[#00A3FF]/10 px-2.5 py-2 text-xs font-semibold text-[#00A3FF] hover:bg-[#00A3FF]/20 transition-colors"
                    title="Tomar color de cualquier parte de la pantalla"
                  >
                    <Pipette className="h-3.5 w-3.5" />
                    <span>Gotero</span>
                  </button>
                )}
              </div>
              <p className="mt-1.5 font-mono text-[10px] text-[#8E95A5]">
                RGB: ({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
              </p>
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

          {/* Colores Rápidos de Taller */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#20232A]">
            <span className="text-[10px] font-mono text-[#8E95A5] uppercase tracking-wider">
              Muestras rápidas:
            </span>
            {presetColors.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => setSelectedHex(p.hex)}
                className="inline-flex items-center gap-1.5 rounded border border-[#20232A] bg-[#0D0E11] px-2 py-1 text-[11px] text-[#F3F4F6] hover:border-[#8E95A5]/60 transition-colors"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full border border-[#20232A]"
                  style={{ backgroundColor: p.hex }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    />
  );
}
