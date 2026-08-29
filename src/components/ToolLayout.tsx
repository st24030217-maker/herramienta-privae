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
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {title}
              </h1>
              <span className="rounded bg-neutral-900 border border-neutral-700 px-2.5 py-0.5 text-xs font-bold text-neutral-200">
                {badge}
              </span>
            </div>
            <p className="mt-1.5 text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              {description}
            </p>
          </div>
          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Cambiar Archivo
            </button>
          )}
        </div>
      </div>

      {/* Controles de Parámetros Adicionales */}
      {renderControls && (
        <div className="mb-6 rounded-2xl border border-neutral-800 bg-neutral-950 p-5">
          {renderControls(originalPreview, setCustomParam, customParams)}
        </div>
      )}

      {/* Mensaje de Error */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-neutral-700 bg-neutral-900 p-4 text-xs sm:text-sm text-white">
          <AlertCircle className="h-5 w-5 text-white shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de 2 Secciones: ENTRADA y RESULTADO */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ================= SECCIÓN 1: ENTRADA ================= */}
        <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-850 pb-3">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              1. ENTRADA (Original)
            </span>
            {imgDimensions && (
              <span className="text-xs font-mono text-neutral-500">
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
              className="flex flex-1 min-h-[340px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-800 bg-black p-8 text-center transition-colors hover:border-white hover:bg-neutral-950"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              />
              <div className="mb-4 rounded-full bg-neutral-900 border border-neutral-800 p-4 text-white">
                <UploadCloud className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-white">
                Arrastra tu imagen aquí o haz clic para buscar
              </h3>
              <p className="mt-1.5 text-xs text-neutral-400 max-w-xs">
                Soporta PNG, JPG, WEBP. Salida certificada a 300 DPI.
              </p>
            </div>
          ) : (
            /* Vista Previa Original */
            <div className="flex flex-1 flex-col justify-between">
              <div className="relative flex min-h-[340px] items-center justify-center rounded-xl bg-transparency-grid p-4 overflow-hidden border border-neutral-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={originalPreview}
                  alt="Original"
                  className="max-h-[380px] max-w-full object-contain rounded drop-shadow-md"
                />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate text-xs text-neutral-300">
                  <FileImage className="h-4 w-4 text-white shrink-0" />
                  <span className="truncate">{file?.name}</span>
                </div>

                <button
                  onClick={handleProcess}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Procesando a 300 DPI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Procesar Imagen
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ================= SECCIÓN 2: RESULTADO ================= */}
        <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-950 p-6">
          <div className="mb-4 flex items-center justify-between border-b border-neutral-850 pb-3">
            <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
              2. RESULTADO (DTF 300 DPI)
            </span>
            {resultUrl && (
              <span className="flex items-center gap-1 text-xs font-bold text-white">
                <CheckCircle2 className="h-3.5 w-3.5" /> Listo para Impresión
              </span>
            )}
          </div>

          <div className="relative flex flex-1 min-h-[340px] items-center justify-center rounded-xl bg-transparency-grid p-4 overflow-hidden border border-neutral-800">
            {loading ? (
              <div className="flex flex-col items-center gap-3 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-sm font-bold text-white">
                  Procesando píxeles en alta fidelidad...
                </p>
                <span className="text-xs text-neutral-400">
                  Asegurando canal alfa RGBA y densidad 300 DPI
                </span>
              </div>
            ) : resultUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={resultUrl}
                alt="Resultado Procesado"
                className="max-h-[380px] max-w-full object-contain rounded drop-shadow-md"
              />
            ) : (
              <div className="text-center text-neutral-600">
                <Sparkles className="mx-auto h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs">
                  Sube tu archivo y haz clic en &ldquo;Procesar Imagen&rdquo; para ver el resultado aquí.
                </p>
              </div>
            )}
          </div>

          {resultUrl && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-neutral-400">
                Salida: PNG Transparente · 300 DPI
              </span>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2 text-xs font-bold text-black hover:bg-neutral-200 transition-all shadow-glow-white"
              >
                <Download className="h-4 w-4" /> Descargar PNG (300 DPI)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
