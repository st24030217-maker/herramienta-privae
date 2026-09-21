"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ScanSearch, 
  Scissors, 
  Pipette, 
  Layers, 
  Sparkles, 
  LayoutGrid, 
  CheckCircle2, 
  Lightbulb, 
  HelpCircle, 
  ArrowRight, 
  Printer, 
  Shirt, 
  Maximize2, 
  FlipHorizontal, 
  Copy, 
  RotateCw, 
  Grid,
  ShieldCheck,
  AlertTriangle,
  Download,
  Keyboard
} from "lucide-react";

interface StepGuide {
  id: string;
  stepNumber: string;
  title: string;
  shortDesc: string;
  toolName: string;
  toolHref: string;
  badge: string;
  whyImportant: string;
  stepsToFollow: string[];
  workshopTip: string;
  avoidThis: string;
}

const STEPS: StepGuide[] = [
  {
    id: "scanner",
    stepNumber: "01",
    title: "Checar la Calidad de tu Imagen (El Semáforo DTF)",
    shortDesc: "Revisa en segundos si tu archivo está listo para imprimir o si te va a manchar la playera.",
    toolName: "Ir a Checador de Calidad",
    toolHref: "/tools/scanner",
    badge: "Paso Obligatorio",
    whyImportant:
      "Muchos diseños bajados de internet o WhatsApp se ven bonitos en el celular, pero traen fondos blancos fantasmas o sombras difusas. La máquina DTF imprime tinta blanca debajo de todo lo que no sea 100% transparente. Si no lo revisas, saldrá un plastón blanco que arruina la prenda.",
    stepsToFollow: [
      "Arrastra tu diseño al Checador de Calidad.",
      "Espera 3 segundos mientras el semáforo revisa transparencia, sombras lechosas y resolución.",
      "Si sale en Verde (Score > 85), ¡felicidades!, está listo para imprimir.",
      "Si sale en Amarillo o Rojo, el sistema te muestra exactamente el problema y te da un botón para arreglarlo con 1 clic.",
      "Revisa la ficha de 'Tamaño Máximo Recomendado' para saber hasta qué medidas en centímetros puedes agrandarlo sin que se pixele."
    ],
    workshopTip:
      "Fíjate en el porcentaje de 'Sombras Raras'. En DTF las transparencias con degradado suave no se imprimen como en papel: la máquina inyecta polvo poliamida y quedan tiesas al tacto.",
    avoidThis: "Nunca mandes a imprimir un diseño con calificación roja sin antes pasar por el limpiador de bordes o quitafondos."
  },
  {
    id: "remove-bg",
    stepNumber: "02",
    title: "Quitar Fondo sin Recortar a Mano",
    shortDesc: "Elimina fondos de fotos, dibujos o stickers preservando las orillas limpias.",
    toolName: "Ir a Quitar Fondo",
    toolHref: "/tools/remove-bg",
    badge: "Recorte Automático",
    whyImportant:
      "Ahorra horas de estar usando la pluma o la varita mágica en Photoshop. El motor detecta las orillas de tu arte y retira el fondo exterior en alta fidelidad a 300 DPI reales.",
    stepsToFollow: [
      "Arrastra tu archivo (PNG, JPG o WEBP).",
      "Selecciona el tipo de fondo: 'Automático', 'Fondo Blanco' o 'Fondo Negro'.",
      "Elige 'Solo por fuera (Recomendado)' para que respete letras blancas o detalles interiores de tu diseño.",
      "Ajusta la 'Fuerza' (sensibilidad) entre 30% y 40% para fondos limpios.",
      "Pulsa 'Procesar arte' e inspecciónalo con los 3 visores de fondo (cuadrícula, negro y blanco)."
    ],
    workshopTip:
      "Prueba siempre el botón de fondo negro del visor (el círculo negro). Si ves un resplandor blanco alrededor de tu diseño, súbele un poquito a la fuerza o activa el suavizado.",
    avoidThis: "Evita usar modo global si tu diseño tiene tipografía blanca por dentro, porque también te borraría las letras."
  },
  {
    id: "remove-color",
    stepNumber: "03",
    title: "Borrar un Color Específico o Fondos Negros",
    shortDesc: "Ideal cuando tu cliente te manda un logo con fondo negro o blanco y solo quieres el dibujo.",
    toolName: "Ir a Borrar Color",
    toolHref: "/tools/remove-color",
    badge: "Gotero & Atajos Rápidos",
    whyImportant:
      "En playeras negras no necesitas imprimir el fondo negro del diseño, ¡sería un gasto inútil de tinta negra y blanca! Al borrar el color negro, la tela de la playera actúa como fondo natural y el estampado queda suave y fresco.",
    stepsToFollow: [
      "Carga tu imagen en la herramienta.",
      "Usa los botones rápidos: 'Borrar Fondo Negro' (#000000) o 'Borrar Fondo Blanco' (#FFFFFF).",
      "O bien, haz clic con el gotero en cualquier parte de la imagen para seleccionar el color exacto a borrar.",
      "Ajusta la 'Fuerza del Borrado' (Tolerancia) al 30-35% para que no queden orillas mordidas.",
      "Deja marcada la casilla 'Limpiar Flecos en la Orilla' para eliminar el halo del color eliminado."
    ],
    workshopTip:
      "Si vas a estampar en playera negra, quitar el fondo negro reduce el peso del transfer hasta un 70%, haciendo que la prenda sea transpirable y no se sienta como un cartón.",
    avoidThis: "No uses tolerancia mayor al 60% a menos que sea un diseño muy simple, ya que podrías borrar tonos similares del arte principal."
  },
  {
    id: "clean-alpha",
    stepNumber: "04",
    title: "Limpiar Bordes y Base Blanca (El Choke Textil)",
    shortDesc: "El paso maestro de los profesionales para que no se asome la plasta blanca al estampar.",
    toolName: "Ir a Bordes Blancos",
    toolHref: "/tools/clean-alpha",
    badge: "Calidad Forense DTF",
    whyImportant:
      "Al imprimir DTF, la máquina primero tira la tinta de color y luego encima tira una capa blanca de respaldo. Si tu diseño tiene rebabas o píxeles semitransparentes, la base blanca se desborda y al planchar en tela oscura se ve un contorno blanco desalineado y feo.",
    stepsToFollow: [
      "Sube tu PNG ya recortado.",
      "Configura 'Encoger Base Blanca (Choke)' en 1 px o 2 px (Recomendado).",
      "Activa 'Base Blanca Sólida al 100%' para que los colores se vean vivos y no apagados.",
      "Mantén encendido 'Borrar Basuritas y Puntos Sueltos' para eliminar polvo invisible que gasta tinta.",
      "Pulsa 'Procesar arte' y descárgalo listo para impresión."
    ],
    workshopTip:
      "Un choke de 1 px es perfecto para textos finos. Para ilustraciones medianas o grandes en playeras negras, un choke de 2 px te da la garantía total de que no se verá ni un solo milímetro blanco por fuera.",
    avoidThis: "No pongas un choke de más de 3 px en letras muy delgadas porque podrías adelgazar la base blanca más de la cuenta."
  },
  {
    id: "enhance",
    stepNumber: "05",
    title: "+Calidad y Nitidez a 300 DPI Reales",
    shortDesc: "Aumenta la nitidez y el tamaño para que tus estampados salgan nítidos y no borrosos.",
    toolName: "Ir a +Calidad",
    toolHref: "/tools/enhance",
    badge: "Super Resolución",
    whyImportant:
      "La regla de oro del DTF es imprimir a 300 DPI. Una imagen chica de internet (72 DPI) al agrandarse en la tela se verá borrosa y pixelada. Esta herramienta reconstruye los bordes y aumenta la densidad de píxeles.",
    stepsToFollow: [
      "Carga tu diseño.",
      "Elige el multiplicador de tamaño: 2X (Doble), 3X (Mucha nitidez) o 4X (Máxima calidad).",
      "Selecciona el nivel de enfoque: 'Normal' para la mayoría de diseños, o 'Bien definido' para logos con letras.",
      "Si la imagen venía con compresión JPG (grano o pixeles cuadrados), activa 'Quitar Borroso y Pixeles (JPG)'.",
      "Procesa tu arte y obtén un archivo con densidad textil certificada a 300 DPI."
    ],
    workshopTip:
      "Para logos vectoriales convertidos a PNG de baja calidad, el multiplicador 2X o 3X con enfoque 'Bien definido' les devuelve el filo original en minutos.",
    avoidThis: "No intentes escalar una imagen de 50x50 píxeles a tamaño espalda completa; hay límites físicos en imágenes miniatura."
  },
  {
    id: "dtf-builder",
    stepNumber: "06",
    title: "Armar tu Metro de 58 cm (Composición de Pliegos)",
    shortDesc: "Acomoda tus artes en medidas reales, pellizca esquinas, duplica y ahorra película.",
    toolName: "Ir a Armador de Metros",
    toolHref: "/tools/dtf-builder",
    badge: "Listo para Imprenta",
    whyImportant:
      "El ancho estándar del rollo DTF es de 60 cm, pero las orillas no se deben tocar para evitar que los rodillos o cabezales manchen. El ancho real de impresión es de 58 cm. Con este armador puedes acomodar 1 metro o 2 metros exactos sin desperdiciar película.",
    stepsToFollow: [
      "Elige el formato: 58 × 100 cm (1 metro) o 58 × 200 cm (2 metros).",
      "Sube uno o varios diseños listos (PNG con fondo transparente a 300 DPI).",
      "Acomoda tus diseños con el mouse arrastrándolos por el pliego.",
      "Pellizca cualquiera de las 4 esquinas circulares para achicar o agrandar el diseño manteniendo sus medidas proporcionales exactas.",
      "Usa los botones rápidos para medidas de ropa (Pecho 20 cm, Espalda 32 cm, Manga 8 cm, etc.).",
      "Si tu maquilador te pide el pliego invertido, pulsa 'Modo Espejo'.",
      "Pulsa 'Descargar Metro DTF' para obtener tu archivo maestro a 300 DPI listo para el RIP de impresión."
    ],
    workshopTip:
      "Usa el botón 'Llenar Todo el Metro con Copias' (Grid Fill) si vas a imprimir muchas piezas de un mismo diseño. Te las ordena pegaditas dejando 0.8 cm de separación para que puedas cortarlas fácil con tijera.",
    avoidThis: "No pegues los diseños al ras del borde de 58 cm. Deja siempre al menos 0.5 cm de margen de seguridad para que la navaja de corte no muerda el dibujo."
  }
];

