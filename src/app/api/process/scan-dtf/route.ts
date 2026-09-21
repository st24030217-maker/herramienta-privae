import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getCurrentUser } from "@/lib/auth";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser().catch(() => null);
    if (user && !user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Activa tu suscripción para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const image = sharp(buffer);
    const metadata = await image.metadata();

    const width = metadata.width || 0;
    const height = metadata.height || 0;
    const hasAlpha = Boolean(metadata.hasAlpha);
    const density = metadata.density || 72;

    // Dimensiones óptimas físicas a 300 DPI reales
    const widthCmAt300Dpi = parseFloat(((width / 300) * 2.54).toFixed(2));
    const heightCmAt300Dpi = parseFloat(((height / 300) * 2.54).toFixed(2));

    // Análisis de píxeles para auditoría DTF
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    const totalPixels = info.width * info.height;

    let transparentPixels = 0;
    let semiTransparentPixels = 0; // Alpha entre 1 y 250 (causante de halos de tinta blanca en RIP DTF)
    let solidPixels = 0; // Alpha >= 250

    // Analizar esquinas para ver si hay fondo blanco u opaco
    const cornerIndices = [
      0,
      (info.width - 1) * channels,
      (info.width * (info.height - 1)) * channels,
      (info.width * info.height - 1) * channels,
    ];

    let cornersOpaque = 0;
    for (const idx of cornerIndices) {
      if (data[idx + 3] >= 250) {
        cornersOpaque++;
      }
    }

    for (let i = 0; i < data.length; i += channels) {
      const a = data[i + 3];
      if (a === 0) {
        transparentPixels++;
      } else if (a < 250) {
        semiTransparentPixels++;
      } else {
        solidPixels++;
      }
    }

    const semiPercent = parseFloat(((semiTransparentPixels / totalPixels) * 100).toFixed(2));
    const transparentPercent = parseFloat(((transparentPixels / totalPixels) * 100).toFixed(2));
    const solidPercent = parseFloat(((solidPixels / totalPixels) * 100).toFixed(2));

    // Cálculo de Score DTF (0 a 100)
    let score = 100;
    const issues: Array<{ id: string; title: string; desc: string; severity: "high" | "medium" | "low"; toolHref?: string; toolAction?: string }> = [];

    // 1. Verificación de Transparencia
    if (!hasAlpha || transparentPercent < 2) {
      score -= 35;
      issues.push({
        id: "no-alpha",
        title: "Tu imagen tiene fondo (no es transparente)",
        desc: "Tu imagen tiene un fondo sólido (blanco, negro o de color). Si la imprimes así, saldrá un parche cuadrado blanco en la playera.",
        severity: "high",
        toolHref: "/tools/remove-bg",
        toolAction: "Quitar fondo ahora",
      });
    } else if (cornersOpaque >= 3 && transparentPercent < 15) {
      score -= 25;
      issues.push({
        id: "solid-corners",
        title: "Quedaron pedazos de fondo en las esquinas",
        desc: "Las esquinas de tu imagen tienen color. Es muy probable que todavía tenga pedazos de fondo o un marco que debas borrar.",
        severity: "high",
        toolHref: "/tools/remove-bg",
        toolAction: "Borrar esquinas y fondo",
      });
    }

    // 2. Verificación de Semitransparencias (halos de tinta blanca)
    if (semiPercent > 5) {
      score -= 25;
      issues.push({
        id: "high-semi-alpha",
        title: `Cuidado con la tinta blanca (${semiPercent}% de sombras)`,
        desc: "Hay partes medio transparentes. La máquina DTF les pone base blanca y van a salir como plastas lechosas o sucias en la tela.",
        severity: "high",
        toolHref: "/tools/clean-alpha",
        toolAction: "Limpiar bordes y sombras",
      });
    } else if (semiPercent > 1) {
      score -= 10;
      issues.push({
        id: "mild-semi-alpha",
        title: `Bordes con sombras leves (${semiPercent}%)`,
        desc: "Tiene orillas difusas. Conviene limpiarlas para que el contorno quede parejo y nítido.",
        severity: "medium",
        toolHref: "/tools/clean-alpha",
        toolAction: "Limpiar bordes",
      });
    }

    // 3. Verificación de Resolución
    if (width < 1200 || height < 1200) {
      score -= 20;
      issues.push({
        id: "low-resolution",
        title: "Imagen chica para estampar",
        desc: `Tu imagen mide ${width}×${height} px. Para que no se pixelee, lo máximo que da a 300 DPI es ${widthCmAt300Dpi} × ${heightCmAt300Dpi} cm.`,
        severity: "medium",
        toolHref: "/tools/enhance",
        toolAction: "Agrandar y dar nitidez",
      });
    }

    // 4. Verificación de DPI declarado
    if (density < 250) {
      score -= 5;
      issues.push({
        id: "low-dpi-metadata",
        title: `Calibración a 300 DPI recomendada`,
        desc: "Tu archivo no tiene marcada la resolución de 300 DPI para que las máquinas de taller lo lean en automático.",
        severity: "low",
        toolHref: "/tools/enhance",
        toolAction: "Ajustar a 300 DPI",
      });
    }

    score = Math.max(10, Math.min(100, score));

    let status: "ready" | "warning" | "danger" = "ready";
    if (score < 50) status = "danger";
    else if (score < 80) status = "warning";

    return NextResponse.json({
      success: true,
      analysis: {
        fileName: file.name,
        fileSizeMb: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        width,
        height,
        density,
        widthCmAt300Dpi,
        heightCmAt300Dpi,
        hasAlpha,
        transparentPercent,
        semiPercent,
        solidPercent,
        score,
        status,
        issues,
      },
    });
  } catch (error: any) {
    console.error("Error al escanear archivo DTF:", error);
    return NextResponse.json(
      { error: "Error al auditar archivo: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
