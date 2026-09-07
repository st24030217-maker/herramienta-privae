"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  UploadCloud, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileImage,
  Sparkles,
  X,
  LogIn,
  Crown,
  Maximize2,
  FolderOpen
} from "lucide-react";

interface ToolLayoutProps {
  title: string;
  description: string;
  badge?: string;
  apiEndpoint: string;
  additionalFormData?: (formData: FormData) => void;
  renderControls?: (
    originalImage: string | null, 
    setCustomParam: (key: string, val: any) => void,
    customParams: Record<string, any>
  ) => React.ReactNode;
}

export function ToolLayout({
  title,
  description,
  badge = "PNG 300 DPI",
  apiEndpoint,
  additionalFormData,
  renderControls,
}: ToolLayoutProps) {
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomResult, setZoomResult] = useState<number>(1);
  const [viewBg, setViewBg] = useState<"grid" | "black" | "white">("grid");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultBoxRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (resultBoxRef.current?.requestFullscreen) {
        resultBoxRef.current.requestFullscreen().catch(() => {
          setIsFullscreen(!isFullscreen);
        });
      } else {
        setIsFullscreen(!isFullscreen);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleWheelZoom = (e: React.WheelEvent) => {
    if (!resultUrl) return;
    const delta = e.deltaY < 0 ? 0.15 : -0.15;
    setZoomResult((z) => Math.min(4, Math.max(0.5, parseFloat((z + delta).toFixed(2)))));
  };

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor sube un archivo de imagen válido (PNG, JPG, WEBP, etc.)");
      setErrorStatus(null);
      return;
    }
    setError(null);
    setErrorStatus(null);
    setResultUrl(null);
    setFile(selectedFile);

    const url = URL.createObjectURL(selectedFile);
    setOriginalPreview(url);

    const img = new Image();
    img.onload = () => {
      setImgDimensions({ width: img.width, height: img.height });
    };
    img.src = url;
  };

  // Soporte para pegar con Ctrl + V desde el portapapeles
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const pastedFile = items[i].getAsFile();
          if (pastedFile) {
            handleFileChange(pastedFile);
            break;
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const setCustomParam = (key: string, val: any) => {
    setCustomParams((prev) => ({ ...prev, [key]: val }));
  };

  const handleProcess = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setErrorStatus(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      Object.entries(customParams).forEach(([k, v]) => {
        formData.append(k, String(v));
      });

      if (additionalFormData) {
        additionalFormData(formData);
      }

      const res = await fetch(apiEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        setErrorStatus(res.status);
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Ocurrió un error al procesar la imagen.");
      }

      const blob = await res.blob();
      const outputUrl = URL.createObjectURL(blob);
      setResultUrl(outputUrl);
    } catch (err: any) {
      setError(err.message || "Error en el procesamiento");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `privae_${file?.name?.replace(/\.[^/.]+$/, "") || "archivo"}_300dpi.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setFile(null);
    setOriginalPreview(null);
    setResultUrl(null);
    setError(null);
    setErrorStatus(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const fileSizeMb = file ? (file.size / (1024 * 1024)).toFixed(2) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Encabezado Técnico de Herramienta */}
      <div className="rounded-2xl border border-[#20232A] bg-[#16181D]/90 p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F3F4F6] tracking-tight">
                {title}
              </h1>
              <span className="font-mono text-xs font-bold text-[#00A3FF] border border-[#00A3FF]/40 bg-[#00A3FF]/15 px-3 py-1 rounded-full">
                {badge}
              </span>
            </div>
            <p className="text-sm text-[#8E95A5] max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-[#20232A] bg-[#0D0E11] px-4 py-2.5 text-xs font-semibold text-[#F3F4F6] hover:border-[#8E95A5]/60 hover:bg-[#1A1C23] transition-all shadow-sm"
            >
              <RefreshCw className="h-4 w-4 text-[#8E95A5]" />
              <span>Cambiar imagen</span>
            </button>
          )}
        </div>
      </div>

      {/* Controles de Parámetros Específicos */}
      {renderControls && (
        <div className="rounded-2xl border border-[#20232A] bg-[#16181D] p-6 sm:p-7 shadow-sm">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8E95A5] mb-4 flex items-center gap-2">
            <span>Ajustes de Calibración</span>
          </h3>
          {renderControls(originalPreview, setCustomParam, customParams)}
        </div>
      )}

      {/* Mensaje de Error con acción directa y botones grandes */}
      {error && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 shadow-md">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {errorStatus === 401 && (
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F3F4F6] px-5 py-2.5 text-xs font-bold text-black hover:bg-white transition-all shadow"
              >
                <LogIn className="h-4 w-4" /> Iniciar Sesión
              </Link>
            )}
            {errorStatus === 403 && (
              <Link
                href="/account"
                className="inline-flex items-center gap-2 rounded-xl bg-[#00A3FF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-all shadow"
              >
                <Crown className="h-4 w-4" /> Activar Membresía
              </Link>
            )}
            <button
              onClick={() => setError(null)}
              className="p-1.5 text-red-300 hover:text-white rounded-lg hover:bg-red-500/20 transition-colors"
              aria-label="Cerrar alerta"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Grid Técnico: ENTRADA Y RESULTADO */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ================= SECCIÓN 1: ENTRADA ================= */}
        <div className="flex flex-col justify-between rounded-2xl border border-[#20232A] bg-[#16181D] p-6 shadow-sm">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-3">
              <span className="font-mono text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#20232A] text-[10px] text-[#00A3FF]">1</span>
                <span>Arte Original</span>
              </span>
              {imgDimensions && (
                <span className="font-mono text-xs text-[#8E95A5] bg-[#0D0E11] px-2.5 py-1 rounded-md border border-[#20232A]">
                  {imgDimensions.width} × {imgDimensions.height} px {fileSizeMb && `• ${fileSizeMb} MB`}
                </span>
              )}
            </div>

            {!originalPreview ? (
              /* Dropzone de Carga Amplia y Táctil */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex min-h-[380px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
                  isDragging
                    ? "border-[#00A3FF] bg-[#00A3FF]/10 scale-[0.99]"
                    : "border-[#20232A] bg-[#0D0E11] hover:border-[#00A3FF]/60 hover:bg-[#12141A]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                />
                <div className="mb-4 rounded-2xl border border-[#20232A] bg-[#16181D] p-4 text-[#00A3FF] shadow-inner">
                  <UploadCloud className="h-10 w-10" />
                </div>
                <h3 className="text-base font-bold text-[#F3F4F6]">
                  Arrastra tu diseño aquí
                </h3>
                <p className="mt-1 text-xs text-[#8E95A5]">
                  O puedes pegar con <kbd className="rounded bg-[#20232A] px-1.5 py-0.5 font-mono text-[10px] text-[#F3F4F6]">Ctrl + V</kbd>
                </p>

                <button
                  type="button"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#20232A] hover:bg-[#2c313a] px-5 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  <FolderOpen className="h-4 w-4 text-[#00A3FF]" />
                  <span>Examinar en mi equipo</span>
                </button>

                <p className="mt-4 font-mono text-[11px] text-[#8E95A5]/60">
                  Admite PNG, JPG, WEBP • Salida certificada a 300 DPI
                </p>
              </div>
            ) : (
              /* Vista Previa Original */
              <div className="relative flex min-h-[380px] items-center justify-center rounded-xl bg-transparency-grid p-4 overflow-hidden border border-[#20232A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalPreview}
                  alt="Original"
                  className="max-h-[380px] max-w-full object-contain rounded"
                />
              </div>
            )}
          </div>

          {originalPreview && (
            <div className="mt-5 pt-4 border-t border-[#20232A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2 truncate text-xs text-[#8E95A5] font-mono">
                <FileImage className="h-4 w-4 text-[#00A3FF] shrink-0" />
                <span className="truncate font-semibold text-[#F3F4F6]">{file?.name}</span>
                {fileSizeMb && <span>({fileSizeMb} MB)</span>}
              </div>

              {/* Botón Grande de Procesar */}
              <button
                onClick={handleProcess}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#F3F4F6] hover:bg-white px-7 py-3 text-sm font-bold text-[#0D0E11] transition-all shadow-md disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-[#0D0E11]" />
                    <span>Procesando a 300 DPI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 text-[#00A3FF]" />
                    <span>Procesar arte</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* ================= SECCIÓN 2: RESULTADO ================= */}
        <div 
          ref={resultBoxRef}
          className={`flex flex-col justify-between rounded-2xl border border-[#20232A] bg-[#16181D] p-6 shadow-sm transition-all ${
            isFullscreen ? "fixed inset-0 z-50 rounded-none p-6 bg-[#0D0E11] max-w-none w-screen h-screen overflow-hidden" : ""
          }`}
        >
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#20232A] pb-3">
              <span className="font-mono text-xs font-bold text-[#F3F4F6] uppercase tracking-wider flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#20232A] text-[10px] text-emerald-400">2</span>
                <span>Resultado Calibrado (DTF 300 DPI)</span>
              </span>

              {/* Controles de Inspección Táctiles: Fondo, Zoom y Pantalla Completa */}
              {resultUrl && (
                <div className="flex items-center gap-1.5 bg-[#0D0E11] border border-[#20232A] p-1 rounded-xl">
                  {/* Selector de Fondo de Contraste */}
                  <div className="flex items-center gap-1 pr-1.5 border-r border-[#20232A]">
                    <button
                      type="button"
                      onClick={() => setViewBg("grid")}
                      className={`h-7 w-7 rounded-lg text-xs flex items-center justify-center transition-all ${
                        viewBg === "grid" ? "bg-[#20232A] ring-1 ring-[#00A3FF]" : "hover:bg-[#16181D]"
                      }`}
                      title="Fondo Cuadrícula Transparente"
                    >
                      🏁
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewBg("black")}
                      className={`h-7 w-7 rounded-lg text-xs flex items-center justify-center transition-all border ${
                        viewBg === "black" ? "border-[#00A3FF] bg-black ring-1 ring-[#00A3FF]" : "border-[#333] bg-black"
                      }`}
                      title="Fondo Negro (Ver halos blancos y bordes lechosos)"
                    >
                      <span className="h-3 w-3 rounded-full bg-black border border-gray-600 inline-block" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewBg("white")}
                      className={`h-7 w-7 rounded-lg text-xs flex items-center justify-center transition-all border ${
                        viewBg === "white" ? "border-[#00A3FF] bg-white ring-1 ring-[#00A3FF]" : "border-[#ccc] bg-white"
                      }`}
                      title="Fondo Blanco (Ver detalles oscuros)"
                    >
                      <span className="h-3 w-3 rounded-full bg-white border border-gray-400 inline-block" />
                    </button>
                  </div>

                  {/* Controles de Zoom */}
                  <div className="flex items-center gap-1 pr-1.5 border-r border-[#20232A]">
                    <button
                      type="button"
                      onClick={() => setZoomResult((z) => Math.max(0.5, parseFloat((z - 0.25).toFixed(2))))}
                      className="h-7 w-7 rounded-lg bg-[#16181D] hover:bg-[#20232A] text-[#8E95A5] hover:text-white flex items-center justify-center transition-colors active:scale-95"
                      title="Alejar"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomResult(1)}
                      className="px-2 py-0.5 text-[11px] font-mono font-bold text-[#00A3FF] bg-[#16181D] rounded-md hover:bg-[#20232A]"
                      title="Resetear zoom al 100%"
                    >
                      {Math.round(zoomResult * 100)}%
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomResult((z) => Math.min(4, parseFloat((z + 0.25).toFixed(2))))}
                      className="h-7 w-7 rounded-lg bg-[#16181D] hover:bg-[#20232A] text-[#8E95A5] hover:text-white flex items-center justify-center transition-colors active:scale-95"
                      title="Acercar"
                    >
                      +
                    </button>
                  </div>

                  {/* Botón Pantalla Completa */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="h-7 w-7 rounded-lg bg-[#16181D] hover:bg-[#20232A] text-[#8E95A5] hover:text-white flex items-center justify-center transition-colors active:scale-95"
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  >
                    <Maximize2 className="h-3.5 w-3.5 text-[#00A3FF]" />
                  </button>
                </div>
              )}
            </div>

            {/* Contenedor del Visor con soporte de Rueda de Mouse */}
            <div 
              onWheel={handleWheelZoom}
              className={`relative flex items-center justify-center rounded-xl p-4 overflow-hidden border border-[#20232A] transition-colors select-none ${
                isFullscreen ? "h-[calc(100vh-140px)]" : "min-h-[380px] max-h-[500px]"
              } ${
                viewBg === "black" 
                  ? "bg-black" 
                  : viewBg === "white" 
                  ? "bg-white" 
                  : "bg-transparency-grid"
              }`}
            >
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <Loader2 className="h-10 w-10 animate-spin text-[#00A3FF]" />
                  <p className="text-base font-bold text-[#F3F4F6]">
                    Procesando píxeles en alta fidelidad...
                  </p>
                  <span className="font-mono text-xs text-[#8E95A5]">
                    Calibrando canal alfa RGBA y densidad 300 DPI
                  </span>
                </div>
              ) : resultUrl ? (
                <div className="w-full h-full flex items-center justify-center overflow-auto custom-scrollbar cursor-grab active:cursor-grabbing">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultUrl}
                    alt="Resultado Procesado"
                    style={{
                      transform: `scale(${zoomResult})`,
                      transformOrigin: "center center",
                      transition: "transform 0.15s ease-out",
                    }}
                    className="max-h-[380px] max-w-full object-contain rounded pointer-events-none"
                  />
                </div>
              ) : (
                <div className="text-center text-[#8E95A5]/60 p-6">
                  <Sparkles className="mx-auto h-10 w-10 mb-3 opacity-20 text-[#8E95A5]" />
                  <p className="font-mono text-xs">
                    Carga un diseño y pulsa <strong>Procesar arte</strong> para generar el PNG a 300 DPI.
                  </p>
                </div>
              )}
            </div>
          </div>

          {resultUrl && (
            <div className="mt-5 pt-4 border-t border-[#20232A] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <span className="font-mono text-xs text-[#8E95A5] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>PNG Transparente Listo para Impresión (Rueda del mouse: Zoom)</span>
              </span>

              {/* Botón Grande de Descarga */}
              <button
                onClick={handleDownload}
                className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#00A3FF]/90 px-7 py-3 text-sm font-bold text-white transition-all shadow-lg active:scale-[0.98]"
              >
                <Download className="h-5 w-5" />
                <span>Descargar PNG para DTF</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
