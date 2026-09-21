"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/components/ui/lamp";
import { CornerButton } from "@/components/ui/corner-button";
import { ScanSearch, LayoutGrid } from "lucide-react";

export default function LampDemo() {
  return (
    <LampContainer>
      <motion.div
        initial={{ opacity: 0.5, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.2,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="flex flex-col items-center text-center max-w-3xl"
      >
        <div className="inline-flex items-center gap-2 mb-3 font-mono text-xs text-[#00A3FF] border border-[#00A3FF]/30 bg-[#00A3FF]/10 px-3 py-1 rounded-full">
          <span className="inline-block h-2 w-2 rounded-full bg-[#00A3FF] animate-pulse"></span>
          <span>TALLER DTF PROFESIONAL • BOBINA 58 CM</span>
        </div>

        <h1 className="bg-gradient-to-b from-white via-[#F3F4F6] to-[#8E95A5] py-2 bg-clip-text text-3xl sm:text-5xl font-extrabold tracking-tight text-transparent">
          Prepara tus Diseños para DTF
        </h1>

        <p className="mt-3 text-xs sm:text-sm text-[#8E95A5] max-w-xl leading-relaxed">
          Todo lo que necesitas para dejar tus archivos listos: quita fondos, sube la calidad a 300 DPI, checa errores antes de estampar y arma tus metros completos sin complicaciones.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <CornerButton
            href="/tools/scanner"
            variant="cyan"
            size="lg"
            icon={<ScanSearch className="h-4 w-4" />}
          >
            Revisar si mi diseño está listo
          </CornerButton>
          <CornerButton
            href="/tools/dtf-builder"
            variant="white"
            size="lg"
            icon={<LayoutGrid className="h-4 w-4 text-[#0D0E11]" />}
          >
            Armar mi metro DTF
          </CornerButton>
        </div>
      </motion.div>
    </LampContainer>
  );
}
