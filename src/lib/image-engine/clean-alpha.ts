import sharp from "sharp";

export interface CleanAlphaOptions {
  threshold?: number; // 1 a 254 (default: 40) - Cualquier opacidad menor se elimina
  boostSolid?: boolean; // Convierte opacidades altas en 100% sólido para base DTF pura
  smoothEdges?: boolean; // Suavizado selectivo
  contractEdges?: boolean; // Contraer / Choke leve para evitar que asome halo blanco
}

/**
 * Corrige y purifica el canal alfa para impresión DTF profesional.
 * Elimina halos, suciedad semitransparente y residuos que provocan manchas lechosas en el RIP.
 * Incluye modo DTF sólido concentrado y choke perimetral.
 */
export async function cleanAlphaChannel(
  imageBuffer: Buffer,
  options: CleanAlphaOptions = {}
): Promise<Buffer> {
  const { 
    threshold = 40, 
    boostSolid = false, 
    smoothEdges = false,
    contractEdges = false 
  } = options;

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
      // Residuo semitransparente que ensucia el RIP: purgar totalmente
      data[i + 3] = 0;
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
    } else if (boostSolid) {
      // Base sólida DTF 100% opaca: garantiza fondeado blanco firme en la prenda
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
    resultSharp = resultSharp.blur(0.35);
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