const SHORTCUTS = [
  { keys: "Ctrl + V", action: "Pegar imagen directo desde el portapapeles en cualquier herramienta" },
  { keys: "Rueda del Mouse", action: "Acercar (Zoom In) o alejar (Zoom Out) en los visores y en el metro" },
  { keys: "Arrastrar Esquinas", action: "Cambiar tamaño de forma 100% proporcional sin deformar el arte" },
  { keys: "Tirador Redondo Superior", action: "Girar el diseño libremente en el pliego con el mouse" },
  { keys: "Shift + Girar", action: "Ajustar la rotación en pasos exactos de 15° (ej. 45°, 90°, 180°)" },
  { keys: "Supr / Backspace", action: "Borrar el diseño seleccionado actualmente en el metro de trabajo" },
];

const FAQS = [
  {
    q: "¿A qué temperatura y tiempo debo planchar mi DTF en la tela?",
    a: "La regla de oro para la mayoría de películas textiles DTF es: 150°C a 160°C durante 12 a 15 segundos con presión media-alta. Deja enfriar completamente la prenda antes de despegar la película (despegue en frío). Luego dale un segundo planchado de 5 segundos con una hoja de teflón para fijar la textura y sellar los bordes."
  },
  {
    q: "¿Por qué en mi celular se ve transparente pero al imprimir sale un cuadro blanco?",
    a: "Muchos archivos guardados de internet simulan la cuadrícula transparente pintada (falsos PNGs) o traen un canal alfa con sombras al 5% o 10%. En pantalla no se nota, pero la máquina DTF lo detecta como tinta y le echa base blanca sólida. Pásalo siempre primero por el 'Checador de Calidad' o por 'Bordes Blancos'."
  },
  {
    q: "¿Por qué el ancho del metro es de 58 cm y no de 60 cm?",
    a: "Aunque el rollo de film mide 60 cm, las impresoras DTF necesitan 1 cm de margen a cada lado para las pinzas de arrastre y los rodillos de avance. Diseñar a 58 cm te asegura que ningún dibujo se corte ni quede manchado por las ruedas de la máquina."
  },
  {
    q: "¿Qué resolución final entrega la plataforma al descargar?",
    a: "Todas las descargas se procesan a 300 DPI reales con canal alfa RGBA de 32 bits y compresión sin pérdidas. Es el formato estándar de preimpresión que aceptan todos los softwares RIP del mercado (AcroRIP, Cadlink Digital Factory, NeoStampa, Flexi, etc.)."
  },
  {
    q: "¿Tengo que voltear mis diseños en espejo antes de descargar?",
    a: "En Privae puedes activar el botón 'Modo Espejo' en el Armador de Metros para que se descargue ya volteado si imprimes directo. Sin embargo, si tu taller utiliza un software RIP como Digital Factory o AcroRIP, la mayoría de los RIPs ya tienen activada la casilla de espejo automático. Pregúntale a tu maquilador si prefiere recibirlo en espejo o al derecho."
  }
];

