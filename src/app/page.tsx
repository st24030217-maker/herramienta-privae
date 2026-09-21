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
import { CornerButton } from "@/components/ui/corner-button";
import { GlareCard } from "@/components/ui/glare-card";

import LampDemo from "@/components/lamp-demo";

export default function HomePage() {
  const prepTools = [
    {
      id: "remove-bg",
      name: "Quitar Fondo",
      spec: "Fondo transparente",
      desc: "Borra el fondo de tu imagen sin llevarte las letras blancas ni los detalles de adentro del diseño.",
      href: "/tools/remove-bg",
      icon: Scissors,
      action: "Quitar fondo",
    },
    {
      id: "enhance",
      name: "+Mejorar Calidad",
      spec: "Sube a 300 DPI",
      desc: "Multiplica la nitidez a 2X y 4X para que tus fotos y logos no salgan borrosos ni pixelados en la tela.",
      href: "/tools/enhance",
      icon: Sparkles,
      action: "Mejorar nitidez",
    },
    {
      id: "remove-color",
      name: "Borrar un Color Específico",
      spec: "Con gotero directo",
      desc: "Toca con el gotero cualquier color que te estorbe (fondos negros, rojos o blancos) para volverlo transparente.",
      href: "/tools/remove-color",
      icon: Pipette,
      action: "Borrar color",
    },
    {
      id: "clean-alpha",
      name: "Limpiar Bordes Blancos",
      spec: "Sin manchas de tinta",
      desc: "Elimina sombras transparentes y halos lechosos para que la base blanca no se asome por los lados.",
      href: "/tools/clean-alpha",
      icon: Layers,
      action: "Limpiar bordes",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10">
      {/* HERO CON ANIMACIÓN ACETERNITY LAMP */}
      <section>
        <LampDemo />
      </section>

      {/* Ficha de Calibración Técnica de Taller */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-[#8E95A5] bg-[#16181D] border border-[#20232A] px-6 py-3.5 rounded-xl shadow-inner">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-[#F3F4F6] font-bold">TALLER DTF LISTO:</span>
          <span className="text-[#8E95A5]">Archivos listos para imprimir directo en tela</span>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[#8E95A5]/60 block text-[10px]">ANCHO BOBINA</span>
            <span className="text-[#F3F4F6] font-semibold">58.0 cm</span>
          </div>
          <div className="h-6 w-px bg-[#20232A]" />
          <div>
            <span className="text-[#8E95A5]/60 block text-[10px]">RESOLUCIÓN</span>
            <span className="text-[#F3F4F6] font-semibold">300 DPI</span>
          </div>
          <div className="h-6 w-px bg-[#20232A]" />
          <div>
            <span className="text-[#8E95A5]/60 block text-[10px]">CALIFICACIÓN</span>
            <span className="text-[#00A3FF] font-semibold">Semáforo DTF</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: CHECADOR DE CALIDAD DTF */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#00A3FF] font-semibold flex items-center gap-2">
            <span>Checador de Calidad (Revisión antes de imprimir)</span>
          </h3>
          <span className="font-mono text-xs text-[#8E95A5]/60">
            Evita echar a perder film o desperdiciar tinta
          </span>
        </div>

        {/* Tarjeta Escáner DTF con GlareCard */}
        <GlareCard glareColor="cyan" className="p-6 lg:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#00A3FF]/30 bg-[#00A3FF]/10 text-[#00A3FF]">
                  <ScanSearch className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      Revisar si tu Diseño está Listo para DTF
                    </h3>
                    <span className="font-mono text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 rounded">
                      CALIFICACIÓN 0-100%
                    </span>
                  </div>
                  <span className="font-mono text-xs text-[#8E95A5]">
                    Checa si el fondo es transparente • Alerta de bordes blancos raros • Calcula medidas reales
                  </span>
                </div>
              </div>

              <p className="mt-3 text-xs text-[#8E95A5] max-w-2xl leading-relaxed">
                Sube tu imagen y te decimos de volada si está lista: revisa si el fondo quedó 100% limpio, te avisa si hay manchas que harían salir tinta blanca de más, y te calcula el tamaño máximo en centímetros para que tu estampado se vea clarito y no pixeleado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 items-start">
              <CornerButton
                href="/tools/scanner"
                variant="cyan"
                size="lg"
                icon={<ScanSearch className="h-4 w-4" />}
              >
                Revisar mi diseño ahora
              </CornerButton>
            </div>
          </div>
        </GlareCard>
      </section>

      {/* SECCIÓN 2: ARMADOR DE PLIEGOS */}
      <section>
        <GlareCard glareColor="white" className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 px-2 py-0.5 rounded bg-[#00A3FF]/10 font-semibold">
                  MÓDULO PRINCIPAL
                </span>
                <span className="font-mono text-xs text-[#8E95A5]">
                  Pliegos de 58 × 100 cm y 58 × 200 cm
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight">
                Armar mi Metro DTF (Bobina de 58 cm)
              </h2>
              <p className="mt-2 text-sm text-[#8E95A5] max-w-2xl leading-relaxed">
                Acomoda varios diseños en un solo lienzo de 58 cm de ancho. Arrastra tus imágenes, duplica para llenar el metro con 1 clic, usa medidas estándar para ropa (pecho, espalda, gorras) y descarga tu archivo listo para mandar a la máquina.
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs font-mono text-[#8E95A5]">
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Formatos: 1 metro (58×100 cm) y 2 metros (58×200 cm)
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Arrastra y acomoda libremente
                </span>
                <span className="rounded bg-[#0D0E11] border border-[#20232A] px-2.5 py-1">
                  Medidas listas: Pecho, A4, A3, Espalda, Gorra
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
                Armar mi metro DTF
              </CornerButton>
            </div>
          </div>
        </GlareCard>
      </section>

      {/* SECCIÓN 3: HERRAMIENTAS RÁPIDAS PARA TUS DISEÑOS */}
      <section>
        <div className="mb-4 flex items-center justify-between border-b border-[#20232A] pb-2">
          <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
            Herramientas Rápidas para tus Diseños
          </h3>
          <span className="font-mono text-xs text-[#8E95A5]/60">
            4 opciones para dejar tus archivos al tiro
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {prepTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <GlareCard
                key={tool.id}
                glareColor="cyan"
                className="p-5 h-full flex flex-col justify-between"
              >
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#20232A] bg-[#0D0E11] text-[#F3F4F6]">
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
                    <CornerButton
                      href={tool.href}
                      variant="dark"
                      size="sm"
                      className="w-full"
                      wrapperClassName="w-full"
                      icon={<ArrowRight className="h-3.5 w-3.5 text-[#00A3FF]" />}
                    >
                      {tool.action}
                    </CornerButton>
                  </div>
                </div>
              </GlareCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
