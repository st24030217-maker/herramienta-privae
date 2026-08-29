import sharp from "sharp";

/**
 * Elimina un color específico de una imagen RGBA reemplazándolo por transparencia.
 * Soporta tolerancia ajustable (0 - 100) y suavizado de bordes para DTF.
 * Mantiene la salida a 300 DPI.
 */
export async function removeColorFromImage(
  imageBuffer: Buffer,
  targetColor: { r: number; g: number; b: number },
  tolerance: number = 30, // 0 a 100
  smoothness: number = 10   // Rango de transición suave
): Promise<Buffer> {
  // Asegurar que la imagen esté en RGBA
  const image = sharp(imageBuffer).ensureAlpha();
  const metadata = await image.metadata();

  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Tolerancia normalizada a distancia en espacio RGB (máx distancia ~441.67)
  const maxDistance = Math.sqrt(255 * 255 * 3);
  const tolDistance = (tolerance / 100) * maxDistance;
  const smoothDistance = (smoothness / 100) * maxDistance;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue; // Ya es transparente

    // Distancia Euclidiana del color
    const dr = r - targetColor.r;
    const dg = g - targetColor.g;
    const db = b - targetColor.b;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= tolDistance) {
      // Coincide dentro de la tolerancia: totalmente transparente
      data[i + 3] = 0;
    } else if (dist < tolDistance + smoothDistance && smoothDistance > 0) {
      // Zona de transición suave para evitar bordes pixelados
      const factor = (dist - tolDistance) / smoothDistance;
      data[i + 3] = Math.round(a * factor);
    }
  }

  // Generar PNG final a 300 DPI exactos
  return await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