export default function GuiaPage() {
  const [activeStepId, setActiveStepId] = useState<string>("scanner");
  const activeStep = STEPS.find((s) => s.id === activeStepId) || STEPS[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* HEADER HERO DEL MANUAL */}
      <div className="rounded-3xl border border-[#20232A] bg-gradient-to-b from-[#16181D] to-[#0D0E11] p-8 sm:p-12 text-center relative overflow-hidden shadow-2xl">
        <div className="mx-auto max-w-3xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-mono font-bold text-white tracking-wider uppercase">
            <BookOpen className="h-4 w-4 text-white" />
            <span>Manual Oficial del Taller • Guía de Primera Vez</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#F3F4F6]">
            Cómo Preparar tus Diseños DTF como un Profesional
          </h1>

          <p className="text-sm sm:text-base text-[#8E95A5] leading-relaxed">
            Sin rollos técnicos ni rodeos: aprende el camino exacto para pasar de una imagen cualquiera a un metro de 58 cm listo para imprimir a 300 DPI, con base blanca calibrada y sin sorpresas en la tela.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-neutral-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> Sin orillas lechosas
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> 300 DPI certificados
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-white" /> Aprovecha todo el metro
            </span>
          </div>
        </div>
      </div>

      {/* RUTA DE 6 PASOS DEL TALLER (SELECTOR INTERACTIVO) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#20232A] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2.5">
              <span>El Flujo de Trabajo en 6 Pasos</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8E95A5] mt-1">
              Sigue estos pasos en orden para que tus metros salgan limpios a la primera.
            </p>
          </div>
          <span className="font-mono text-xs text-neutral-400 bg-[#16181D] border border-[#20232A] px-3 py-1.5 rounded-xl">
            Paso {activeStep.stepNumber} de 06
          </span>
        </div>

        {/* Botonera de Pasos Horizontales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((s) => {
            const isCurrent = s.id === activeStepId;
            return (
              <button
                key={s.id}
                onClick={() => setActiveStepId(s.id)}
                className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all active:scale-95 ${
                  isCurrent
                    ? "border-white bg-white/10 text-white shadow-lg ring-2 ring-white"
                    : "border-[#20232A] bg-[#16181D] text-[#8E95A5] hover:border-white/40 hover:text-[#F3F4F6]"
                }`}
              >
                <span className="font-mono text-xs font-bold block mb-1 opacity-75">
                  PASO {s.stepNumber}
                </span>
                <span className="text-xs font-bold text-[#F3F4F6] line-clamp-1">
                  {s.id === "scanner" && "Checar Calidad"}
                  {s.id === "remove-bg" && "Quitar Fondo"}
                  {s.id === "remove-color" && "Borrar Color"}
                  {s.id === "clean-alpha" && "Bordes Blancos"}
                  {s.id === "enhance" && "+Calidad"}
                  {s.id === "dtf-builder" && "Armar Metro"}
                </span>
              </button>
            );
          })}
        </div>

        {/* DETALLE DEL PASO SELECCIONADO */}
        <div className="rounded-3xl border border-[#20232A] bg-[#16181D] p-6 sm:p-10 shadow-xl space-y-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#20232A] pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-black font-mono font-extrabold text-sm">
                  {activeStep.stepNumber}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeStep.title}
                </h3>
              </div>
              <p className="text-sm text-[#8E95A5] max-w-2xl">
                {activeStep.shortDesc}
              </p>
            </div>

            <Link
              href={activeStep.toolHref}
              className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-200 px-5 py-3 text-xs font-bold text-black transition-all shadow-md active:scale-95 shrink-0"
            >
              <span>{activeStep.toolName}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Columna Izquierda: ¿Por qué importa? y Pasos (7 Cols) */}
            <div className="space-y-6 lg:col-span-7">
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-white" />
                  <span>¿Por qué es importante en el taller?</span>
                </h4>
                <p className="text-sm text-[#8E95A5] leading-relaxed">
                  {activeStep.whyImportant}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                  Instrucciones Paso a Paso:
                </h4>
                <ol className="space-y-2.5 text-sm text-[#F3F4F6]">
                  {activeStep.stepsToFollow.map((stepText, idx) => (
                    <li key={idx} className="flex items-start gap-3 bg-[#0D0E11] p-3 rounded-xl border border-[#20232A]">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#20232A] font-mono text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed text-[#8E95A5]">
                        {stepText}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Columna Derecha: Tips de Taller y Qué Evitar (5 Cols) */}
            <div className="space-y-5 lg:col-span-5">
              {/* Tarjeta de Tip Maestro */}
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5 space-y-2">
                <div className="flex items-center gap-2 text-white font-mono text-xs font-bold">
                  <Lightbulb className="h-4 w-4" />
                  <span>Tip de Taller Privae:</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {activeStep.workshopTip}
                </p>
              </div>

              {/* Tarjeta de Qué Evitar */}
              <div className="rounded-2xl border border-red-500/20 bg-red-950/10 p-5 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-mono text-xs font-bold">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <span>Qué NO debes hacer:</span>
                </div>
                <p className="text-xs text-red-200/80 leading-relaxed">
                  {activeStep.avoidThis}
                </p>
              </div>

              {/* Atajo rápido a la herramienta */}
              <div className="rounded-2xl border border-[#20232A] bg-[#0D0E11] p-5 flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-[#8E95A5] block">HERRAMIENTA</span>
                  <span className="text-xs font-bold text-white">{activeStep.badge}</span>
                </div>
                <Link
                  href={activeStep.toolHref}
                  className="text-xs font-mono text-white underline hover:text-neutral-300"
                >
                  Abrir herramienta →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN DE ATAJOS Y TRUCOS RÁPIDOS */}
      <section className="space-y-5">
        <div className="border-b border-[#20232A] pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-white" />
            <span>Atajos de Teclado y Gestos de Taller</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8E95A5] mt-1">
            Diseñados para que trabajes como rayo en la computadora o con los dedos en tu tablet.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex flex-col justify-between p-5 rounded-2xl border border-[#20232A] bg-[#16181D] space-y-3 shadow-sm hover:border-white/30 transition-colors"
            >
              <kbd className="inline-block px-3 py-1.5 rounded-lg border border-white/20 bg-[#0D0E11] font-mono text-xs font-bold text-white w-fit shadow-inner">
                {sc.keys}
              </kbd>
              <p className="text-xs text-[#8E95A5] leading-relaxed">
                {sc.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES DE TALLER DTF */}
      <section className="space-y-5">
        <div className="border-b border-[#20232A] pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-[#F3F4F6] tracking-tight flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-white" />
            <span>Preguntas Frecuentes de Estampado e Impresión DTF</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#8E95A5] mt-1">
            Lo que todo impresor textil debe saber para que las playeras queden perfectas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[#20232A] bg-[#16181D] p-6 space-y-2.5 shadow-sm"
            >
              <h4 className="text-sm font-bold text-white flex items-start gap-2">
                <span className="font-mono text-xs text-neutral-400 font-bold shrink-0 mt-0.5">P{i+1}.</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-[#8E95A5] leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BANNER CTA INFERIOR */}
      <div className="rounded-3xl border border-white/20 bg-[#16181D] p-8 sm:p-10 text-center space-y-4 shadow-xl">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          ¿Listo para armar tu primer metro?
        </h3>
        <p className="text-xs sm:text-sm text-[#8E95A5] max-w-xl mx-auto">
          Carga tus imágenes recortadas, colócalas en el lienzo de 58 cm, ajusta los tamaños pellizcando las esquinas y descárgalo a 300 DPI en segundos.
        </p>
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/tools/scanner"
            className="inline-flex items-center gap-2 rounded-xl bg-[#20232A] hover:bg-[#2c313a] px-6 py-3 text-xs font-bold text-white transition-all shadow-sm"
          >
            <ScanSearch className="h-4 w-4" /> Checar Calidad Primero
          </Link>
          <Link
            href="/tools/dtf-builder"
            className="inline-flex items-center gap-2 rounded-xl bg-white hover:bg-neutral-200 px-6 py-3 text-xs font-bold text-black transition-all shadow-lg active:scale-95"
          >
            <LayoutGrid className="h-4 w-4" /> Abrir Armador de Metros
          </Link>
        </div>
      </div>
    </div>
  );
}
