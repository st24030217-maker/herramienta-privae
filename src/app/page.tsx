import Link from "next/link";
import { 
  Scissors, 
  Sparkles, 
  Pipette, 
  Layers, 
  LayoutGrid, 
  Sliders
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
      spec: "Muestreo Euclidiano",
      desc: "Cuentagotas interactivo para eliminar colores de fondo específicos con control de tolerancia.",
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Barra de Parámetros de Taller */}
      <section className="mb-10 border-b border-[#20232A] pb-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-[#00A3FF]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#00A3FF]"></span>
              <span>MESA DE PREIMPRESIÓN ACTIVA</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F3F4F6]">
              Consola de Preparación DTF
            </h1>
            <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
              Herramientas de taller para calibrar transparencias, densidad de tinta blanca y armar pliegos continuos de impresión textil a 300 DPI reales.
            </p>
          </div>

          {/* Ficha de Calibración Técnica */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-[#8E95A5] bg-[#16181D] border border-[#20232A] px-4 py-2.5 rounded">
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
              <span className="text-[#8E95A5]/60 block text-[10px]">CANAL COLOR</span>
              <span className="text-[#F3F4F6] font-semibold">RGBA + White</span>
            </div>
          </div>
        </div>
      </section>

      {/* ESTACIÓN PRINCIPAL: Armador de Pliegos DTF */}
      <section className="mb-12">
        <div className="rounded-lg border border-[#20232A] bg-[#16181D] p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 px-2 py-0.5 rounded bg-[#00A3FF]/10 font-semibold">
                  ESTACIÓN CENTRAL
                </span>
                <span className="font-mono text-xs text-[#8E95A5]">
                  580 × 1000 mm / 580 × 2000 mm
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
                Armador de Archivos y Pliegos DTF
              </h2>
              <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
                Distribuye múltiples diseños en un lienzo calibrado a escala real. Mide dimensiones en centímetros, verifica advertencias de resolución baja (&lt; 250 DPI) y exporta el PNG maestro a 300 DPI.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-[#8E95A5]">
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Formatos: 58×100 cm y 58×200 cm
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Cálculo de resolución efectiva en vivo
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Salida hasta 6,850 × 23,622 px
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <Link
                href="/tools/dtf-builder"
                className="inline-flex items-center justify-center gap-2 rounded bg-[#F3F4F6] px-5 py-2.5 text-xs font-bold text-[#0D0E11] hover:bg-white transition-colors text-center"
              >
                <LayoutGrid className="h-4 w-4" />
                <span>Armar pliego de 58 cm</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* MÓDULOS DE CALIBRACIÓN Y PRE-PRENSA */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
            Módulos de Calibración y Pre-Prensa
          </h3>
          <span className="font-mono text-xs text-[#8E95A5]/60">
            4 utilidades individuales
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
