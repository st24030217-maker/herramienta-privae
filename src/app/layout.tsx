import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Privae Textil - Herramientas Profesionales de Preparación de Imágenes y DTF",
  description:
    "Plataforma web de procesamiento de imágenes y armado de archivos DTF a 300 DPI con transparencia real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="flex min-h-screen flex-col bg-[#0D0E11] text-[#F3F4F6] antialiased selection:bg-[#00A3FF]/30 selection:text-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-[#20232A] bg-[#16181D] py-5 text-xs text-[#8E95A5]">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#F3F4F6]">Privae Textil</span>
              <span>—</span>
              <span>Consola de Preparación y Salida DTF</span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px] text-[#8E95A5]">
              <span>300 DPI CERTIFICADO</span>
              <span>ANCHO 580 MM</span>
              <span>CANAL RGBA ALFA</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
