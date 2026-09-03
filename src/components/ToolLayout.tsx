"use client";

import React, { useState, useRef } from "react";
import { 
  UploadCloud, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  FileImage,
  Sparkles
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
  const [customParams, setCustomParams] = useState<Record<string, any>>({});
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor sube un archivo de imagen válido (PNG, JPG, WEBP, etc.)");
      return;
    }
    setError(null);
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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Encabezado Técnico de Herramienta */}
      <div className="mb-8 border-b border-[#20232A] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
                {title}
              </h1>
              <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2 py-0.5 rounded">
                {badge}
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#8E95A5] max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>
          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-[#F3F4F6] bg-[#16181D] border border-[#20232A] hover:border-[#8E95A5]/40 px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Reemplazar archivo
            </button>
          )}
        </div>
      </div>

      {/* Controles de Parámetros Específicos */}
      {renderControls && (
        <div className="mb-6 rounded-lg border border-[#20232A] bg-[#16181D] p-5">
          {renderControls(originalPreview, setCustomParam, customParams)}
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-200">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid Técnico: ENTRADA Y RESULTADO */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ================= SECCIÓN 1: ENTRADA ================= */}
        <div className="flex flex-col rounded-lg border border-[#20232A] bg-[#16181D] p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-3">
            <span className="font-mono text-xs text-[#8E95A5] uppercase tracking-wider">
              Entrada (Arte Original)
            </span>
            {imgDimensions && (
              <span className="font-mono text-xs text-[#8E95A5]">
                {imgDimensions.width} × {imgDimensions.height} px
              </span>
            )}
          </div>

          {!originalPreview ? (
            /* Dropzone de Carga */
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 min-h-[340px] cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed border-[#20232A] bg-[#0D0E11] p-8 text-center transition-colors hover:border-[#00A3FF]/60 hover:bg-[#12141A]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="mb-3 rounded border border-[#20232A] bg-[#16181D] p-3 text-[#8E95A5]">
                <UploadCloud className="h-7 w-7 text-[#00A3FF]" />
              </div>
              <h3 className="text-sm font-semibold text-[#F3F4F6]">
                Arrastra tu diseño o haz clic para examinar
              </h3>
              <p className="mt-1 font-mono text-[11px] text-[#8E95A5]">
                Formatos PNG, JPG, WEBP. Salida certificada a 300 DPI.
              </p>
            </div>
          ) : (
            /* Vista Previa Original */
            <div className="flex flex-1 flex-col justify-between">
              <div className="relative flex min-h-[340px] items-center justify-center rounded bg-transparency-grid p-4 overflow-hidden border border-[#20232A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalPreview}
                  alt="Original"
                  className="max-h-[380px] max-w-full object-contain rounded"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate text-xs text-[#8E95A5]">
                  <FileImage className="h-4 w-4 text-[#F3F4F6] shrink-0" />
                  <span className="truncate font-mono">{file?.name}</span>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded bg-[#F3F4F6] px-5 py-2.5 text-xs font-bold text-[#0D0E11] hover:bg-white transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#0D0E11]" /> Procesando a 300 DPI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#00A3FF]" /> Procesar arte
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECCIÓN 2: RESULTADO ================= */}
        <div className="flex flex-col rounded-lg border border-[#20232A] bg-[#16181D] p-6">
          <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-3">
            <span className="font-mono text-xs text-[#8E95A5] uppercase tracking-wider">
              Salida Calibrada (DTF 300 DPI)
            </span>
            {resultUrl && (
              <span className="flex items-center gap-1 font-mono text-xs font-semibold text-[#00A3FF]">
                <CheckCircle2 className="h-3.5 w-3.5" /> Calibrado para impresión
              </span>
            )}
          </div>

          <div className="relative flex flex-1 min-h-[340px] items-center justify-center rounded bg-transparency-grid p-4 overflow-hidden border border-[#20232A]">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#00A3FF]" />
                <p className="text-sm font-semibold text-[#F3F4F6]">
                  Procesando píxeles en alta fidelidad...
                </p>
                <span className="font-mono text-xs text-[#8E95A5]">
                  Calibrando canal alfa RGBA y densidad 300 DPI
                </span>
              </div>
            ) : resultUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={resultUrl}
                alt="Resultado Procesado"
                className="max-h-[380px] max-w-full object-contain rounded"
              />
            ) : (
              <div className="text-center text-[#8E95A5]/60">
                <Sparkles className="mx-auto h-8 w-8 mb-2 opacity-20 text-[#8E95A5]" />
                <p className="font-mono text-xs">
                  Carga un archivo y procesa para generar el PNG a 300 DPI.
                </p>
              </div>
            )}
          </div>

          {resultUrl && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#8E95A5]">
                PNG Transparente • 300 DPI
              </span>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded bg-[#00A3FF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors"
              >
                <Download className="h-4 w-4" /> Descargar PNG para DTF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
