import sharp from "sharp";

export interface EnhanceOptions {
  scaleFactor?: 2 | 3 | 4;
  sharpenLevel?: "none" | "light" | "medium" | "strong";
  denoise?: boolean;
}

/**
 * Superresolución e interpolación de alta precisión para impresión DTF textil.
 * - Interpolación Lanczos3 sin pérdida de geometrías.
 * - Protección estricta de canal alfa para evitar halos negros u oscuros de sobreenfoque en bordes transparentes.
 * - Fijación de densidad a 300 DPI reales.
 */
export async function enhanceImageResolution(
  imageBuffer: Buffer,
  options: EnhanceOptions = {}
): Promise<Buffer> {
  const { scaleFactor = 2, sharpenLevel = "medium", denoise = false } = options;

  let baseImage = sharp(imageBuffer).ensureAlpha();
  const metadata = await baseImage.metadata();

  const originalWidth = metadata.width || 1000;
  const originalHeight = metadata.height || 1000;

  const targetWidth = Math.round(originalWidth * scaleFactor);
  const targetHeight = Math.round(originalHeight * scaleFactor);

  if (denoise) {
    baseImage = baseImage.median(1);
  }

  // Redimensionar con algoritmo Lanczos 3 de alta fidelidad
  const resized = await baseImage
    .resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: "fill",
      withoutEnlargement: false,
      fastShrinkOnLoad: false,
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = resized;
  const totalPixels = info.width * info.height;

  // Separar RGB y Alfa para afilar únicamente los colores sin distorsionar el borde alfa
  const rgbData = Buffer.alloc(totalPixels * 3);
  const alphaData = Buffer.alloc(totalPixels);

  for (let p = 0; p < totalPixels; p++) {
    rgbData[p * 3] = data[p * 4];
    rgbData[p * 3 + 1] = data[p * 4 + 1];
    rgbData[p * 3 + 2] = data[p * 4 + 2];
    alphaData[p] = data[p * 4 + 3];
  }

  let sharpenedRgb = sharp(rgbData, {
    raw: { width: info.width, height: info.height, channels: 3 },
  });

  if (sharpenLevel === "light") {
    sharpenedRgb = sharpenedRgb.sharpen({ sigma: 0.8, m1: 0.5, m2: 0.9, x1: 2, y2: 8 });
  } else if (sharpenLevel === "medium") {
    sharpenedRgb = sharpenedRgb.sharpen({ sigma: 1.2, m1: 0.9, m2: 1.6, x1: 2, y2: 10 });
  } else if (sharpenLevel === "strong") {
    sharpenedRgb = sharpenedRgb.sharpen({ sigma: 1.8, m1: 1.3, m2: 2.3, x1: 3, y2: 12 });
  }

  const sharpRgbBuffer = await sharpenedRgb.raw().toBuffer();

  // Recomponer RGBA 4 canales con alfa limpio sin halos
  const finalRgba = Buffer.alloc(totalPixels * 4);
  for (let p = 0; p < totalPixels; p++) {
    finalRgba[p * 4] = sharpRgbBuffer[p * 3];
    finalRgba[p * 4 + 1] = sharpRgbBuffer[p * 3 + 1];
    finalRgba[p * 4 + 2] = sharpRgbBuffer[p * 3 + 2];
    finalRgba[p * 4 + 3] = alphaData[p];
  }

  return await sharp(finalRgba, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .png({
      compressionLevel: 8,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
