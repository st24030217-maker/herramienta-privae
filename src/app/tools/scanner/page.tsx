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

    // Escanear automáticamente al cargar
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/process/scan-dtf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "No se pudo completar el análisis forense.");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message || "Error al escanear archivo.");
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-[#20232A] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
                Escáner y Auditor DTF
              </h1>
              <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2.5 py-0.5 rounded">
                SCORE DE PREPARACIÓN DTF
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#8E95A5] max-w-3xl leading-relaxed">
              Audita tus archivos antes de imprimir. Detecta semitransparencias que manchan con tinta blanca, comprueba el canal alfa real y calcula las dimensiones máximas recomendadas a 300 DPI.
            </p>
          </div>

          {file && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-[#8E95A5] hover:text-[#F3F4F6] bg-[#16181D] border border-[#20232A] hover:border-[#8E95A5]/40 px-3 py-1.5 rounded transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Analizar otro diseño
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
            Arrastra aquí el arte a auditar o haz clic para explorar
          </h3>
          <p className="mt-2 text-xs text-[#8E95A5] max-w-md leading-relaxed">
            Analizaremos en milisegundos si tiene canal alfa, halos de tinta blanca, resolución efectiva en cm y te daremos el Score DTF de 0 a 100.
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
                <span>VISTA PREVIA DEL ARTE</span>
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
                  <Maximize2 className="h-3.5 w-3.5 text-[#00A3FF]" /> Capacidad Física a 300 DPI Reales
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
                  Si imprimes a un tamaño mayor a estos centímetros en tu bobina de 58cm, la calidad bajará de 300 DPI y podrá notarse pixelado.
                </p>
              </div>
            )}
          </div>

          {/* Columna Derecha: Score y Diagnóstico Forense (7 Cols) */}
          <div className="space-y-6 lg:col-span-7">
            {loading ? (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-[#20232A] bg-[#16181D] p-8 text-center">
                <Loader2 className="h-10 w-10 animate-spin text-[#00A3FF] mb-3" />
                <h3 className="text-base font-bold text-white">Auditando píxeles y canal alfa...</h3>
                <p className="font-mono text-xs text-[#8E95A5] mt-1">Calculando presencia de tinta blanca y densidad DPI</p>
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
                            ? "Listo para Imprimir DTF"
                            : analysis.status === "warning"
                            ? "Requiere Calibración Previa"
                            : "Atención: No apto para impresión directa"}
                        </span>
                      </div>
                      <h2 className="text-2xl font-bold text-white tracking-tight">
                        Score de Preparación: {analysis.score} / 100
                      </h2>
                      <p className="mt-1 text-xs text-[#8E95A5]">
                        {analysis.status === "ready"
                          ? "El archivo cumple con los estándares de canal alfa, densidad y bordes limpios para impresión textil."
                          : "Se detectaron factores que provocarán desperdicio de tinta o impresión defectuosa en taller si no se corrigen."}
                      </p>
                    </div>

                    <div className="flex items-center justify-center shrink-0">
                      <div className={`flex h-20 w-20 items-center justify-center rounded-full border-4 font-mono font-extrabold text-2xl ${
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
                  <div className="mt-5 pt-4 border-t border-[#20232A]">
                    <div className="flex justify-between font-mono text-[11px] mb-1.5 text-[#8E95A5]">
                      <span>Composición del Arte:</span>
                      <span>{analysis.transparentPercent}% Transparente • {analysis.solidPercent}% Sólido • {analysis.semiPercent}% Semitransparente</span>
                    </div>
                    <div className="flex h-3 w-full overflow-hidden rounded bg-[#0D0E11] border border-[#20232A]">
                      <div
                        style={{ width: `${analysis.transparentPercent}%` }}
                        className="bg-[#20232A]"
                        title={`Transparente: ${analysis.transparentPercent}%`}
                      />
                      <div
                        style={{ width: `${analysis.solidPercent}%` }}
                        className="bg-[#00A3FF]"
                        title={`Sólido: ${analysis.solidPercent}%`}
                      />
                      <div
                        style={{ width: `${analysis.semiPercent}%` }}
                        className="bg-amber-400 animate-pulse"
                        title={`Semitransparente (Riesgo): ${analysis.semiPercent}%`}
                      />
                    </div>
                  </div>
                </div>

                {/* Lista de Hallazgos y Acciones Recomendadas */}
                <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-4">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
                    Diagnóstico Detallado ({analysis.issues.length} observaciones)
                  </h3>

                  {analysis.issues.length === 0 ? (
                    <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200">
                      <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold">¡Tu archivo está perfectamente calibrado!</p>
                        <p className="text-[11px] text-emerald-300/80">Puedes enviarlo directamente al Armador de Pliegos DTF de 58cm.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {analysis.issues.map((issue) => (
                        <div
                          key={issue.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-[#20232A] bg-[#0D0E11] p-4 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`inline-block h-2 w-2 rounded-full ${
                                issue.severity === "high" ? "bg-red-400" : issue.severity === "medium" ? "bg-amber-400" : "bg-[#00A3FF]"
                              }`} />
                              <h4 className="font-bold text-[#F3F4F6]">{issue.title}</h4>
                            </div>
                            <p className="text-[11px] text-[#8E95A5] leading-relaxed max-w-xl">
                              {issue.desc}
                            </p>
                          </div>

                          {issue.toolHref && (
                            <Link
                              href={issue.toolHref}
                              className="inline-flex items-center gap-1.5 rounded bg-[#20232A] px-3 py-1.5 font-mono text-xs font-semibold text-[#00A3FF] hover:bg-[#00A3FF] hover:text-white transition-colors shrink-0"
                            >
                              <span>{issue.toolAction}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Botón Central: Montar en Pliego DTF */}
                  <div className="pt-2 flex justify-end">
                    <Link
                      href="/tools/dtf-builder"
                      className="inline-flex items-center gap-2 rounded bg-[#00A3FF] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors shadow-lg"
                    >
                      <Layers className="h-4 w-4" /> Ir a Armar en Pliego de 58 cm
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
