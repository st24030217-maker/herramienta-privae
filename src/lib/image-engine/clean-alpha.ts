import sharp from "sharp";

export interface CleanAlphaOptions {
  threshold?: number; // 1 a 254 (default: 30) - Cualquier opacidad menor se elimina
  boostSolid?: boolean; // Convierte opacidades altas (> threshold) en 100% sólido para DTF
  smoothEdges?: boolean;
}

/**
 * Corrige y purifica el canal alfa para impresión DTF profesional.
 * Elimina halos, suciedad semitransparente y residuos que causan acumulación indebida de tinta blanca.
 * Soporta lienzos grandes de hasta 58x200 cm a 300 DPI.
 */
export async function cleanAlphaChannel(
  imageBuffer: Buffer,
  options: CleanAlphaOptions = {}
): Promise<Buffer> {
  const { threshold = 40, boostSolid = false, smoothEdges = false } = options;

  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels; // 4 (RGBA)

  const alphaCutoff = Math.max(1, Math.min(254, threshold));

  for (let i = 0; i < data.length; i += channels) {
    const alpha = data[i + 3];

    if (alpha === 0) continue;

    if (alpha < alphaCutoff) {
      // Residuo o halo semitransparente: limpiar a 0
      data[i + 3] = 0;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else if (boostSolid) {
      // Modo DTF sólido puro: cualquier opacidad válida se vuelve 100% sólida
      data[i + 3] = 255;
    }
  }

  let resultSharp = sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  });

  if (smoothEdges) {
    resultSharp = resultSharp.median(1);
  }

  return await resultSharp
    .png({
      compressionLevel: 8,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
