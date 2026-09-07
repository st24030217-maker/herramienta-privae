import Link from "next/link";
import { 
  Scissors, 
  Sparkles, 
  Pipette, 
  Layers, 
  LayoutGrid, 
  ScanSearch,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

export default function HomePage() {
  const prepTools = [
    {
      id: "remove-bg",
      name: "Limpieza de Fondo",
      spec: "Canal Alfa RGBA",
      desc: "Aísla el diseño y siluetas principales con recorte nítido y preservación de transparencias reales.",
      href: "/tools/remove-bg",
      icon: Scissors,
      action: "Depurar fondo",
    },
    {
      id: "enhance",
      name: "Interpolación y Nitidez",
      spec: "Salida 300 DPI",
      desc: "Superresolución con algoritmo Lanczos3 y máscara de enfoque para archivos de baja resolución.",
      href: "/tools/enhance",
      icon: Sparkles,
      action: "Escalar archivo",
    },
    {
      id: "remove-color",
      name: "Extracción Cromática",
      spec: "Gotero Interactivo",
      desc: "Cuentagotas interactivo para eliminar fondos o colores específicos con control de tolerancia y suavizado.",
      href: "/tools/remove-color",
      icon: Pipette,
      action: "Seleccionar tono",
    },
    {
      id: "clean-alpha",
      name: "Depuración de Semitransparencias",
      spec: "Control de Tinta Blanca",
      desc: "Purga halos translúcidos para evitar que la impresora DTF genere depósitos irregulares de tinta blanca.",
      href: "/tools/clean-alpha",
      icon: Layers,
      action: "Corregir alfa",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">
      {/* Barra de Parámetros de Taller */}
      <section className="border-b border-[#20232A] pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#00A3FF]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#00A3FF]"></span>
              <span>TALLER DIGITAL DTF ACTIVO</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F4F6]">
              Consola de Preparación Textil DTF
            </h1>
            <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
              Suite integral para auditar archivos, calibrar transparencias, cotizar precios y armar pliegos continuos de impresión textil a 300 DPI reales.
            </p>
          </div>

          {/* Ficha de Calibración Técnica */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8E95A5] bg-[#16181D] border border-[#20232A] px-4 py-2.5 rounded-lg shadow-inner">
            <div>
              <span className="text-[#8E95A5]/60 block text-[10px]">ANCHO BOBINA</span>
              <span className="text-[#F3F4F6] font-semibold">58.0 cm</span>
            </div>
            <div className="h-6 w-px bg-[#20232A]" />
            <div>
              <span className="text-[#8E95A5]/60 block text-[10px]">DENSIDAD</span>
              <span className="text-[#F3F4F6] font-semibold">300 DPI</span>
            </div>
            <div className="h-6 w-px bg-[#20232A]" />
            <div>
              <span className="text-[#8E95A5]/60 block text-[10px]">AUDITORÍA</span>
              <span className="text-[#00A3FF] font-semibold">Score DTF en Vivo</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 1: AUDITORÍA FORENSE DTF (Escáner & Diagnóstico) */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#00A3FF] font-semibold flex items-center gap-2">
            <span>Auditoría de Archivos y Diagnóstico Forense</span>
          </h3>
          <span className="font-mono text-xs text-[#8E95A5]/60">
            Prevención de errores de impresión en bobina
          </span>
        </div>

        {/* Tarjeta Escáner DTF a Ancho Completo */}
        <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-6 lg:p-7 hover:border-[#00A3FF]/40 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#00A3FF]">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Escáner y Auditor de Calidad DTF
                    </h3>
                    <span className="font-mono text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                      SCORE 0-100%
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#8E95A5]">
                    Inspección de canal alfa • Detección de halos de tinta blanca • Medidas a 300 DPI
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#8E95A5] max-w-2xl leading-relaxed">
                Examina tu diseño antes de imprimir. El escáner detecta píxeles semitransparentes que causan acumulación irregular de tinta blanca en el software RIP, verifica si el fondo es 100% transparente y calcula las dimensiones físicas máximas recomendadas sin pérdida de resolución.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/tools/scanner"
                className="inline-flex items-center justify-center gap-2 rounded bg-[#00A3FF] px-6 py-3 text-xs font-bold text-white hover:bg-[#00A3FF]/90 transition-colors shadow-lg font-sans text-center"
              >
                <ScanSearch className="h-4 w-4" />
                <span>Escanear archivo ahora</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: ESTACIÓN CENTRAL: Armador de Pliegos DTF */}
      <section>
        <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 px-2 py-0.5 rounded bg-[#00A3FF]/10 font-semibold">
                  ESTACIÓN CENTRAL DE PRODUCCIÓN
                </span>
                <span className="font-mono text-xs text-[#8E95A5]">
                  580 × 1000 mm / 580 × 2000 mm
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
                Armador de Archivos y Pliegos DTF
              </h2>
              <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
                Distribuye múltiples diseños en un lienzo calibrado con cotas en centímetros reales. Incluye soporte de Drag & Drop directo, presets textiles (Pectoral, A4, A3, Espalda) y exportación en PNG a 300 DPI reales.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-[#8E95A5]">
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Formatos: 58×100 cm y 58×200 cm
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Arrastre directo al lienzo
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Presets textiles estándar (Pectoral, A4, A3)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/tools/dtf-builder"
                className="inline-flex items-center justify-center gap-2 rounded bg-[#F3F4F6] px-5 py-3 text-xs font-bold text-[#0D0E11] hover:bg-white transition-colors text-center shadow-lg"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Armar pliego de 58 cm</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: MÓDULOS DE CALIBRACIÓN Y PRE-PRENSA */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
            Módulos Individuales de Pre-Prensa
          </h3>
          <span className="font-mono text-xs text-[#8E95A5]/60">
            4 utilidades especializadas
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prepTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="flex flex-col justify-between rounded-lg border border-[#20232A] bg-[#16181D] p-5 transition-colors hover:border-[#8E95A5]/40"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded border border-[#20232A] bg-[#0D0E11] text-[#F3F4F6]">
                      <Icon className="h-4 w-4 text-[#00A3FF]" />
                    </div>
                    <span className="font-mono text-[11px] text-[#8E95A5]">
                      {tool.spec}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-[#F3F4F6]">
                    {tool.name}
                  </h4>
                  <p className="mt-2 text-xs text-[#8E95A5] leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#20232A]">
                  <Link
                    href={tool.href}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded border border-[#20232A] bg-[#0D0E11] py-1.5 text-xs font-semibold text-[#F3F4F6] hover:bg-[#20232A] hover:border-[#8E95A5]/40 transition-colors"
                  >
                    <span>{tool.action}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
