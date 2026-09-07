"use client";

import React, { useState } from "react";
import { 
  Calculator, 
  Copy, 
  Check, 
  DollarSign, 
  Layers, 
  Shirt, 
  TrendingUp, 
  Receipt, 
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function PricingCalculatorPage() {
  // Configuración de Insumos Base
  const [meterCost, setMeterCost] = useState<number>(180); // Costo por metro lineal de 58x100 cm
  const [currency, setCurrency] = useState<string>("MXN ($)");
  
  // Medidas de la estampa
  const [widthCm, setWidthCm] = useState<number>(28);
  const [heightCm, setHeightCm] = useState<number>(38);
  
  // Prenda base
  const [garmentCost, setGarmentCost] = useState<number>(65);
  const [garmentName, setGarmentName] = useState<string>("Playera Cuello Redondo 100% Algodón");
  
  // Costos fijos y operativos por prenda
  const [operationalCost, setOperationalCost] = useState<number>(5); // bolsa, plancha, luz
  const [wasteMarginPercent, setWasteMarginPercent] = useState<number>(5); // 5% merma

  // Pedido
  const [quantity, setQuantity] = useState<number>(25);
  const [profitMargin, setProfitMargin] = useState<number>(60); // 60% margen de ganancia

  const [copied, setCopied] = useState<boolean>(false);

  // Presets de Medidas DTF de Taller
  const presets = [
    { label: "Pectoral / Escudo", w: 10, h: 10 },
    { label: "Pecho Mediano", w: 20, h: 25 },
    { label: "Frente A4", w: 21, h: 29.7 },
    { label: "Frente Grande A3", w: 28, h: 38 },
    { label: "Espalda Completa", w: 32, h: 42 },
    { label: "Manga", w: 8, h: 15 },
    { label: "Gorra / Frente", w: 6, h: 12 },
  ];

  // Presets de Prendas
  const garmentPresets = [
    { name: "Playera Algodón 100%", cost: 65 },
    { name: "Playera Premium Peinada", cost: 95 },
    { name: "Sudadera Hoodie con Capucha", cost: 240 },
    { name: "Gorra Clásica", cost: 45 },
    { name: "Playera Deportiva Dry-Fit", cost: 55 },
    { name: "Solo Pliego DTF (Sin Prenda)", cost: 0 },
  ];

  // Cálculos matemáticos de taller:
  // Área del metro de bobina: 58 cm * 100 cm = 5,800 cm2
  const bobinaAreaCm2 = 58 * 100;
  const costPerCm2 = meterCost / bobinaAreaCm2;
  const stampAreaCm2 = widthCm * heightCm;
  const rawDtfPrintCost = stampAreaCm2 * costPerCm2;
  const dtfPrintCostWithWaste = rawDtfPrintCost * (1 + wasteMarginPercent / 100);

  const totalCostPerUnit = dtfPrintCostWithWaste + garmentCost + operationalCost;
  
  // Precio con margen de ganancia: Costo / (1 - margen) o Costo * (1 + margen)
  const suggestedSalePrice = parseFloat((totalCostPerUnit * (1 + profitMargin / 100)).toFixed(2));
  const profitPerUnit = parseFloat((suggestedSalePrice - totalCostPerUnit).toFixed(2));

  const totalOrderCost = parseFloat((totalCostPerUnit * quantity).toFixed(2));
  const totalOrderRevenue = parseFloat((suggestedSalePrice * quantity).toFixed(2));
  const totalOrderProfit = parseFloat((profitPerUnit * quantity).toFixed(2));

  // Cuántas piezas caben aproximadamente en 1 metro lineal de bobina
  const fitsPerMeter = Math.max(1, Math.floor(bobinaAreaCm2 / (stampAreaCm2 * 1.15)));
  const metersNeededForOrder = (quantity / fitsPerMeter).toFixed(1);

  const handleCopyWhatsApp = () => {
    const text = `*COTIZACIÓN DE ESTAMPADO DTF* 👕✨
*Privae Textil — Taller de Personalización*
----------------------------------------
📌 *Producto:* ${garmentName}
📐 *Tamaño de Estampado:* ${widthCm} × ${heightCm} cm
📦 *Cantidad:* ${quantity} ${quantity === 1 ? "pieza" : "piezas"}
⚡ *Técnica:* Impresión Textil DTF a 300 DPI (Alta Durabilidad)

💵 *Precio Unitario:* $${suggestedSalePrice.toFixed(2)}
💰 *Total del Pedido:* $${totalOrderRevenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
----------------------------------------
✅ *Incluye:* Prenda, estampado DTF full color con blanco concentrado y planchado térmico industrial.
⏱️ *Tiempo estimado de entrega:* 3 a 5 días hábiles.

_¿Deseas confirmar tu pedido para agendar la producción?_`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-[#20232A] pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#F3F4F6] tracking-tight">
                Calculadora de Costos y Precios DTF
              </h1>
              <span className="font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-2.5 py-0.5 rounded">
                COTIZADOR DE TALLER
              </span>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-[#8E95A5] max-w-3xl leading-relaxed">
              Calcula con precisión quirúrgica el costo de impresión por centímetro, prendas, mermas y márgenes de ganancia. Genera cotizaciones profesionales listas para enviar por WhatsApp en 1 clic.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* PARTE IZQUIERDA: PARÁMETROS DE COSTO Y MEDIDAS (7 Cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Medidas de la Estampa */}
          <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5] flex items-center justify-between">
              <span>1. Medidas del Diseño</span>
              <span className="text-[#00A3FF] font-semibold">{stampAreaCm2} cm²</span>
            </h3>

            {/* Presets Rápidos */}
            <div className="flex flex-wrap gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setWidthCm(p.w);
                    setHeightCm(p.h);
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
                    widthCm === p.w && heightCm === p.h
                      ? "border-[#00A3FF] bg-[#00A3FF]/10 text-[#00A3FF] font-semibold"
                      : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:text-[#F3F4F6]"
                  }`}
                >
                  {p.label} ({p.w}×{p.h})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Ancho de Estampa (cm):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  max="58"
                  value={widthCm}
                  onChange={(e) => setWidthCm(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-3 py-2 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Alto de Estampa (cm):
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Math.max(1, parseFloat(e.target.value) || 1))}
                  className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-3 py-2 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Costo de Bobina DTF y Merma */}
          <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
              2. Costos de Impresión DTF (Bobina 58 cm)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Costo por Metro Lineal (58×100 cm):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-[#8E95A5]">$</span>
                  <input
                    type="number"
                    min="1"
                    value={meterCost}
                    onChange={(e) => setMeterCost(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] py-2 pl-7 pr-3 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>
                <span className="font-mono text-[10px] text-[#8E95A5] mt-1 block">
                  Equivale a ${(costPerCm2).toFixed(4)} por cm²
                </span>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Margen de Merma / Desperdicio:
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={wasteMarginPercent}
                    onChange={(e) => setWasteMarginPercent(parseInt(e.target.value) || 0)}
                    className="w-full accent-[#00A3FF] cursor-pointer"
                  />
                  <span className="font-mono text-xs text-[#00A3FF] font-semibold w-10 text-right">
                    {wasteMarginPercent}%
                  </span>
                </div>
                <span className="font-mono text-[10px] text-[#8E95A5] mt-1 block">
                  Tolerancia por cortes y pruebas de taller.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Prenda e Insumos */}
          <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
              3. Prenda Textil y Operación
            </h3>

            {/* Presets Prendas */}
            <div className="flex flex-wrap gap-2">
              {garmentPresets.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => {
                    setGarmentName(g.name);
                    setGarmentCost(g.cost);
                  }}
                  className={`rounded border px-2.5 py-1 text-xs font-mono transition-colors ${
                    garmentName === g.name
                      ? "border-[#00A3FF] bg-[#00A3FF]/10 text-[#00A3FF] font-semibold"
                      : "border-[#20232A] bg-[#0D0E11] text-[#8E95A5] hover:text-[#F3F4F6]"
                  }`}
                >
                  {g.name} (${g.cost})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Costo de Prenda en Blanco:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-[#8E95A5]">$</span>
                  <input
                    type="number"
                    min="0"
                    value={garmentCost}
                    onChange={(e) => setGarmentCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] py-2 pl-7 pr-3 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Gastos Operativos (Planchado, bolsa, luz):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-[#8E95A5]">$</span>
                  <input
                    type="number"
                    min="0"
                    value={operationalCost}
                    onChange={(e) => setOperationalCost(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full rounded border border-[#20232A] bg-[#0D0E11] py-2 pl-7 pr-3 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4. Cantidad y Margen de Ganancia */}
          <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider text-[#8E95A5]">
              4. Volumen y Margen de Ganancia Deseado
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[11px] text-[#8E95A5] mb-1">
                  Cantidad de Prendas:
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded border border-[#20232A] bg-[#0D0E11] px-3 py-2 font-mono text-sm text-white focus:border-[#00A3FF] focus:outline-none"
                />
              </div>

              <div>
                <div className="flex justify-between font-mono text-[11px] mb-1">
                  <span className="text-[#8E95A5]">Margen de Ganancia:</span>
                  <span className="text-[#00A3FF] font-bold">{profitMargin}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="5"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(parseInt(e.target.value) || 10)}
                  className="w-full accent-[#00A3FF] cursor-pointer mt-2"
                />
                <div className="flex justify-between text-[10px] font-mono text-[#8E95A5] mt-1">
                  <span>Mayoreo (30%)</span>
                  <span>Estándar (60%)</span>
                  <span>Menudeo (100%+)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PARTE DERECHA: RESULTADOS, DESGLOSE Y COTIZADOR (5 Cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Tarjeta de Precios Clave */}
          <div className="rounded-xl border border-[#00A3FF]/40 bg-[#16181D] p-6 shadow-2xl space-y-6">
            <div className="border-b border-[#20232A] pb-4">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#00A3FF]">
                PRECIO SUGERIDO AL CLIENTE
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-extrabold text-white tracking-tight">
                  ${suggestedSalePrice.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-[#8E95A5]">por prenda</span>
              </div>
            </div>

            {/* Métricas Unitarias */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="rounded-lg bg-[#0D0E11] p-3 border border-[#20232A]">
                <span className="text-[10px] text-[#8E95A5] block">COSTO DTF</span>
                <span className="text-base font-bold text-[#F3F4F6]">${dtfPrintCostWithWaste.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-[#0D0E11] p-3 border border-[#20232A]">
                <span className="text-[10px] text-[#8E95A5] block">COSTO TOTAL</span>
                <span className="text-base font-bold text-[#F3F4F6]">${totalCostPerUnit.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-[#0D0E11] p-3 border border-[#20232A]">
                <span className="text-[10px] text-[#8E95A5] block">GANANCIA / PZA</span>
                <span className="text-base font-bold text-emerald-400">+${profitPerUnit.toFixed(2)}</span>
              </div>
              <div className="rounded-lg bg-[#0D0E11] p-3 border border-[#20232A]">
                <span className="text-[10px] text-[#8E95A5] block">MARGEN REAL</span>
                <span className="text-base font-bold text-[#00A3FF]">{profitMargin}%</span>
              </div>
            </div>

            {/* Totales del Pedido */}
            <div className="rounded-lg bg-[#0D0E11] p-4 border border-[#20232A] space-y-2 text-xs font-mono">
              <div className="flex justify-between text-[#8E95A5]">
                <span>Volumen de pedido:</span>
                <strong className="text-white">{quantity} piezas</strong>
              </div>
              <div className="flex justify-between text-[#8E95A5]">
                <span>Metros de bobina estimados:</span>
                <strong className="text-white">~{metersNeededForOrder} metros</strong>
              </div>
              <div className="flex justify-between text-[#8E95A5]">
                <span>Inversión en producción:</span>
                <strong className="text-white">${totalOrderCost.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between text-[#8E95A5]">
                <span>Total Facturado:</span>
                <strong className="text-white">${totalOrderRevenue.toLocaleString()}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#20232A] text-sm">
                <span className="text-emerald-400 font-bold">UTILIDAD NETA TOTAL:</span>
                <span className="text-emerald-400 font-extrabold text-base">
                  +${totalOrderProfit.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Botón Copiar Cotización WhatsApp */}
            <button
              onClick={handleCopyWhatsApp}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 px-4 py-3 text-xs font-bold text-black transition-all shadow-lg font-sans"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-black" /> ¡Cotización Copiada al Portapapeles!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 text-black" /> Copiar Cotización para WhatsApp
                </>
              )}
            </button>
          </div>

          {/* Tips de Taller DTF */}
          <div className="rounded-xl border border-[#20232A] bg-[#16181D] p-5 text-xs text-[#8E95A5] space-y-2 leading-relaxed">
            <h4 className="font-bold text-[#F3F4F6] flex items-center gap-1.5 font-mono text-[11px] uppercase">
              <Sparkles className="h-3.5 w-3.5 text-[#00A3FF]" /> Reglas de Taller para Mayoreo
            </h4>
            <p>
              • En pedidos de más de 50 piezas, puedes reducir el margen a 35% - 40% para cerrar ventas grandes manteniendo excelente rentabilidad.
            </p>
            <p>
              • Optimiza el acomodo en el <strong>Armador de Pliegos de 58 cm</strong> para colocar escudos o mangas en los huecos sobrantes y reducir el costo por estampa a casi cero.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
