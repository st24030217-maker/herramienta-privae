import sharp from "sharp";

/**
 * Elimina un color específico de una imagen RGBA reemplazándolo por transparencia limpia para DTF.
 * Utiliza distancia cromática perceptual ponderada (2R + 4G + 3B) y transición suave antialias
 * para contornos sin escalonado. Limpia residuos RGB en píxeles transparentes.
 */
export async function removeColorFromImage(
  imageBuffer: Buffer,
  targetColor: { r: number; g: number; b: number },
  tolerance: number = 30, // 0 a 100
  smoothness: number = 10   // Rango de transición suave
): Promise<Buffer> {
  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  // Distancia máxima perceptual en espacio ponderado
  const maxDistance = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const tolDistance = (tolerance / 100) * maxDistance;
  const smoothDistance = (smoothness / 100) * maxDistance;

  for (let i = 0; i < data.length; i += channels) {
    const a = data[i + 3];
    if (a === 0) continue;

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dr = r - targetColor.r;
    const dg = g - targetColor.g;
    const db = b - targetColor.b;
    const dist = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);

    if (dist <= tolDistance) {
      data[i + 3] = 0;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else if (dist < tolDistance + smoothDistance && smoothDistance > 0) {
      const factor = (dist - tolDistance) / smoothDistance;
      data[i + 3] = Math.round(a * factor);
    }
  }

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
