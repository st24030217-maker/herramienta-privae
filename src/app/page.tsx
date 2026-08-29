import Link from "next/link";
import { 
  Scissors, 
  Sparkles, 
  Pipette, 
  Layers, 
  LayoutGrid, 
  Check, 
  ArrowRight, 
  Zap
} from "lucide-react";

export default function HomePage() {
  const tools = [
    {
      id: "remove-bg",
      num: "01",
      name: "Remover Fondo",
      desc: "Elimina el fondo detectando sujetos principales con bordes limpios, cabello y formas complejas.",
      badge: "Transparencia Pura",
      href: "/tools/remove-bg",
      icon: Scissors,
    },
    {
      id: "enhance",
      num: "02",
      name: "Mejorar Calidad / Resolución",
      desc: "Aumenta la nitidez, definición y resolución sin deformar el diseño. Salida lista a 300 DPI.",
      badge: "Super Resolución",
      href: "/tools/enhance",
      icon: Sparkles,
    },
    {
      id: "remove-color",
      num: "03",
      name: "Eliminar un Color",
      desc: "Cuentagotas interactivo para retirar cualquier color específico con tolerancia ajustable en tiempo real.",
      badge: "Cuentagotas",
      href: "/tools/remove-color",
      icon: Pipette,
    },
    {
      id: "clean-alpha",
      num: "04",
      name: "Quitar Semitransparencias",
      desc: "Corrige el canal alfa para DTF evitando halos o manchas translúcidas que dañan la impresión.",
      badge: "Especial DTF",
      href: "/tools/clean-alpha",
      icon: Layers,
    },
    {
      id: "dtf-builder",
      num: "05",
      name: "Armador de Archivos DTF",
      desc: "Lienzo a escala en 58×100 cm y 58×200 cm. Acomoda múltiples PNG, escala con medidas en cm y exporta a 300 DPI.",
      badge: "Lienzo 58 cm",
      href: "/tools/dtf-builder",
      icon: LayoutGrid,
      featured: true,
    },
  ];

  return (
    <div className="relative overflow-hidden bg-black text-white">
      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3.5 py-1 text-xs font-bold text-neutral-200 mb-6">
          <Zap className="h-3.5 w-3.5 text-white" /> PLATAFORMA OFICIAL PRIVAE TEXTIL
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto uppercase">
          Preparación de Archivos e Impresión <span className="underline decoration-white underline-offset-8">DTF</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
          Optimiza, limpia y arma tus archivos en minutos. Salida certificada a <strong>300 DPI</strong>, canal alfa real RGBA y dimensiones físicas exactas de <strong>58 cm</strong>.
        </p>

        {/* Badges de Garantía */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-neutral-300">
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5">
            <Check className="h-4 w-4 text-white" /> Salida Mínima 300 DPI
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5">
            <Check className="h-4 w-4 text-white" /> Ancho DTF Exacto 58 cm
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-1.5">
            <Check className="h-4 w-4 text-white" /> 5 Días de Prueba Gratis
          </div>
        </div>
      </section>

      {/* Grid de las 5 Herramientas */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between border-b border-neutral-850 pb-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400">
            5 Módulos Especializados
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={`group relative flex flex-col justify-between rounded-2xl border p-6 transition-all hover:border-white hover:-translate-y-1 ${
                  tool.featured
                    ? "border-neutral-700 bg-neutral-950 md:col-span-2 lg:col-span-2 shadow-glow-subtle"
                    : "border-neutral-850 bg-black"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-xl border border-neutral-700 bg-neutral-900 p-3 text-white">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-neutral-500">
                        {tool.num}
                      </span>
                      <span className="rounded bg-neutral-900 border border-neutral-800 px-2 py-0.5 text-[10px] font-bold text-neutral-300">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-black text-white group-hover:underline">
                    {tool.name}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-1 text-xs font-bold text-white group-hover:translate-x-1 transition-transform">
                  <span>Abrir Herramienta</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
