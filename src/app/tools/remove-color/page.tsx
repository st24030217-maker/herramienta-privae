"use client";

import { ToolLayout } from "@/components/ToolLayout";
import { useState, useEffect, useRef } from "react";
import { Pipette, ShieldCheck, Layers, Sparkles, Crosshair } from "lucide-react";

export default function RemoveColorPage() {
  const [selectedHex, setSelectedHex] = useState<string>("#000000");
  const [isPickingFromCanvas, setIsPickingFromCanvas] = useState(false);
  const [hasEyeDropper, setHasEyeDropper] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "EyeDropper" in window) {
      setHasEyeDropper(true);
    }
  }, []);

  const hexToRgb = (hex: string) => {
    const cleanHex = hex.replace("#", "").trim();
    if (cleanHex.length === 3) {
      const r = parseInt(cleanHex[0] + cleanHex[0], 16) || 0;
      const g = parseInt(cleanHex[1] + cleanHex[1], 16) || 0;
      const b = parseInt(cleanHex[2] + cleanHex[2], 16) || 0;
      return { r, g, b };
    }
    const bigint = parseInt(cleanHex, 16);
    if (isNaN(bigint) || cleanHex.length !== 6) {
      return { r: 0, g: 0, b: 0 };
    }
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  const currentRgb = hexToRgb(selectedHex);

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
  };

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
        // Cancelado por el usuario
      }
    }
  };

  const sampleColorFromImage = (e: React.MouseEvent<HTMLImageElement>, imgUrl: string) => {
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * img.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * img.naturalHeight);

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvasRef.current = canvas;
    }

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setSelectedHex(hex);
    setIsPickingFromCanvas(false);
  };

  return (
    <ToolLayout
      title="Borrar un Color Específico"
      description="Toca con el gotero cualquier color de tu imagen (fondos negros, rojos o el color que quieras) para volverlo transparente al instante y dejarlo listo para imprimir."
      badge="Gotero Directo"
      apiEndpoint="/api/process/remove-color"
      additionalFormData={(formData) => {
        const rgb = hexToRgb(selectedHex);
        formData.append("r", String(rgb.r));
        formData.append("g", String(rgb.g));
        formData.append("b", String(rgb.b));
      }}
      renderControls={(originalImage, setCustomParam, customParams) => (
        <div className="space-y-6">
          {/* Gotero interactivo sobre la imagen si está cargada */}
          {originalImage && (
            <div className="p-4 rounded-xl border border-[#20232A] bg-[#0D0E11] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Crosshair className="h-4 w-4" /> Toca tu imagen para elegir el color:
                </span>
                <span className="text-xs text-[#8E95A5]">
                  Haz clic en cualquier parte de la imagen para borrar ese color
                </span>
              </div>
              <div className="relative overflow-hidden rounded-lg border border-[#20232A] bg-black/40 max-h-48 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalImage}
                  alt="Muestra para gotero"
                  onClick={(e) => sampleColorFromImage(e, originalImage)}
                  className="max-h-48 object-contain cursor-crosshair hover:opacity-90 transition-opacity"
                  title="Haz clic en cualquier punto para elegir este color"
                />
              </div>
            </div>
          )}

          {/* ACCESOS DIRECTOS DE TALLER: NEGRO, ROJO Y BLANCO */}
          <div>
            <span className="text-xs font-mono font-bold text-[#F3F4F6] uppercase tracking-wider block mb-3">
              ⚡ Borrar Colores Comunes (1 Clic):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Botón Quitar Negro */}
              <button
                type="button"
                onClick={() => setSelectedHex("#000000")}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-95 ${
                  selectedHex.toLowerCase() === "#000000"
                    ? "border-white bg-[#16181D] ring-2 ring-white shadow-lg"
                    : "border-[#20232A] bg-[#0D0E11] hover:border-gray-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-black border-2 border-[#333] shadow-inner" />
                  <div className="text-left">
                    <span className="font-bold text-sm text-[#F3F4F6] block">Borrar Fondo Negro</span>
                    <span className="font-mono text-[11px] text-[#8E95A5]">#000000</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#20232A] text-white font-bold">1 Clic</span>
              </button>

              {/* Botón Quitar Rojo */}
              <button
                type="button"
                onClick={() => setSelectedHex("#ff0000")}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-95 ${
                  selectedHex.toLowerCase() === "#ff0000"
                    ? "border-red-500 bg-red-950/40 ring-2 ring-red-500 shadow-lg"
                    : "border-red-900/40 bg-[#0D0E11] hover:border-red-600/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-[#FF0000] border-2 border-red-400 shadow-inner" />
                  <div className="text-left">
                    <span className="font-bold text-sm text-red-200 block">Borrar Rojo</span>
                    <span className="font-mono text-[11px] text-red-300/80">#FF0000</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-red-900/50 text-red-200 font-bold">1 Clic</span>
              </button>

              {/* Botón Quitar Blanco */}
              <button
                type="button"
                onClick={() => setSelectedHex("#ffffff")}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-95 ${
                  selectedHex.toLowerCase() === "#ffffff"
                    ? "border-white bg-[#16181D] ring-2 ring-white shadow-lg"
                    : "border-[#20232A] bg-[#0D0E11] hover:border-gray-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-white border-2 border-gray-300 shadow-inner" />
                  <div className="text-left">
                    <span className="font-bold text-sm text-[#F3F4F6] block">Borrar Fondo Blanco</span>
                    <span className="font-mono text-[11px] text-[#8E95A5]">#FFFFFF</span>
                  </div>
                </div>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#20232A] text-white font-bold">1 Clic</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2 border-t border-[#20232A]">
            {/* Muestra y Selector Hex/RGB */}
            <div className="space-y-2">
              <label className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                Color a Borrar:
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={selectedHex.startsWith("#") ? selectedHex : `#${selectedHex}`}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  className="h-11 w-14 cursor-pointer rounded-xl border border-[#20232A] bg-[#0D0E11] p-1 shadow-sm"
                  title="Abrir paleta de colores"
                />
                <input
                  type="text"
                  value={selectedHex}
                  onChange={(e) => setSelectedHex(e.target.value)}
                  placeholder="#000000"
                  className="w-28 rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2.5 text-sm font-mono text-[#F3F4F6] uppercase font-bold focus:border-white focus:outline-none"
                />
                {hasEyeDropper && (
                  <button
                    type="button"
                    onClick={handlePickColor}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-3 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition-all shadow-sm active:scale-95"
                    title="Gotero de pantalla"
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
                <span className="text-[#8E95A5]">Fuerza del Borrado (Tolerancia):</span>
                <span className="text-sm font-bold text-white bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.tolerance || 30}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="90"
                value={customParams.tolerance || 30}
                onChange={(e) => setCustomParam("tolerance", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-white cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Sube este valor si todavía quedan sombras o rastros del color.
              </span>
            </div>

            {/* Suavizado */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#8E95A5]">Suavizar Orillas:</span>
                <span className="text-sm font-bold text-white bg-[#0D0E11] px-2.5 py-1 rounded border border-[#20232A]">
                  {customParams.smoothness || 10}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                value={customParams.smoothness || 10}
                onChange={(e) => setCustomParam("smoothness", e.target.value)}
                className="w-full h-2 rounded-lg bg-[#0D0E11] accent-white cursor-pointer mt-2"
              />
              <span className="text-[11px] text-[#8E95A5]/80 block">
                Hace que el contorno no quede mordido ni con bordes duros.
              </span>
            </div>
          </div>

          {/* Opciones Avanzadas: Modo Contiguo y De-fringe */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#20232A]">
            <label
              htmlFor="mode"
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                customParams.mode === "contiguous"
                  ? "border-white bg-white/10 text-white"
                  : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5]"
              }`}
            >
              <input
                type="checkbox"
                id="mode"
                checked={customParams.mode === "contiguous"}
                onChange={(e) => setCustomParam("mode", e.target.checked ? "contiguous" : "global")}
                className="h-5 w-5 rounded border-[#20232A] text-white focus:ring-white mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[#F3F4F6] block flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-white" /> Solo el Fondo de Afuera
                </span>
                <span className="text-[11px] text-[#8E95A5] block">
                  Protege lo que esté adentro de tu diseño (como ojos o letras) para no borrarlo por accidente.
                </span>
              </div>
            </label>

            <label
              htmlFor="defringe"
              className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                customParams.defringe !== "false"
                  ? "border-white bg-white/10 text-white"
                  : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5]"
              }`}
            >
              <input
                type="checkbox"
                id="defringe"
                checked={customParams.defringe !== "false"}
                onChange={(e) => setCustomParam("defringe", e.target.checked ? "true" : "false")}
                className="h-5 w-5 rounded border-[#20232A] text-white focus:ring-white mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-[#F3F4F6] block flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-white" /> Limpiar Flecos en la Orilla
                </span>
                <span className="text-[11px] text-[#8E95A5] block">
                  Quita el halo o resplandor del color que acabas de borrar para que no queden orillas manchadas.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    />
  );
}
