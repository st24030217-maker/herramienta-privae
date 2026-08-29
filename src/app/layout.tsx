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
      <body className="flex min-h-screen flex-col bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-850 bg-slate-950 py-6 text-center text-xs text-slate-500">
          <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              © 2026 <strong>Privae Textil</strong> · Todos los derechos reservados.
            </div>
            <div className="flex gap-4">
              <span className="text-slate-400">Salida Certificada 300 DPI</span>
              <span>·</span>
              <span className="text-slate-400">Canal Alfa RGBA</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
