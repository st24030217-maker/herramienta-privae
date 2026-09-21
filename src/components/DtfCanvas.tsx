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
  Minimize2,
  FlipHorizontal,
  Grid,
  Sparkles
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
  flipH?: boolean;   // espejo horizontal
  flipV?: boolean;   // espejo vertical
  aspectRatio: number;
}

export function DtfCanvas() {
  const [format, setFormat] = useState<"58x100" | "58x200">("58x100");
  const [designs, setDesigns] = useState<CanvasDesign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mirrorAll, setMirrorAll] = useState<boolean>(false);
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

  const occupiedHeightCm = designs.length > 0 
    ? Math.max(...designs.map((d) => d.yCm + d.heightCm))
    : 0;
  const rollUtilizationPercent = Math.min(100, Math.round((occupiedHeightCm / canvasHeightCm) * 100));

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

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, design: CanvasDesign) => {
    setSelectedId(design.id);
    const isTouch = "touches" in e;
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;
    const startDesignX = design.xCm;
    const startDesignY = design.yCm;

    const handlePointerMove = (clientX: number, clientY: number) => {
      const deltaXCm = (clientX - startX) / pxPerCm;
      const deltaYCm = (clientY - startY) / pxPerCm;

      const newX = Math.max(0, Math.min(canvasWidthCm - design.widthCm, parseFloat((startDesignX + deltaXCm).toFixed(2))));
      const newY = Math.max(0, Math.min(canvasHeightCm - design.heightCm, parseFloat((startDesignY + deltaYCm).toFixed(2))));

      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, xCm: newX, yCm: newY } : d))
      );
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handlePointerMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        moveEvent.preventDefault();
        handlePointerMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };

    const onPointerEnd = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onPointerEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onPointerEnd);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onPointerEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onPointerEnd);
  };

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent, design: CanvasDesign, element: HTMLDivElement | null) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(design.id);

    if (!element) return;
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handlePointerMove = (clientX: number, clientY: number, shiftKey: boolean) => {
      const deltaX = clientX - centerX;
      const deltaY = clientY - centerY;
      let degrees = Math.round((Math.atan2(deltaY, deltaX) * 180) / Math.PI + 90);
      if (degrees < 0) degrees += 360;
      degrees = degrees % 360;

      if (shiftKey) {
        degrees = Math.round(degrees / 15) * 15;
      }

      setDesigns((prev) =>
        prev.map((d) => (d.id === design.id ? { ...d, rotation: degrees } : d))
      );
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handlePointerMove(moveEvent.clientX, moveEvent.clientY, moveEvent.shiftKey);
    };

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        moveEvent.preventDefault();
        handlePointerMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY, false);
      }
    };

    const onPointerEnd = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onPointerEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onPointerEnd);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onPointerEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onPointerEnd);
  };

  type ResizeCorner = "nw" | "ne" | "sw" | "se";

  const handleResizeStart = (
    e: React.MouseEvent | React.TouchEvent,
    design: CanvasDesign,
    corner: ResizeCorner
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(design.id);

    const isTouch = "touches" in e;
    const startX = isTouch ? e.touches[0].clientX : e.clientX;
    const startY = isTouch ? e.touches[0].clientY : e.clientY;

    const startDesignX = design.xCm;
    const startDesignY = design.yCm;
    const startWidthCm = design.widthCm;
    const startHeightCm = design.heightCm;
    const aspect = design.aspectRatio || (startWidthCm / startHeightCm);

    const handlePointerMove = (clientX: number, clientY: number) => {
      const screenDeltaXCm = (clientX - startX) / pxPerCm;
      const screenDeltaYCm = (clientY - startY) / pxPerCm;

      // Rotar el delta según la orientación del diseño para que pellizcar funcione natural en cualquier ángulo
      const rad = (-design.rotation * Math.PI) / 180;
      const localDeltaXCm = screenDeltaXCm * Math.cos(rad) - screenDeltaYCm * Math.sin(rad);
      const localDeltaYCm = screenDeltaXCm * Math.sin(rad) + screenDeltaYCm * Math.cos(rad);

      const diag = Math.hypot(startWidthCm, startHeightCm);
      if (diag <= 0) return;

      let proj = 0;
      if (corner === "se") {
        proj = (localDeltaXCm * startWidthCm + localDeltaYCm * startHeightCm) / diag;
      } else if (corner === "sw") {
        proj = (-localDeltaXCm * startWidthCm + localDeltaYCm * startHeightCm) / diag;
      } else if (corner === "ne") {
        proj = (localDeltaXCm * startWidthCm - localDeltaYCm * startHeightCm) / diag;
      } else if (corner === "nw") {
        proj = (-localDeltaXCm * startWidthCm - localDeltaYCm * startHeightCm) / diag;
      }

      // Proyección escalar proporcional (conserva medidas proporcionales exactas)
      const scale = Math.max(0.05, (diag + proj) / diag);
      let newW = startWidthCm * scale;
      let newH = newW / aspect;

      // Limitar tamaño mínimo a 2 cm para que no desaparezca
      const minW = 2;
      const minH = minW / aspect;
      if (newW < minW) {
        newW = minW;
        newH = minH;
      }

      let newX = startDesignX;
      let newY = startDesignY;

      if (corner === "se") {
        newX = startDesignX;
        newY = startDesignY;
      } else if (corner === "sw") {
        const anchorX = startDesignX + startWidthCm;
        newX = anchorX - newW;
        newY = startDesignY;
      } else if (corner === "ne") {
        const anchorY = startDesignY + startHeightCm;
        newX = startDesignX;
        newY = anchorY - newH;
      } else if (corner === "nw") {
        const anchorX = startDesignX + startWidthCm;
        const anchorY = startDesignY + startHeightCm;
        newX = anchorX - newW;
        newY = anchorY - newH;
      }

      // Restricción dentro de los límites del metro (58 cm de ancho x canvasHeightCm de alto)
      if (newX < 0) {
        newW += newX;
        newH = newW / aspect;
        newX = 0;
      }
      if (newY < 0) {
        newH += newY;
        newW = newH * aspect;
        newY = 0;
      }
      if (newX + newW > canvasWidthCm) {
        newW = canvasWidthCm - newX;
        newH = newW / aspect;
      }
      if (newY + newH > canvasHeightCm) {
        newH = canvasHeightCm - newY;
        newW = newH * aspect;
      }

      newW = parseFloat(newW.toFixed(2));
      newH = parseFloat(newH.toFixed(2));
      newX = parseFloat(newX.toFixed(2));
      newY = parseFloat(newY.toFixed(2));

      setDesigns((prev) =>
        prev.map((d) =>
          d.id === design.id
            ? { ...d, xCm: newX, yCm: newY, widthCm: newW, heightCm: newH }
            : d
        )
      );
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      handlePointerMove(moveEvent.clientX, moveEvent.clientY);
    };

    const onTouchMove = (moveEvent: TouchEvent) => {
      if (moveEvent.touches.length > 0) {
        moveEvent.preventDefault();
        handlePointerMove(moveEvent.touches[0].clientX, moveEvent.touches[0].clientY);
      }
    };

    const onPointerEnd = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onPointerEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onPointerEnd);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onPointerEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onPointerEnd);
  };

  const handleGridFill = () => {
    if (!selectedDesign) return;
    const spacingCm = 0.8;
    const colWidth = selectedDesign.widthCm + spacingCm;
    const rowHeight = selectedDesign.heightCm + spacingCm;
    const cols = Math.max(1, Math.floor((canvasWidthCm - 1) / colWidth));
    const rows = Math.max(1, Math.floor((canvasHeightCm - 1) / rowHeight));

    const newDesigns: CanvasDesign[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        newDesigns.push({
          ...selectedDesign,
          id: "design_" + Math.random().toString(36).substring(2, 9),
          xCm: parseFloat((1 + c * colWidth).toFixed(2)),
          yCm: parseFloat((1 + r * rowHeight).toFixed(2)),
        });
      }
    }
    setDesigns(newDesigns);
    setSelectedId(newDesigns[0]?.id || null);
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
      formData.append("mirrorAll", String(mirrorAll));

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
          flipH: Boolean(d.flipH),
          flipV: Boolean(d.flipV),
        };
      });

      formData.append("layout", JSON.stringify(layoutData));

      const res = await fetch("/api/process/compose-dtf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setExportErrorStatus(res.status);
        let errorMsg = "Error al componer el archivo DTF.";
        if (res.status === 413) {
          errorMsg = "El conjunto de imágenes supera el límite de 4.5 MB del servidor de Vercel. Reduce o comprime alguna de las imágenes antes de exportar.";
        } else {
          try {
            const err = await res.json();
            if (err?.error) errorMsg = err.error;
          } catch {
            const text = await res.text().catch(() => "");
            if (text && text.length < 150) errorMsg = text;
          }
        }
        throw new Error(errorMsg);
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
              Armador de Metros DTF
            </h1>
            <span className="font-mono text-xs text-white border border-white/20 bg-white/10 px-2.5 py-0.5 rounded">
              METRO DE 58 CM — 300 DPI
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-[#8E95A5]">
            Acomoda tus diseños en centímetros reales para aprovechar todo el metro y descargarlo listo para imprimir.
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
              58 × 100 cm (1 Metro)
            </button>
            <button
              onClick={() => setFormat("58x200")}
              className={`px-4 py-2 rounded-lg transition-all ${
                format === "58x200"
                  ? "bg-[#16181D] text-white border border-[#20232A] font-bold shadow-sm"
                  : "text-[#8E95A5] hover:text-[#F3F4F6]"
              }`}
            >
              58 × 200 cm (2 Metros)
            </button>
          </div>

          {/* Botón Espejar Todo el Pliego */}
          <button
            type="button"
            onClick={() => setMirrorAll(!mirrorAll)}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-mono font-bold border transition-all active:scale-95 ${
              mirrorAll
                ? "bg-white/15 border-white text-white shadow-sm ring-1 ring-white"
                : "bg-[#0D0E11] border-[#20232A] text-[#8E95A5] hover:text-[#F3F4F6] hover:border-[#8E95A5]/40"
            }`}
            title="Voltea todo el metro al revés (modo espejo para imprimir directo)"
          >
            <FlipHorizontal className="h-4 w-4" />
            <span>{mirrorAll ? "Espejo: PUESTO" : "Modo Espejo"}</span>
          </button>

          {/* Medidor de Rendimiento de Bobina */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0D0E11] border border-[#20232A] font-mono text-xs">
            <span className="text-[#8E95A5]">Aprovechado:</span>
            <span className="font-bold text-[#F3F4F6]">{occupiedHeightCm.toFixed(1)} cm</span>
            <span className="text-[#8E95A5]">/ {canvasHeightCm} cm</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              rollUtilizationPercent > 85 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-[#20232A] text-white"
            }`}>
              {rollUtilizationPercent}%
            </span>
          </div>

          <button
            onClick={handleExport}
            disabled={designs.length === 0 || exporting}
            className="inline-flex items-center gap-2.5 rounded-xl bg-white hover:bg-neutral-200 px-6 py-3 text-sm font-bold text-black transition-all shadow-lg active:scale-95 disabled:opacity-30 font-sans"
          >
            {exporting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-black" />
                <span>Generando 300 DPI...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Descargar Metro DTF</span>
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
                className="inline-flex items-center gap-1 rounded bg-white px-2.5 py-1 text-xs font-bold text-black hover:bg-neutral-200"
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
        <div className="mb-4 rounded border border-white/20 bg-white/10 p-3 text-xs text-white flex items-center justify-between gap-2 font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>¡Metro DTF generado con éxito a 300 DPI reales! Tu descarga comenzó.</span>
          </div>
          <button
            onClick={() => setExportSuccess(false)}
            className="text-neutral-400 hover:text-white"
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
                Tus Diseños en el Metro ({designs.length})
              </span>
              <div className="flex items-center gap-2">
                {designs.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm("¿Deseas vaciar todo el metro de diseño?")) {
                        setDesigns([]);
                        setSelectedId(null);
                      }
                    }}
                    className="text-xs text-[#8E95A5] hover:text-red-400 font-mono transition-colors px-2 py-1 rounded"
                  >
                    Borrar todo
                  </button>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Subir diseños</span>
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
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#20232A] bg-[#0D0E11] p-8 text-center hover:border-white/50 hover:bg-[#12141A] transition-all"
              >
                <div className="mb-2 rounded-xl bg-[#16181D] p-3 text-white border border-[#20232A]">
                  <Plus className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-[#F3F4F6]">
                  Haz clic para subir imágenes
                </span>
                <span className="font-mono text-xs text-[#8E95A5] mt-1">
                  O arrástralas directo al metro de 58 cm
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
                        ? "bg-[#20232A] border-white/40 text-[#F3F4F6] font-semibold"
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
                  Medidas del Diseño
                </h3>
                <span className="text-[11px] text-[#8E95A5] font-mono">
                  {selectedDesign.originalWidthPx} × {selectedDesign.originalHeightPx} px
                </span>
              </div>

              {/* Presets Textiles Rápidos y Accesibles */}
              <div className="space-y-2">
                <span className="block text-xs font-mono text-[#8E95A5] uppercase tracking-wider">
                  Medidas Listas para Ropa:
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Escudo / Pectoral (10 cm)", w: 10 },
                    { label: "Pecho Mediano (20 cm)", w: 20 },
                    { label: "Frente A4 (21 cm)", w: 21 },
                    { label: "Frente Grande A3 (28 cm)", w: 28 },
                    { label: "Espalda Completa (32 cm)", w: 32 },
                    { label: "Manga (8 cm)", w: 8 },
                    { label: "Gorra (6 cm)", w: 6 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        const targetW = Math.min(canvasWidthCm, preset.w);
                        const targetH = parseFloat((targetW / selectedDesign.aspectRatio).toFixed(2));
                        updateSelectedDesign({ widthCm: targetW, heightCm: targetH });
                      }}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-1.5 text-xs font-semibold text-[#8E95A5] hover:border-white hover:text-white hover:bg-white/10 transition-all active:scale-95"
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-white focus:outline-none"
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
                    Mover Horizontal X (cm):
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#8E95A5] mb-1 font-mono">
                    Mover Vertical Y (cm):
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
                    className="w-full rounded-xl border border-[#20232A] bg-[#0D0E11] px-3 py-2 text-sm text-[#F3F4F6] font-mono focus:border-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Acciones Rápidas de Posicionamiento */}
              <div className="pt-3 border-t border-[#20232A] space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-mono text-[#8E95A5] uppercase tracking-wider block">
                    Acomodar Rápido:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedDesign({
                          xCm: parseFloat(((canvasWidthCm - selectedDesign.widthCm) / 2).toFixed(2)),
                        })
                      }
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-white hover:text-white hover:bg-white/10 transition-all text-center"
                      title="Centrar en el ancho de 58 cm"
                    >
                      Centrar
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedDesign({ xCm: 1 })}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-white hover:text-white hover:bg-white/10 transition-all text-center"
                      title="Alinear al margen izquierdo (1 cm)"
                    >
                      A la Izquierda
                    </button>
                    <button
                      type="button"
                      onClick={() => updateSelectedDesign({ yCm: 1 })}
                      className="rounded-xl border border-[#20232A] bg-[#0D0E11] px-2.5 py-2 text-xs font-mono text-[#F3F4F6] hover:border-white hover:text-white hover:bg-white/10 transition-all text-center"
                      title="Alinear al borde superior"
                    >
                      Pegar Arriba
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono text-[#8E95A5]">Acciones:</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateSelectedDesign({
                          flipH: !selectedDesign.flipH,
                        })
                      }
                      className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                        selectedDesign.flipH
                          ? "border-white bg-white/10 text-white ring-1 ring-white"
                          : "border-[#20232A] bg-[#0D0E11] text-[#F3F4F6] hover:bg-[#20232A]"
                      }`}
                      title="Voltear diseño en modo espejo"
                    >
                      <FlipHorizontal className="h-4 w-4 text-white" />
                      <span>Espejo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(selectedDesign.id)}
                      className="flex items-center gap-1.5 rounded-xl border border-[#20232A] bg-[#0D0E11] px-3.5 py-2 text-xs text-[#F3F4F6] hover:bg-[#20232A] font-semibold transition-all active:scale-95"
                      title="Copiar diseño"
                    >
                      <Copy className="h-4 w-4 text-white" />
                      <span>Copiar</span>
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
                      <RotateCw className="h-4 w-4 text-white" />
                      <span>Girar 90°</span>
                    </button>
                  </div>
                </div>

                {/* Duplicador en Cuadrícula para Llenar la Bobina */}
                <button
                  type="button"
                  onClick={handleGridFill}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 px-3.5 py-2.5 text-xs text-white font-bold transition-all active:scale-95"
                  title="Multiplica y organiza automáticamente este arte para llenar todo el metro"
                >
                  <Grid className="h-4 w-4" />
                  <span>Llenar Todo el Metro con Copias</span>
                </button>
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
              <span className="font-semibold text-[#F3F4F6]">Tu Metro de Trabajo:</span>
              <span className="text-white font-mono font-bold">
                {canvasWidthCm} cm × {canvasHeightCm} cm
              </span>
              <span className="hidden sm:inline-block text-[#8E95A5]/60 text-[11px]">
                (Arrastra con el mouse • Rueda: Zoom • Supr: Borrar)
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
                className="font-mono text-xs font-bold px-2.5 py-1 rounded-md text-[#F3F4F6] bg-[#0D0E11] border border-[#20232A] hover:border-white"
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
                className="h-8 w-8 flex items-center justify-center text-[#8E95A5] hover:text-white rounded-lg bg-[#0D0E11] border border-[#20232A] hover:border-white transition-all active:scale-95 ml-1"
                title={isCanvasFullscreen ? "Salir de pantalla completa" : "Pantalla completa de taller"}
              >
                {isCanvasFullscreen ? (
                  <Minimize2 className="h-4 w-4 text-white" />
                ) : (
                  <Maximize2 className="h-4 w-4 text-white" />
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
                ? "border-white bg-white/5"
                : "border-[#20232A]"
            }`}
          >
            {isCanvasDragging && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0D0E11]/80 backdrop-blur-sm pointer-events-none">
                <UploadCloud className="h-12 w-12 text-white animate-bounce mb-2" />
                <p className="text-base font-bold text-white">Suelta tus diseños en el metro</p>
                <p className="font-mono text-xs text-[#8E95A5]">Se acomodan en medidas reales automáticamente</p>
              </div>
            )}

            <div
              style={{
                width: `${visualWidthPx}px`,
                height: `${visualHeightPx}px`,
              }}
              className="relative shadow-2xl border-2 border-white/30 bg-transparency-grid shrink-0 transition-all"
            >
              <div className="absolute top-0 left-0 bg-[#0D0E11] text-white border-r border-b border-[#20232A] text-[10px] font-mono px-2 py-0.5 z-10 font-bold">
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
                    onTouchStart={(e) => handleDragStart(e, d)}
                    style={{
                      position: "absolute",
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                      transform: `rotate(${d.rotation}deg) scaleX(${Boolean(d.flipH) !== Boolean(mirrorAll) ? -1 : 1}) scaleY(${d.flipV ? -1 : 1})`,
                      transformOrigin: "center center",
                    }}
                    className={`cursor-move group select-none ${
                      isSelected
                        ? "ring-2 ring-white shadow-2xl"
                        : "hover:ring-1 hover:ring-[#8E95A5]/60"
                    }`}
                  >
                    {/* Tirador de Rotación con el Mouse / Dedo */}
                    {isSelected && (
                      <>
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-white pointer-events-none" />
                        <div
                          onMouseDown={(e) =>
                            handleRotateStart(e, d, e.currentTarget.parentElement as HTMLDivElement)
                          }
                          onTouchStart={(e) =>
                            handleRotateStart(e, d, e.currentTarget.parentElement as HTMLDivElement)
                          }
                          className="absolute -top-9 left-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white text-black flex items-center justify-center cursor-grab active:cursor-grabbing shadow-xl hover:scale-110 transition-transform z-30 ring-2 ring-[#0D0E11] touch-none"
                          title="Gira este diseño con el mouse o dedo (mantén Shift para pasos de 15°)"
                        >
                          <RotateCw className="h-3.5 w-3.5" />
                        </div>

                        {/* 4 Tiradores de Esquina para Pellizcar y Redimensionar Proporcionalmente */}
                        {/* Esquina Superior Izquierda (NW) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, d, "nw")}
                          onTouchStart={(e) => handleResizeStart(e, d, "nw")}
                          className="absolute -top-2.5 -left-2.5 h-5 w-5 rounded-full bg-white border-2 border-[#0D0E11] shadow-lg cursor-nwse-resize z-30 hover:scale-125 transition-transform flex items-center justify-center touch-none ring-1 ring-white/50"
                          title="Pellizca o arrastra para achicar o agrandar proporcionalmente"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0D0E11]" />
                        </div>

                        {/* Esquina Superior Derecha (NE) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, d, "ne")}
                          onTouchStart={(e) => handleResizeStart(e, d, "ne")}
                          className="absolute -top-2.5 -right-2.5 h-5 w-5 rounded-full bg-white border-2 border-[#0D0E11] shadow-lg cursor-nesw-resize z-30 hover:scale-125 transition-transform flex items-center justify-center touch-none ring-1 ring-white/50"
                          title="Pellizca o arrastra para achicar o agrandar proporcionalmente"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0D0E11]" />
                        </div>

                        {/* Esquina Inferior Izquierda (SW) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, d, "sw")}
                          onTouchStart={(e) => handleResizeStart(e, d, "sw")}
                          className="absolute -bottom-2.5 -left-2.5 h-5 w-5 rounded-full bg-white border-2 border-[#0D0E11] shadow-lg cursor-nesw-resize z-30 hover:scale-125 transition-transform flex items-center justify-center touch-none ring-1 ring-white/50"
                          title="Pellizca o arrastra para achicar o agrandar proporcionalmente"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0D0E11]" />
                        </div>

                        {/* Esquina Inferior Derecha (SE) */}
                        <div
                          onMouseDown={(e) => handleResizeStart(e, d, "se")}
                          onTouchStart={(e) => handleResizeStart(e, d, "se")}
                          className="absolute -bottom-2.5 -right-2.5 h-5 w-5 rounded-full bg-white border-2 border-[#0D0E11] shadow-lg cursor-nwse-resize z-30 hover:scale-125 transition-transform flex items-center justify-center touch-none ring-1 ring-white/50"
                          title="Pellizca o arrastra para achicar o agrandar proporcionalmente"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0D0E11]" />
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
                          ? "bg-[#0D0E11] border border-white text-white ring-1 ring-white/40 scale-105"
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
