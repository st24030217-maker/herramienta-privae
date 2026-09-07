"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
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
  CheckCircle2,
  X,
  LogIn,
  Crown,
  UploadCloud,
  Maximize2,
  Minimize2
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
  rotation: number;  // grados (0 a 359)
  aspectRatio: number;
}

export function DtfCanvas() {
  const [format, setFormat] = useState<"58x100" | "58x200">("58x100");
  const [designs, setDesigns] = useState<CanvasDesign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportErrorStatus, setExportErrorStatus] = useState<number | null>(null);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [isCanvasDragging, setIsCanvasDragging] = useState<boolean>(false);
  const [isCanvasFullscreen, setIsCanvasFullscreen] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasWidthCm = 58;
  const canvasHeightCm = format === "58x100" ? 100 : 200;

  const pxPerCm = 8 * zoom;
  const visualWidthPx = canvasWidthCm * pxPerCm;
  const visualHeightPx = canvasHeightCm * pxPerCm;

  const selectedDesign = designs.find((d) => d.id === selectedId);

  const toggleCanvasFullscreen = () => {
    if (!document.fullscreenElement) {
      if (canvasWrapperRef.current?.requestFullscreen) {
        canvasWrapperRef.current.requestFullscreen().catch(() => {
          setIsCanvasFullscreen(!isCanvasFullscreen);
        });
      } else {
        setIsCanvasFullscreen(!isCanvasFullscreen);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsCanvasFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsCanvasFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleCanvasWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((z) => Math.min(3.0, Math.max(0.3, parseFloat((z + delta).toFixed(2)))));
  };

  // Atajo de teclado: Borrar elemento con Delete/Backspace
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || "").toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        setDesigns((prev) => prev.filter((d) => d.id !== selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId]);

  // Auto-ocultar notificación de éxito tras 6 segundos
  useEffect(() => {
    if (exportSuccess) {
      const timer = setTimeout(() => setExportSuccess(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [exportSuccess]);

  const handleAddFiles = (files: FileList | null) => {
    if (!files) return;

    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;

    validFiles.forEach((file, index) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const aspect = img.width / img.height;
        const initWidthCm = Math.min(25, canvasWidthCm - 4);
        const initHeightCm = parseFloat((initWidthCm / aspect).toFixed(2));

        // Escalonamiento predecible para evitar que se encimen
        setDesigns((prev) => {
          const currentCount = prev.length;
          const yPosition = Math.min(
            canvasHeightCm - initHeightCm - 2,
            2 + ((currentCount + index) * 6) % (canvasHeightCm - 30)
          );
          const xPosition = Math.min(
            canvasWidthCm - initWidthCm,
            2 + ((currentCount + index) * 3) % (canvasWidthCm - 28)
          );

          const newDesign: CanvasDesign = {
            id: "design_" + Math.random().toString(36).substring(2, 9),
            file,
            previewUrl: url,
            originalWidthPx: img.width,
            originalHeightPx: img.height,
            xCm: parseFloat(xPosition.toFixed(2)),
            yCm: parseFloat(Math.max(2, yPosition).toFixed(2)),
            widthCm: initWidthCm,
            heightCm: initHeightCm,
            rotation: 0,
            aspectRatio: aspect,
          };

          setSelectedId(newDesign.id);
          return [...prev, newDesign];
        });
      };
      img.src = url;
    });
  };

  const handleCanvasDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCanvasDragging(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCanvasDragging(false);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsCanvasDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleAddFiles(e.dataTransfer.files);
    }
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

  const handleRotateStart = (e: React.MouseEvent, design: CanvasDesign, element: HTMLDivElement | null) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(design.id);

    if (!element) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - centerX;
      const deltaY = moveEvent.clientY - centerY;
      // Calcular ángulo con respecto al centro
      let degrees = Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90);
      if (degrees < 0) degrees += 360;
      degrees = degrees % 360;

      // Si presiona Shift, ajusta en pasos de 15 grados
      if (moveEvent.shiftKey) {
        degrees = Math.round(degrees / 15) * 15;
      }

      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, rotation: degrees } : d))
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
    setExportErrorStatus(null);
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
        setExportErrorStatus(res.status);
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

        {/* Controles de Formato y Exportación Grandes */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-xl bg-[#0D0E11] p-1.5 border border-[#20232A] text-xs font-mono font-medium shadow-inner">
            <button
              onClick={() => setFormat("58x100")}
              className={`px-4 py-2 rounded-lg transition-all ${
                format === "58x100"
                  ? "bg-[#16181D] text-white border border-[#20232A] font-bold shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F3F4F6]"
              }`}
            >
              58 × 100 cm
            </button>
            <button
              onClick={() => setFormat("58x200")}
              className={`px-4 py-2 rounded-lg transition-all ${
                format === "58x200"
                  ? "bg-[#16181D] text-white border border-[#20232A] font-bold shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F3F4F6]"
              }`}
            >
              58 × 200 cm
            </button>
          </div>

          <button
            onClick={handleExport}
            disabled={designs.length === 0 || exporting}
            className="inline-flex items-center gap-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#00A3FF]/90 px-6 py-3 text-sm font-bold text-white transition-all shadow-lg active:scale-95 disabled:opacity-30 font-sans"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-white" />
                <span>Generando 300 DPI...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Exportar Pliego DTF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Alerta de Error con acción directa */}
      {exportError && (
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
            <span>{exportError}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {exportErrorStatus === 401 && (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1 rounded bg-[#F3F4F6] px-2.5 py-1 text-xs font-bold text-black hover:bg-white"
              >
                <LogIn className="h-3.5 w-3.5" /> Iniciar Sesión
              </Link>
            )}
            {exportErrorStatus === 403 && (
              <Link
                href="/account"
                className="inline-flex items-center gap-1 rounded bg-[#00A3FF] px-2.5 py-1 text-xs font-bold text-white hover:bg-[#00A3FF]/90"
              >
                <Crown className="h-3.5 w-3.5" /> Suscribirse
              </Link>
            )}
            <button
              onClick={() => setExportError(null)}
              className="text-red-300 hover:text-white"
              aria-label="Cerrar error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Éxito con botón cerrar */}
      {exportSuccess && (
        <div className="mb-4 rounded border border-[#00A3FF]/30 bg-[#00A3FF]/10 p-3 text-xs text-[#00A3FF] flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Pliego DTF exportado con éxito a 300 DPI reales. ¡Tu descarga ha comenzado!</span>
          </div>
          <button
            onClick={() => setExportSuccess(false)}
            className="text-[#00A3FF] hover:text-white"
            aria-label="Cerrar notificación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Grid de Trabajo */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SIDEBAR DE CONTROL (4 Columnas) */}
        <div className="space-y-5 lg:col-span-4">
          <div className="rounded-2xl border border-[#20232A] bg-[#16181D] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E95A5]">
                Diseños en el Pliego ({designs.length})
              </span>
              <div className="flex items-center gap-2">
                {designs.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("¿Deseas vaciar todo el pliego de diseño?")) {
                        setDesigns([]);
                        setSelectedId(null);
                      }
                    }}
                    className="text-xs text-[#8E95A5] hover:text-red-400 font-mono transition-colors px-2 py-1 rounded"
                  >
                    Vaciar pliego
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#00A3FF]/40 bg-[#00A3FF]/15 px-3.5 py-2 text-xs font-bold text-[#00A3FF] hover:bg-[#00A3FF]/25 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Cargar artes</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleAddFiles(e.target.files)}
              />
            </div>

            {designs.length === 0 ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#20232A] bg-[#0D0E11] p-8 text-center hover:border-[#00A3FF]/60 hover:bg-[#12141A] transition-all"
              >
                <div className="mb-2 rounded-xl bg-[#16181D] p-3 text-[#00A3FF] border border-[#20232A]">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-[#F3F4F6]">
                  Haz clic para cargar imágenes
                </span>
                <span className="font-mono text-xs text-[#8E95A5] mt-1">
                  O arrástralas directamente al lienzo de 58cm
                </span>
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
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
                          {d.widthCm} × {d.heightCm} cm • {calculateEffectiveDpi(d)} DPI
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
                        title="Eliminar (Supr)"
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

              {/* Presets Textiles Rápidos y Accesibles */}
              <div className="space-y-2">
                <span className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                  Medidas Estándar Textiles:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Pectoral (10cm)", w: 10 },
                    { label: "Pecho (20cm)", w: 20 },
                    { label: "Frente A4 (21cm)", w: 21 },
                    { label: "Frente A3 (28cm)", w: 28 },
                    { label: "Espalda (32cm)", w: 32 },
                    { label: "Manga (8cm)", w: 8 },
                    { label: "Gorra (6cm)", w: 6 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const targetW = Math.min(canvasWidthCm, preset.w);
                        const targetH = parseFloat((targetW / selectedDesign.aspectRatio).toFixed(2));
                        updateSelectedDesign({ widthCm: targetW, heightCm: targetH });
                      }}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-1.5 text-xs font-semibold text-[#8E95A5] hover:border-[#00A3FF] hover:text-[#00A3FF] hover:bg-[#00A3FF]/10 transition-all active:scale-95"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Inputs de Dimensiones Grandes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>
              </div>

              {/* Acciones Rápidas de Posicionamiento */}
              <div className="pt-3 border-t border-[#20232A] space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider block">
                    Alineación Rápida:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedDesign({
                          xCm: parseFloat(((canvasWidthCm - selectedDesign.widthCm) / 2).toFixed(2)),
                        })
                      }
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-[#00A3FF] hover:text-[#00A3FF] hover:bg-[#00A3FF]/10 transition-all text-center"
                      title="Centrar en el ancho de 58 cm"
                    >
                      Centrar X
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedDesign({ xCm: 1 })}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-[#00A3FF] hover:text-[#00A3FF] hover:bg-[#00A3FF]/10 transition-all text-center"
                      title="Alinear al margen izquierdo (1 cm)"
                    >
                      Margen 1cm
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedDesign({ yCm: 1 })}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-[#00A3FF] hover:text-[#00A3FF] hover:bg-[#00A3FF]/10 transition-all text-center"
                      title="Alinear al borde superior"
                    >
                      Pegar Arriba
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono text-[#8E95A5]">Acciones:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(selectedDesign.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#20232A] bg-[#0D0E11] px-3.5 py-2 text-xs text-[#F3F4F6] hover:bg-[#20232A] font-semibold transition-all active:scale-95"
                      title="Duplicar arte"
                    >
                      <Copy className="h-4 w-4 text-[#00A3FF]" />
                      <span>Duplicar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedDesign({
                          rotation: (selectedDesign.rotation + 90) % 360,
                        })
                      }
                      className="flex items-center gap-1.5 rounded-xl border border-[#20232A] bg-[#0D0E11] px-3.5 py-2 text-xs text-[#F3F4F6] hover:bg-[#20232A] font-semibold transition-all active:scale-95"
                    >
                      <RotateCw className="h-4 w-4 text-[#00A3FF]" />
                      <span>Girar 90°</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LIENZO INTERACTIVO CON SOPORTE DRAG & DROP */}
        <div 
          ref={canvasWrapperRef}
          className={`lg:col-span-8 flex flex-col ${
            isCanvasFullscreen ? "fixed inset-0 z-50 p-6 bg-[#0D0E11] w-screen h-screen" : ""
          }`}
        >
          <div className="mb-2 flex items-center justify-between bg-[#16181D] border border-[#20232A] px-4 py-2.5 rounded-t-xl text-xs text-[#8E95A5]">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F3F4F6]">Lienzo de Montaje:</span>
              <span className="text-[#00A3FF] font-mono font-bold">
                {canvasWidthCm} cm × {canvasHeightCm} cm
              </span>
              <span className="hidden sm:inline-block text-[#8E95A5]/60 text-[11px]">
                (Gira con el mouse • Rueda del ratón: Zoom • Supr para eliminar)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(0.4, parseFloat((z - 0.1).toFixed(2))))}
                className="h-8 w-8 flex items-center justify-center text-[#8E95A5] hover:text-white rounded-lg bg-[#0D0E11] border border-[#20232A] hover:border-[#8E95A5]/60 transition-all active:scale-95"
                title="Alejar zoom"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-md text-[#F3F4F6] bg-[#0D0E11] border border-[#20232A] hover:border-[#00A3FF]"
                title="Resetear zoom a 100%"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                onClick={() => setZoom((z) => Math.min(2.5, parseFloat((z + 0.1).toFixed(2))))}
                className="h-8 w-8 flex items-center justify-center text-[#8E95A5] hover:text-white rounded-lg bg-[#0D0E11] border border-[#20232A] hover:border-[#8E95A5]/60 transition-all active:scale-95"
                title="Acercar zoom"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={toggleCanvasFullscreen}
                className="h-8 w-8 flex items-center justify-center text-[#8E95A5] hover:text-white rounded-lg bg-[#0D0E11] border border-[#20232A] hover:border-[#00A3FF] transition-all active:scale-95 ml-1"
                title={isCanvasFullscreen ? "Salir de pantalla completa" : "Pantalla completa de taller"}
              >
                {isCanvasFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-[#00A3FF]" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-[#00A3FF]" />
                )}
              </button>
            </div>
          </div>

          <div
            ref={canvasContainerRef}
            onWheel={handleCanvasWheel}
            onDragOver={handleCanvasDragOver}
            onDragLeave={handleCanvasDragLeave}
            onDrop={handleCanvasDrop}
            className={`relative flex-1 ${
              isCanvasFullscreen ? "h-[calc(100vh-120px)] max-h-none" : "min-h-[600px] max-h-[750px]"
            } overflow-auto rounded-b-xl border bg-[#0D0E11] p-8 custom-scrollbar flex justify-center items-start transition-colors ${
              isCanvasDragging
                ? "border-[#00A3FF] bg-[#00A3FF]/5"
                : "border-[#20232A]"
            }`}
          >
            {isCanvasDragging && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0D0E11]/80 backdrop-blur-sm pointer-events-none">
                <UploadCloud className="h-12 w-12 text-[#00A3FF] animate-bounce mb-2" />
                <p className="text-base font-bold text-white">Suelta tus diseños en el pliego</p>
                <p className="font-mono text-xs text-[#8E95A5]">Se colocarán a escala real automáticamente</p>
              </div>
            )}

            <div
              style={{
                width: `${visualWidthPx}px`,
                height: `${visualHeightPx}px`,
              }}
              className="relative shadow-2xl border-2 border-[#00A3FF]/40 bg-transparency-grid shrink-0 transition-all"
            >
              <div className="absolute top-0 left-0 bg-[#0D0E11] text-[#00A3FF] border-r border-b border-[#20232A] text-[10px] font-mono px-2 py-0.5 z-10 font-bold">
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
                        ? "ring-2 ring-[#00A3FF] shadow-2xl"
                        : "hover:ring-1 hover:ring-[#8E95A5]/60"
                    }`}
                  >
                    {/* Tirador de Rotación con el Mouse */}
                    {isSelected && (
                      <>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#00A3FF] pointer-events-none" />
                        <div
                          onMouseDown={(e) =>
                            handleRotateStart(e, d, e.currentTarget.parentElement as HTMLDivElement)
                          }
                          className="absolute -top-9 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-[#00A3FF] text-white flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl hover:scale-110 transition-transform z-30 ring-2 ring-[#0D0E11]"
                          title="Gira este diseño con el mouse (mantén Shift para pasos de 15°)"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </div>
                      </>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={d.previewUrl}
                      alt="design"
                      className="h-full w-full object-fill pointer-events-none"
                    />

                    {/* Cota de Medida Visible en Centímetros */}
                    <div
                      className={`absolute -bottom-6 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-lg whitespace-nowrap z-20 font-mono text-[11px] font-bold shadow-md transition-all ${
                        isSelected
                          ? "bg-[#0D0E11] border border-[#00A3FF] text-[#00A3FF] ring-1 ring-[#00A3FF]/40 scale-105"
                          : "bg-[#0D0E11]/90 border border-[#20232A] text-[#F3F4F6] text-[10px]"
                      }`}
                    >
                      {d.widthCm} × {d.heightCm} cm {d.rotation !== 0 ? `• ${d.rotation}°` : ""}
                    </div>
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
