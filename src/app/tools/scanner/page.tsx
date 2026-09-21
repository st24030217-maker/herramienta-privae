"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { 
  ScanSearch, 
  UploadCloud, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  ArrowRight, 
  RefreshCw, 
  Loader2, 
  ShieldCheck, 
  Layers, 
  Sparkles,
  Maximize2
} from "lucide-react";

interface DtfAnalysis {
  fileName: string;
  fileSizeMb: number;
  width: number;
  height: number;
  density: number;
  widthCmAt300Dpi: number;
  heightCmAt300Dpi: number;
  hasAlpha: boolean;
  transparentPercent: number;
  semiPercent: number;
  solidPercent: number;
  score: number;
  status: "ready" | "warning" | "danger";
  issues: Array<{
    id: string;
    title: string;
    desc: string;
    severity: "high" | "medium" | "low";
    toolHref?: string;
    toolAction?: string;
  }>;
}

export default function DtfScannerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<DtfAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analizador client-side ultra-rápido para soportar archivos de cualquier tamaño sin límite de Vercel (4.5 MB)
  const scanImageClientSide = async (selectedFile: File, imgUrl: string): Promise<DtfAnalysis> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          const widthCmAt300Dpi = parseFloat(((width / 300) * 2.54).toFixed(2));
          const heightCmAt300Dpi = parseFloat(((height / 300) * 2.54).toFixed(2));

          const maxSampleDim = 1200;
          let sampleWidth = width;
          let sampleHeight = height;
          if (width > maxSampleDim || height > maxSampleDim) {
            const ratio = Math.min(maxSampleDim / width, maxSampleDim / height);
            sampleWidth = Math.round(width * ratio);
            sampleHeight = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");
          canvas.width = sampleWidth;
          canvas.height = sampleHeight;
          const ctx = canvas.getContext("2d", { willReadFrequently: true });
          if (!ctx) {
            throw new Error("No se pudo inicializar el motor de escaneo en el navegador.");
          }

          ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
          const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
          const data = imgData.data;
          const totalPixels = sampleWidth * sampleHeight;

          let transparentPixels = 0;
          let semiTransparentPixels = 0;
          let solidPixels = 0;

          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a === 0) {
              transparentPixels++;
            } else if (a < 250) {
              semiTransparentPixels++;
            } else {
              solidPixels++;
            }
          }

          const cornerCoords = [
            [0, 0],
            [sampleWidth - 1, 0],
            [0, sampleHeight - 1],
            [sampleWidth - 1, sampleHeight - 1],
          ];

          let cornersOpaque = 0;
          for (const [cx, cy] of cornerCoords) {
            const idx = (cy * sampleWidth + cx) * 4;
            if (data[idx + 3] >= 250) {
              cornersOpaque++;
            }
          }

          const semiPercent = parseFloat(((semiTransparentPixels / totalPixels) * 100).toFixed(2));
          const transparentPercent = parseFloat(((transparentPixels / totalPixels) * 100).toFixed(2));
          const solidPercent = parseFloat(((solidPixels / totalPixels) * 100).toFixed(2));
          const hasAlpha = transparentPercent > 0.5 || semiPercent > 0.5;

          let score = 100;
          const issues: DtfAnalysis["issues"] = [];

          if (!hasAlpha || transparentPercent < 2) {
            score -= 35;
            issues.push({
              id: "no-alpha",
              title: "Tu imagen tiene fondo (no es transparente)",
              desc: "Tu imagen tiene un fondo sólido (blanco, negro o de color). Si la imprimes así, saldrá un parche cuadrado blanco en la playera.",
              severity: "high",
              toolHref: "/tools/remove-bg",
              toolAction: "Quitar fondo ahora",
            });
          } else if (cornersOpaque >= 3 && transparentPercent < 15) {
            score -= 25;
            issues.push({
              id: "solid-corners",
              title: "Quedaron pedazos de fondo en las esquinas",
              desc: "Las esquinas de tu imagen tienen color. Es muy probable que todavía tenga pedazos de fondo o un marco que debas borrar.",
              severity: "high",
              toolHref: "/tools/remove-bg",
              toolAction: "Borrar esquinas y fondo",
            });
          }

          if (semiPercent > 5) {
            score -= 25;
            issues.push({
              id: "high-semi-alpha",
              title: `Cuidado con la tinta blanca (${semiPercent}% de sombras)`,
              desc: "Hay partes medio transparentes. La máquina DTF les pone base blanca y van a salir como plastas lechosas o sucias en la tela.",
              severity: "high",
              toolHref: "/tools/clean-alpha",
              toolAction: "Limpiar bordes y sombras",
            });
          } else if (semiPercent > 1) {
            score -= 10;
            issues.push({
              id: "mild-semi-alpha",
              title: `Bordes con sombras leves (${semiPercent}%)`,
              desc: "Tiene orillas difusas. Conviene limpiarlas para que el contorno quede parejo y nítido.",
              severity: "medium",
              toolHref: "/tools/clean-alpha",
              toolAction: "Limpiar bordes",
            });
          }

          if (width < 1200 || height < 1200) {
            score -= 20;
            issues.push({
              id: "low-resolution",
              title: "Imagen chica para estampar",
              desc: `Tu imagen mide ${width}×${height} px. Para que no se pixelee, lo máximo que da a 300 DPI es ${widthCmAt300Dpi} × ${heightCmAt300Dpi} cm.`,
              severity: "medium",
              toolHref: "/tools/enhance",
              toolAction: "Agrandar y dar nitidez",
            });
          }

          score = Math.max(10, Math.min(100, score));
          let status: "ready" | "warning" | "danger" = "ready";
          if (score < 50) status = "danger";
          else if (score < 80) status = "warning";

          resolve({
            fileName: selectedFile.name,
            fileSizeMb: parseFloat((selectedFile.size / (1024 * 1024)).toFixed(2)),
            width,
            height,
            density: 300,
            widthCmAt300Dpi,
            heightCmAt300Dpi,
            hasAlpha,
            transparentPercent,
            semiPercent,
            solidPercent,
            score,
            status,
            issues,
          });
        } catch (err: any) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error("No se pudo cargar la imagen para su análisis."));
      img.src = imgUrl;
    });
  };

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile.type.startsWith("image/")) {
      setError("Por favor sube un archivo de imagen (PNG, JPG, WEBP, etc.)");
      return;
    }
    setError(null);
    setFile(selectedFile);
    setAnalysis(null);

    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);

    setLoading(true);
    try {
      // Si el archivo supera 4 MB, usamos el analizador client-side de inmediato
      // para evitar chocar con el límite de Vercel Serverless (4.5 MB)
      if (selectedFile.size > 4 * 1024 * 1024) {
        const clientAnalysis = await scanImageClientSide(selectedFile, url);
        setAnalysis(clientAnalysis);
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/process/scan-dtf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        // Si el servidor falla (ej: 413 Payload Too Large de Vercel), fallback automático client-side
        const clientAnalysis = await scanImageClientSide(selectedFile, url);
        setAnalysis(clientAnalysis);
        return;
      }

      const data = await res.json();
      setAnalysis(data.analysis);
    } catch {
      // Fallback seguro client-side ante cualquier falla de red o formato
      try {
        const clientAnalysis = await scanImageClientSide(selectedFile, url);
        setAnalysis(clientAnalysis);
      } catch (err: any) {
        setError(err.message || "Error al escanear archivo.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setAnalysis(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFixIssue = (href: string) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          sessionStorage.setItem("privae_pending_file_data", reader.result as string);
          sessionStorage.setItem("privae_pending_file_name", file.name);
          sessionStorage.setItem("privae_pending_file_type", file.type);
        } catch {}
        window.location.href = href;
      };
      reader.readAsDataURL(file);
    } else {
      window.location.href = href;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-[#20232A] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
                Checador de Calidad DTF
              </h1>
              <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2.5 py-0.5 rounded">
                ESTADO DE TU DISEÑO
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#8E95A5] max-w-3xl leading-relaxed">
              Revisa de volada si tu diseño está listo para imprimir o si tiene problemas: fondos sin quitar, sombras que manchan con tinta blanca o baja calidad.
            </p>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-[#F3F4F6] bg-[#16181D] border border-[#20232A] hover:border-[#8E95A5]/40 px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Checar otro diseño
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-xs sm:text-sm text-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-300 hover:text-white">✕</button>
        </div>
      )}

      {/* Zona de Drop o Vista de Análisis */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex min-h-[380px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            isDragging
              ? "border-[#00A3FF] bg-[#00A3FF]/10 scale-[0.99]"
              : "border-[#20232A] bg-[#16181D] hover:border-[#00A3FF]/60 hover:bg-[#12141A]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
          />
          <div className="mb-4 rounded-xl border border-[#20232A] bg-[#0D0E11] p-4 text-[#00A3FF] shadow-inner">
            <ScanSearch className="h-10 w-10" />
          </div>
          <h3 className="text-base font-bold text-[#F3F4F6]">
            Arrastra aquí tu diseño o haz clic para checarlo
          </h3>
          <p className="mt-2 text-xs text-[#8E95A5] max-w-md leading-relaxed">
            Te diremos en segundos si está listo para imprimir, a qué tamaño rinde a 300 DPI y cómo arreglarlo con 1 clic.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded bg-[#20232A] px-3 py-1 font-mono text-[11px] text-[#8E95A5]">
            <span>Admite PNG, JPG, WEBP</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Columna Izquierda: Vista Previa y Ficha Técnica (5 Cols) */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5">
              <div className="mb-3 flex items-center justify-between border-b border-[#20232A] pb-2 font-mono text-xs text-[#8E95A5]">
                <span>TU DISEÑO</span>
                <span>{analysis?.fileSizeMb || (file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              <div className="relative flex min-h-[300px] max-h-[380px] items-center justify-center rounded-lg bg-transparency-grid p-4 overflow-hidden border border-[#20232A]">
                {previewUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={previewUrl}
                    alt="Arte escaneado"
                    className="max-h-[340px] max-w-full object-contain rounded"
                  />
                )}
              </div>

              <div className="mt-4 font-mono text-xs text-[#8E95A5] truncate">
                <span className="text-[#F3F4F6] font-semibold block truncate">{file.name}</span>
                {analysis && (
                  <span className="text-[11px]">
                    {analysis.width} × {analysis.height} px • {analysis.density} DPI nativos
                  </span>
                )}
              </div>
            </div>

            {/* Ficha de Capacidad Textil a 300 DPI */}
            {analysis && (
              <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-3">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5] flex items-center gap-1.5">
                  <Maximize2 className="h-3.5 w-3.5 text-[#00A3FF]" /> Tamaño Máximo Recomendado (300 DPI)
                </h3>

                <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#0D0E11] p-3 border border-[#20232A] text-xs font-mono">
                  <div>
                    <span className="text-[#8E95A5] block text-[10px]">ANCHO MÁXIMO</span>
                    <span className="text-base font-bold text-[#F3F4F6]">{analysis.widthCmAt300Dpi} cm</span>
                  </div>
                  <div>
                    <span className="text-[#8E95A5] block text-[10px]">ALTO MÁXIMO</span>
                    <span className="text-base font-bold text-[#F3F4F6]">{analysis.heightCmAt300Dpi} cm</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8E95A5] leading-relaxed">
                  Si lo imprimes más grande que estas medidas en tu metro de 58 cm, se va a empezar a ver pixelado o borroso.
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Score y Diagnóstico Forense (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            {loading ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[#20232A] bg-[#16181D] p-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#00A3FF] mb-3" />
                <h3 className="text-base font-bold text-white">Revisando tu imagen...</h3>
                <p className="font-mono text-xs text-[#8E95A5] mt-1">Buscando fondos, sombras y midiendo la nitidez</p>
              </div>
            ) : analysis ? (
              <>
                {/* Tarjeta de Score DTF */}
                <div className={`rounded-xl border p-6 ${
                  analysis.status === "ready"
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : analysis.status === "warning"
                    ? "border-amber-500/30 bg-amber-950/10"
                    : "border-red-500/30 bg-red-950/10"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {analysis.status === "ready" ? (
                          <ShieldCheck className="h-5 w-5 text-emerald-400" />
                        ) : analysis.status === "warning" ? (
                          <AlertTriangle className="h-5 w-5 text-amber-400" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-400" />
                        )}
                        <span className={`font-mono text-xs font-bold uppercase tracking-wider ${
                          analysis.status === "ready" ? "text-emerald-400" : analysis.status === "warning" ? "text-amber-400" : "text-red-400"
                        }`}>
                          {analysis.status === "ready"
                            ? "¡Listo para Imprimir!"
                            : analysis.status === "warning"
                            ? "Ojo: Necesita unos Arreglos"
                            : "Cuidado: No lo imprimas así"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Calificación de tu Diseño: {analysis.score} de 100
                      </h2>
                      <p className="mt-1 text-xs text-[#8E95A5]">
                        {analysis.status === "ready"
                          ? "Tu imagen no tiene fondos raros, no manchará con tinta blanca y saldrá nítida en la tela."
                          : "Tu diseño tiene detalles que pueden arruinar tu playera o gastar tinta blanca innecesaria."}
                      </p>
                    </div>

                    <div className="flex items-center justify-center shrink-0">
                      <div className={`flex h-24 w-24 items-center justify-center rounded-2xl border-4 font-mono font-black text-3xl shadow-lg ${
                        analysis.status === "ready"
                          ? "border-emerald-500 text-emerald-300 bg-emerald-500/10"
                          : analysis.status === "warning"
                          ? "border-amber-500 text-amber-300 bg-amber-500/10"
                          : "border-red-500 text-red-300 bg-red-500/10"
                      }`}>
                        {analysis.score}%
                      </div>
                    </div>
                  </div>

                  {/* Barra de Distribución de Píxeles */}
                  <div className="mt-6 pt-5 border-t border-[#20232A]">
                    <div className="flex justify-between font-mono text-xs mb-2 text-[#8E95A5]">
                      <span>¿De qué está hecha tu imagen?</span>
                      <span>{analysis.transparentPercent}% Fondo Libre • {analysis.solidPercent}% Color Firme • {analysis.semiPercent}% Sombras Raras</span>
                    </div>
                    <div className="flex h-3.5 w-full overflow-hidden rounded-lg bg-[#0D0E11] border border-[#20232A]">
                      <div
                        style={{ width: `${analysis.transparentPercent}%` }}
                        className="bg-[#20232A]"
                        title={`Fondo libre: ${analysis.transparentPercent}%`}
                      />
                      <div
                        style={{ width: `${analysis.solidPercent}%` }}
                        className="bg-[#00A3FF]"
                        title={`Color firme: ${analysis.solidPercent}%`}
                      />
                      <div
                        style={{ width: `${analysis.semiPercent}%` }}
                        className="bg-amber-400 animate-pulse"
                        title={`Sombras raras (Riesgo): ${analysis.semiPercent}%`}
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de Hallazgos y Acciones Recomendadas */}
                <div className="rounded-2xl border border-[#20232A] bg-[#16181D] p-6 space-y-5 shadow-sm">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5] font-bold">
                    ¿Qué le encontramos a tu diseño? ({analysis.issues.length} detalles)
                  </h3>

                  {analysis.issues.length === 0 ? (
                    <div className="flex items-center gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-sm text-emerald-200">
                      <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-base text-white">¡Tu diseño está al tiro para estampar!</p>
                        <p className="text-xs text-emerald-300/80 mt-0.5">Pásalo directo a armar tus metros de 58 cm.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {analysis.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-[#20232A] bg-[#0D0E11] p-5 text-xs hover:border-[#8E95A5]/40 transition-all"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2.5 w-2.5 rounded-full ${
                                issue.severity === "high" ? "bg-red-400" : issue.severity === "medium" ? "bg-amber-400" : "bg-[#00A3FF]"
                              }`} />
                              <h4 className="font-bold text-sm text-[#F3F4F6]">{issue.title}</h4>
                            </div>
                            <p className="text-xs text-[#8E95A5] leading-relaxed max-w-xl">
                              {issue.desc}
                            </p>
                          </div>

                          {issue.toolHref && (
                            <button
                              type="button"
                              onClick={() => handleFixIssue(issue.toolHref!)}
                              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00A3FF]/15 border border-[#00A3FF]/40 px-4 py-2.5 font-mono text-xs font-bold text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white transition-all shrink-0 shadow-sm active:scale-95"
                              title="Arregla esta imagen en 1 clic"
                            >
                              <span>{issue.toolAction}</span>
                              <ArrowRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón Central: Montar en Pliego DTF */}
                  <div className="pt-3 border-t border-[#20232A] flex justify-end">
                    <Link
                      href="/tools/dtf-builder"
                      className="inline-flex items-center gap-2.5 rounded-xl bg-[#00A3FF] hover:bg-[#00A3FF]/90 px-7 py-3 text-sm font-bold text-white transition-all shadow-lg active:scale-95 font-sans"
                    >
                      <Layers className="h-5 w-5" />
                      <span>Armar en Metro de 58 cm</span>
                    </Link>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
