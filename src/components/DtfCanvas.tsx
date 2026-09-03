"use client";

import React, { useState, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Copy, 
  RotateCw, 
  Download, 
  AlertTriangle, 
  ZoomIn, 
  ZoomOut, 
  Loader2,
  CheckCircle2
} from "lucide-react";

export interface CanvasDesign {
  id: string;
  file: File;
  previewUrl: string;
  originalWidthPx: number;
  originalHeightPx: number;
  xCm: number;       // posición horizontal en cm
  yCm: number;       // posición vertical en cm
  widthCm: number;   // ancho en cm
  heightCm: number;  // alto en cm
  rotation: number;  // grados (0, 90, 180, 270)
  aspectRatio: number;
}

export function DtfCanvas() {
  const [format, setFormat] = useState<"58x100" | "58x200">("58x100");
  const [designs, setDesigns] = useState<CanvasDesign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasWidthCm = 58;
  const canvasHeightCm = format === "58x100" ? 100 : 200;

  const pxPerCm = 8 * zoom;
  const visualWidthPx = canvasWidthCm * pxPerCm;
  const visualHeightPx = canvasHeightCm * pxPerCm;

  const selectedDesign = designs.find((d) => d.id === selectedId);

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const initWidthCm = Math.min(25, canvasWidthCm - 4);
        const initHeightCm = parseFloat((initWidthCm / aspect).toFixed(2));

        const newDesign: CanvasDesign = {
          id: "design_" + Math.random().toString(36).substring(2, 9),
          file,
          previewUrl: url,
          originalWidthPx: img.width,
          originalHeightPx: img.height,
          xCm: 2,
          yCm: 2 + designs.length * 5,
          widthCm: initWidthCm,
          heightCm: initHeightCm,
          rotation: 0,
          aspectRatio: aspect,
        };

        setDesigns((prev) => [...prev, newDesign]);
        setSelectedId(newDesign.id);
      };
      img.src = url;
    });
  };

  const updateSelectedDesign = (updates: Partial<CanvasDesign>) => {
    if (!selectedId) return;
    setDesigns((prev) =>
      prev.map((d) => (d.id === selectedId ? { ...d, ...updates } : d))
    );
  };

  const handleDuplicate = (id: string) => {
    const target = designs.find((d) => d.id === id);
    if (!target) return;

    const dup: CanvasDesign = {
      ...target,
      id: "design_" + Math.random().toString(36).substring(2, 9),
      xCm: Math.min(canvasWidthCm - target.widthCm, target.xCm + 2),
      yCm: Math.min(canvasHeightCm - target.heightCm, target.yCm + 2),
    };

    setDesigns((prev) => [...prev, dup]);
    setSelectedId(dup.id);
  };

  const handleDelete = (id: string) => {
    setDesigns((prev) => prev.filter((d) => d.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const calculateEffectiveDpi = (d: CanvasDesign) => {
    const widthInches = d.widthCm / 2.54;
    return Math.round(d.originalWidthPx / widthInches);
  };

  const handleDragStart = (e: React.MouseEvent, design: CanvasDesign) => {
    setSelectedId(design.id);
    const startX = e.clientX;
    const startY = e.clientY;
    const startDesignX = design.xCm;
    const startDesignY = design.yCm;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaXCm = (moveEvent.clientX - startX) / pxPerCm;
      const deltaYCm = (moveEvent.clientY - startY) / pxPerCm;

      const newX = Math.max(0, Math.min(canvasWidthCm - design.widthCm, parseFloat((startDesignX + deltaXCm).toFixed(2))));
      const newY = Math.max(0, Math.min(canvasHeightCm - design.heightCm, parseFloat((startDesignY + deltaYCm).toFixed(2))));

      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, xCm: newX, yCm: newY } : d))
      );
    };

    const handleMouseUp = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleExport = async () => {
    if (designs.length === 0) return;
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);

    try {
      const formData = new FormData();
      formData.append("format", format);

      const layoutData = designs.map((d, index) => {
        const fileKey = `file_${index}`;
        formData.append(fileKey, d.file);
        return {
          fileKey,
          xCm: d.xCm,
          yCm: d.yCm,
          widthCm: d.widthCm,
          heightCm: d.heightCm,
          rotation: d.rotation,
        };
      });

      formData.append("layout", JSON.stringify(layoutData));

      const res = await fetch("/api/process/compose-dtf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error al componer el archivo DTF.");
      }

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `privae_dtf_${format}_300dpi_${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setExportSuccess(true);
    } catch (err: any) {
      setExportError(err.message || "Error al exportar.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header & Selector de Formato */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#20232A] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
              Armador de Pliegos DTF
            </h1>
            <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2.5 py-0.5 rounded">
              BOBINA 58.0 CM — 300 DPI
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-[#8E95A5]">
            Distribuye tus artes a escala en centímetros y genera el archivo maestro listo para impresión.
          </p>
        </div>

        {/* Controles de Formato y Exportación */}
        <div className="flex items-center gap-3">
          <div className="flex rounded bg-[#0D0E11] p-1 border border-[#20232A] text-xs font-mono font-medium">
            <button
              onClick={() => setFormat("58x100")}
              className={`px-3 py-1.5 rounded transition-colors ${
                format === "58x100"
                  ? "bg-[#16181D] text-[#F3F4F6] border border-[#20232A] font-semibold"
                  : "text-[#8E95A5] hover:text-[#F3F4F6]"
              }`}
            >
              58 × 100 cm
            </button>
            <button
              onClick={() => setFormat("58x200")}
              className={`px-3 py-1.5 rounded transition-colors ${
                format === "58x200"
                  ? "bg-[#16181D] text-[#F3F4F6] border border-[#20232A] font-semibold"
                  : "text-[#8E95A5] hover:text-[#F3F4F6]"
              }`}
            >
              58 × 200 cm
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={designs.length === 0 || exporting}
            className="inline-flex items-center gap-2 rounded bg-[#00A3FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors disabled:opacity-30"
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-white" /> Generando maestro 300 DPI...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" /> Exportar Pliego DTF
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="mb-4 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {exportError}
        </div>
      )}

      {exportSuccess && (
        <div className="mb-4 rounded border border-[#00A3FF]/30 bg-[#00A3FF]/10 p-3 text-xs text-[#00A3FF] flex items-center gap-2 font-mono">
          <CheckCircle2 className="h-4 w-4" /> Pliego DTF exportado con éxito a 300 DPI reales.
        </div>
      )}

      {/* Grid de Trabajo */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SIDEBAR DE CONTROL (4 Columnas) */}
        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-lg border border-[#20232A] bg-[#16181D] p-5">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#8E95A5] mb-3 flex items-center justify-between">
              <span>Diseños en Pliego ({designs.length})</span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-[#00A3FF] hover:underline font-semibold"
              >
                <Plus className="h-3.5 w-3.5" /> Cargar diseños
              </button>
            </h3>

            {designs.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-[#20232A] bg-[#0D0E11] p-6 text-center hover:border-[#00A3FF]/60 transition-colors"
              >
                <Plus className="h-6 w-6 text-[#8E95A5] mb-1" />
                <span className="text-xs font-semibold text-[#F3F4F6]">
                  Haz clic para cargar archivos PNG
                </span>
                <span className="font-mono text-[10px] text-[#8E95A5] mt-1">
                  Múltiples diseños soportados a 300 DPI
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {designs.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`flex items-center justify-between gap-2 p-2 rounded cursor-pointer border text-xs transition-colors ${
                      selectedId === d.id
                        ? "bg-[#20232A] border-[#00A3FF]/50 text-[#F3F4F6] font-semibold"
                        : "bg-[#0D0E11] border-[#20232A] text-[#8E95A5] hover:text-[#F3F4F6] hover:bg-[#12141A]"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={d.previewUrl}
                        alt="preview"
                        className="h-8 w-8 object-contain rounded bg-[#16181D] border border-[#20232A] p-0.5"
                      />
                      <div className="truncate font-mono">
                        <p className="truncate text-xs text-[#F3F4F6]">{d.file.name}</p>
                        <p className="text-[10px] text-[#8E95A5]">
                          {d.widthCm} × {d.heightCm} cm
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[#8E95A5]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(d.id);
                        }}
                        title="Duplicar"
                        className="p-1 hover:text-[#F3F4F6]"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(d.id);
                        }}
                        title="Eliminar"
                        className="p-1 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Propiedades del Elemento Seleccionado */}
          {selectedDesign && (
            <div className="rounded-lg border border-[#20232A] bg-[#16181D] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-[#20232A] pb-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#F3F4F6]">
                  Cotas del Diseño
                </h3>
                <span className="text-[11px] text-[#8E95A5] font-mono">
                  {selectedDesign.originalWidthPx} × {selectedDesign.originalHeightPx} px
                </span>
              </div>

              {calculateEffectiveDpi(selectedDesign) < 250 && (
                <div className="flex items-center gap-2 rounded border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs text-amber-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span className="font-mono text-[11px]">
                    <strong>Aviso:</strong> Resolución efectiva de{" "}
                    {calculateEffectiveDpi(selectedDesign)} DPI (Óptimo: 300 DPI).
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-[#8E95A5] mb-1 font-mono">
                    Ancho (cm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max={canvasWidthCm}
                    value={selectedDesign.widthCm}
                    onChange={(e) => {
                      const w = parseFloat(e.target.value) || 1;
                      const h = parseFloat((w / selectedDesign.aspectRatio).toFixed(2));
                      updateSelectedDesign({ widthCm: w, heightCm: h });
                    }}
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E95A5] mb-1 font-mono">
                    Alto (cm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={selectedDesign.heightCm}
                    onChange={(e) => {
                      const h = parseFloat(e.target.value) || 1;
                      const w = parseFloat((h * selectedDesign.aspectRatio).toFixed(2));
                      updateSelectedDesign({ widthCm: w, heightCm: h });
                    }}
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E95A5] mb-1 font-mono">
                    Posición X (cm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={canvasWidthCm - selectedDesign.widthCm}
                    value={selectedDesign.xCm}
                    onChange={(e) =>
                      updateSelectedDesign({ xCm: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#8E95A5] mb-1 font-mono">
                    Posición Y (cm):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={canvasHeightCm - selectedDesign.heightCm}
                    value={selectedDesign.yCm}
                    onChange={(e) =>
                      updateSelectedDesign({ yCm: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-2.5 py-1.5 text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-mono text-[#8E95A5]">Rotación de arte:</span>
                <button
                  onClick={() =>
                    updateSelectedDesign({
                      rotation: (selectedDesign.rotation + 90) % 360,
                    })
                  }
                  className="flex items-center gap-1.5 rounded border border-[#20232A] bg-[#0D0E11] px-3 py-1.5 text-xs text-[#F3F4F6] hover:bg-[#20232A] transition-colors font-mono"
                >
                  <RotateCw className="h-3.5 w-3.5 text-[#00A3FF]" /> Girar 90° ({selectedDesign.rotation}°)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* LIENZO INTERACTIVO */}
        <div className="lg:col-span-8 flex flex-col">
          <div className="mb-2 flex items-center justify-between bg-[#16181D] border border-[#20232A] px-4 py-2 rounded-t-lg text-xs text-[#8E95A5]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F3F4F6]">Lienzo de Montaje:</span>
              <span className="text-[#00A3FF] font-mono">
                {canvasWidthCm} cm × {canvasHeightCm} cm
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
                className="p-1 text-[#8E95A5] hover:text-[#F3F4F6] rounded bg-[#0D0E11] border border-[#20232A]"
                title="Alejar"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="font-mono text-[11px] w-12 text-center text-[#F3F4F6]">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, z + 0.1))}
                className="p-1 text-[#8E95A5] hover:text-[#F3F4F6] rounded bg-[#0D0E11] border border-[#20232A]"
                title="Acercar"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div
            ref={canvasContainerRef}
            className="relative flex-1 min-h-[600px] max-h-[750px] overflow-auto rounded-b-lg border border-[#20232A] bg-[#0D0E11] p-8 custom-scrollbar flex justify-center items-start"
          >
            <div
              style={{
                width: `${visualWidthPx}px`,
                height: `${visualHeightPx}px`,
              }}
              className="relative shadow-2xl border-2 border-[#00A3FF]/40 bg-transparency-grid shrink-0 transition-all"
            >
              <div className="absolute top-0 left-0 bg-[#0D0E11] text-[#00A3FF] border-r border-b border-[#20232A] text-[10px] font-mono px-2 py-0.5 z-10">
                58 cm × {canvasHeightCm} cm • 300 DPI
              </div>

              {designs.map((d) => {
                const isSelected = d.id === selectedId;
                const left = d.xCm * pxPerCm;
                const top = d.yCm * pxPerCm;
                const width = d.widthCm * pxPerCm;
                const height = d.heightCm * pxPerCm;

                return (
                  <div
                    key={d.id}
                    onMouseDown={(e) => handleDragStart(e, d)}
                    style={{
                      position: "absolute",
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: `rotate(${d.rotation}deg)`,
                      transformOrigin: "center center",
                    }}
                    className={`cursor-move group select-none ${
                      isSelected
                        ? "ring-2 ring-[#00A3FF]"
                        : "hover:ring-1 hover:ring-[#8E95A5]/60"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.previewUrl}
                      alt="design"
                      className="h-full w-full object-fill pointer-events-none"
                    />

                    {isSelected && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-[#0D0E11] border border-[#00A3FF]/50 text-[10px] text-[#00A3FF] font-semibold px-2 py-0.5 rounded whitespace-nowrap z-20 font-mono">
                        {d.widthCm} × {d.heightCm} cm
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
