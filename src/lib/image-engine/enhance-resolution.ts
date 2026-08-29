import sharp from "sharp";

export interface EnhanceOptions {
  scaleFactor?: 2 | 4;
  sharpenLevel?: "light" | "medium" | "strong";
  denoise?: boolean;
}

/**
 * Mejora la nitidez, resolución y definición de imágenes para impresión DTF.
 * Conserva transparencia y genera salida a 300 DPI.
 */
export async function enhanceImageResolution(
  imageBuffer: Buffer,
  options: EnhanceOptions = {}
): Promise<Buffer> {
  const { scaleFactor = 2, sharpenLevel = "medium", denoise = false } = options;

  let image = sharp(imageBuffer).ensureAlpha();
  const metadata = await image.metadata();

  const originalWidth = metadata.width || 1000;
  const originalHeight = metadata.height || 1000;

  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeight = Math.round(originalHeight * scaleFactor);

  // Redimensionar con filtro Lanczos 3 (máxima fidelidad de bordes)
  image = image.resize(targetWidth, targetHeight, {
    kernel: sharp.kernel.lanczos3,
    fit: "fill",
    withoutEnlargement: false,
  });

  // Configuración de Unsharp Masking según nivel seleccionado
  if (sharpenLevel === "light") {
    image = image.sharpen({ sigma: 1.0, m1: 0.5, m2: 1.0, x1: 2, y2: 10 });
  } else if (sharpenLevel === "medium") {
    image = image.sharpen({ sigma: 1.5, m1: 1.0, m2: 2.0, x1: 2, y2: 10 });
  } else if (sharpenLevel === "strong") {
    image = image.sharpen({ sigma: 2.0, m1: 1.5, m2: 3.0, x1: 2, y2: 15 });
  }

  if (denoise) {
    image = image.median(1);
  }

  // Exportar en PNG con canal alfa y 300 DPI fijados
  return await image
    .png({
      compressionLevel: 8,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
