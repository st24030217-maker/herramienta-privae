import { 
  Scissors, 
  Sparkles, 
  Pipette, 
  Layers, 
  LayoutGrid, 
  ScanSearch,
  ArrowRight,
} from "lucide-react";
import { CornerButton } from "@/components/ui/corner-button";
import { GlareCard } from "@/components/ui/glare-card";
import { AnimatedContent } from "@/components/AnimatedContent";
import { ToolsShowcaseCarousel } from "@/components/ToolsShowcaseCarousel";

export default function HomePage() {
  const prepTools = [
    {
      id: "remove-bg",
      code: "01",
      name: "Remover Fondo",
      spec: "PNG 300 DPI sin fondo",
      desc: "Elimina de forma automática el fondo de tu imagen y genera un archivo PNG con transparencia limpia listo para uso en DTF.",
      href: "/tools/remove-bg",
      icon: Scissors,
      action: "01 · Remover fondo",
    },
    {
      id: "enhance",
      code: "02",
      name: "Mejorar Calidad / Resolución",
      spec: "Escala 2X/4X · 300 DPI",
      desc: "Incrementa la definición de imágenes con baja calidad para optimizar su nitidez en la impresión física a mínimo 300 DPI.",
      href: "/tools/enhance",
      icon: Sparkles,
      action: "02 · Mejorar calidad",
    },
    {
      id: "remove-color",
      code: "03",
      name: "Eliminar un Color",
      spec: "Gotero + Tolerancia",
      desc: "Selecciona un color específico con el gotero dentro de tu imagen y ajusta el nivel de tolerancia para eliminarlo con precisión.",
      href: "/tools/remove-color",
      icon: Pipette,
      action: "03 · Eliminar color",
    },
    {
      id: "clean-alpha",
      code: "04",
      name: "Quitar Semitransparencias",
      spec: "Opacidad sólida DTF",
      desc: "Corrige bordes difusos y píxeles semitransparentes para evitar manchas blancas y defectos de adhesión de poliamida en DTF.",
      href: "/tools/clean-alpha",
      icon: Layers,
      action: "04 · Quitar semitransparencias",
    },
  ];

  const officialKpis = [
    { value: "05", label: "HERRAMIENTAS", sub: "Flujo DTF completo" },
    { value: "5 DÍAS", label: "PRUEBA GRATIS", sub: "Acceso total al registrarte" },
    { value: "300 DPI", label: "SALIDA MÍNIMA", sub: "PNG sin fondo certificado" },
    { value: "58 CM", label: "ANCHO DTF", sub: "Pliegos de 100 y 200 cm" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8 space-y-12">
      {/* PRESENTACIÓN PRINCIPAL: LÁMPARA + CARRUSEL CIRCULAR 3D GRANDE Y TRANSPARENTE */}
      <section>
        <ToolsShowcaseCarousel />
      </section>

      {/* INDICADORES OFICIALES PRIVAE (SECCIÓN PORTADA PROPUESTA) */}
      <section>
        <AnimatedContent distance={25} delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {officialKpis.map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-xl border border-[#20232A] bg-[#13151A]/80 px-5 py-4 flex flex-col justify-between"
              >
                <span className="font-display text-2xl sm:text-3xl text-white tracking-wider">
                  {kpi.value}
                </span>
                <div className="mt-1">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#F3F4F6]">
                    {kpi.label}
                  </p>
                  <p className="font-mono text-[10px] text-[#8E95A5]">
                    {kpi.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </AnimatedContent>
      </section>

      {/* SECCIÓN: HERRAMIENTA 05 · ARMADOR DE ARCHIVOS DTF */}
      <section>
        <AnimatedContent distance={40} delay={0.15}>
          <GlareCard glareColor="white" className="p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="font-mono text-xs text-white border border-white/20 px-2 py-0.5 rounded bg-white/5 font-semibold">
                    HERRAMIENTA 05 · ARMADOR DE ARCHIVOS DTF
                  </span>
                  <span className="font-mono text-xs text-[#8E95A5]">
                    Formatos 58 × 100 cm y 58 × 200 cm · 300 DPI
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
                  Armador de Pliegos DTF (Bobina de 58 cm)
                </h2>
                <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
                  Sube una o varias imágenes en el mismo lienzo, configura medidas exactas en centímetros, define el margen de separación entre diseños, aplica el acomodo automático para aprovechar el espacio y descarga tu pliego en PNG sin fondo a 300 DPI reales.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-[#8E95A5]">
                  <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                    58 × 100 cm y 58 × 200 cm
                  </span>
                  <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                    Acomodo automático con margen configurable
                  </span>
                  <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                    Duplicar, rotar, escalar y exportar a 300 DPI
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 items-start">
                <CornerButton
                  href="/tools/dtf-builder"
                  variant="white"
                  size="lg"
                  icon={<LayoutGrid className="h-4 w-4 text-[#0D0E11]" />}
                >
                  05 · Abrir Armador DTF
                </CornerButton>
              </div>
            </div>
          </GlareCard>
        </AnimatedContent>
      </section>

      {/* SECCIÓN: HERRAMIENTAS 01 A 04 */}
      <section>
        <AnimatedContent distance={30}>
          <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
              Herramientas de Preparación e Imagen (01 – 04)
            </h3>
            <span className="font-mono text-xs text-[#8E95A5]/60">
              Entrada JPG/PNG/WEBP → Salida PNG sin fondo 300 DPI
            </span>
          </div>
        </AnimatedContent>

        <AnimatedContent distance={40} stagger={0.12} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prepTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <GlareCard
                key={tool.id}
                glareColor="white"
                className="p-5 h-full flex flex-col justify-between"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#20232A] bg-[#0D0E11] text-white">
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-mono text-xs font-bold text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
                          {tool.code}
                        </span>
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
                    <CornerButton
                      href={tool.href}
                      variant="dark"
                      size="sm"
                      className="w-full hover:border-white"
                      wrapperClassName="w-full"
                      icon={<ArrowRight className="h-3.5 w-3.5 text-white" />}
                    >
                      {tool.action}
                    </CornerButton>
                  </div>
                </div>
              </GlareCard>
            );
          })}
        </AnimatedContent>
      </section>

      {/* SECCIÓN COMPLEMENTARIA: ESCÁNER DE CALIDAD DTF */}
      <section>
        <AnimatedContent distance={35} delay={0.2}>
          <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
            <h3 className="font-mono text-xs uppercase tracking-wider text-white font-semibold flex items-center gap-2">
              <span>Diagnóstico Preventivo Pre-Impresión</span>
            </h3>
            <span className="font-mono text-xs text-[#8E95A5]/60">
              Verifica transparencia, semitransparencias y resolución 300 DPI
            </span>
          </div>

          <GlareCard glareColor="white" className="p-6 lg:p-7">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 bg-white/5 text-white">
                    <ScanSearch className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white tracking-tight">
                        Escáner de Calidad DTF
                      </h3>
                      <span className="font-mono text-xs text-white border border-white/30 bg-white/10 px-2 py-0.5 rounded font-bold">
                        CALIFICACIÓN 0-100%
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#8E95A5]">
                      Detecta fondos ocultos • Alerta de píxeles semitransparentes • Calcula medidas a 300 DPI
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#8E95A5] max-w-2xl leading-relaxed">
                  Revisa tu diseño antes de armar tu pliego: confirma que el fondo sea 100% transparente, detecta semitransparencias que provocarían bordes blancos en la prensa y calcula el tamaño máximo en centímetros a 300 DPI.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 items-start">
                <CornerButton
                  href="/tools/scanner"
                  variant="white"
                  size="lg"
                  icon={<ScanSearch className="h-4 w-4 text-[#0D0E11]" />}
                >
                  Escanear diseño
                </CornerButton>
              </div>
            </div>
          </GlareCard>
        </AnimatedContent>
      </section>
    </div>
  );
}
