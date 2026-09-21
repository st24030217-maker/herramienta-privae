import sharp from "sharp";

export interface CleanAlphaOptions {
  threshold?: number; // 1 a 254 (default: 40) - Cualquier opacidad menor se elimina
  boostSolid?: boolean; // Convierte opacidades altas en 100% sólido para base DTF pura
  smoothEdges?: boolean; // Suavizado selectivo del borde alfa
  chokePixels?: number; // 0, 1, 2 o 3 px de contracción morfológica (Choke)
  removeSpeckles?: boolean; // Limpia motas y partículas flotantes aisladas
}

/**
 * Corrige, purifica y calibra el canal alfa para impresión DTF profesional.
 * - Elimina halos translúcidos que producen base lechosa en el software RIP.
 * - Choke morfológico real (contracción de 1 a 3 px): evita que la tinta blanca desborde los colores.
 * - Solidificación al 100% de la base textil para máxima opacidad en prendas oscuras.
 * - Filtro de píxeles huérfanos (Despeckle).
 */
export async function cleanAlphaChannel(
  imageBuffer: Buffer,
  options: CleanAlphaOptions = {}
): Promise<Buffer> {
  const { 
    threshold = 40, 
    boostSolid = false, 
    smoothEdges = false,
    chokePixels = 0,
    removeSpeckles = true
  } = options;

  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const totalPixels = width * height;

  const alphaCutoff = Math.max(1, Math.min(254, threshold));
  const currentAlpha = new Uint8Array(totalPixels);

  // Paso 1: Purgar semitransparencias por debajo del umbral
  for (let p = 0; p < totalPixels; p++) {
    const a = data[p * channels + 3];
    if (a < alphaCutoff) {
      currentAlpha[p] = 0;
    } else {
      currentAlpha[p] = boostSolid ? 255 : a;
    }
  }

  // Paso 2: Filtro de píxeles huérfanos / Despeckle (limpieza de motas aisladas)
  if (removeSpeckles) {
    const cleanedSpeckles = new Uint8Array(currentAlpha);
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const p = y * width + x;
        if (currentAlpha[p] === 0) continue;

        // Contar vecinos opacos en ventana 3x3
        let neighborCount = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            if (currentAlpha[(y + dy) * width + (x + dx)] > 0) {
              neighborCount++;
            }
          }
        }

        // Si está casi aislado (menos de 2 vecinos), es polvo o residuo del fondo
        if (neighborCount < 2) {
          cleanedSpeckles[p] = 0;
        }
      }
    }
    currentAlpha.set(cleanedSpeckles);
  }

  // Paso 3: Choke Morfológico Real (Erosión del canal alfa de 1 a 3 px)
  let erodedAlpha = currentAlpha;
  const radius = Math.min(3, Math.max(0, chokePixels));

  if (radius > 0) {
    erodedAlpha = new Uint8Array(totalPixels);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const p = y * width + x;
        if (currentAlpha[p] === 0) {
          erodedAlpha[p] = 0;
          continue;
        }

        // Min-filter en ventana de radio
        let minVal = currentAlpha[p];
        const yMin = Math.max(0, y - radius);
        const yMax = Math.min(height - 1, y + radius);
        const xMin = Math.max(0, x - radius);
        const xMax = Math.min(width - 1, x + radius);

        for (let ny = yMin; ny <= yMax; ny++) {
          for (let nx = xMin; nx <= xMax; nx++) {
            const val = currentAlpha[ny * width + nx];
            if (val < minVal) {
              minVal = val;
              if (minVal === 0) break;
            }
          }
          if (minVal === 0) break;
        }

        erodedAlpha[p] = minVal;
      }
    }
  }

  // Paso 4: Suavizado antialias de borde si se solicitó (sin tocar RGB)
  let finalAlpha = erodedAlpha;
  if (smoothEdges) {
    const blurredAlphaBuffer = await sharp(Buffer.from(erodedAlpha.buffer), {
      raw: { width, height, channels: 1 },
    })
      .blur(0.4)
      .raw()
      .toBuffer();

    finalAlpha = new Uint8Array(blurredAlphaBuffer);
  }

  // Reconstruir RGBA con colores intactos
  const outputData = Buffer.alloc(totalPixels * 4);
  for (let p = 0; p < totalPixels; p++) {
    const srcIdx = p * channels;
    const dstIdx = p * 4;
    const a = finalAlpha[p];

    if (a === 0) {
      outputData[dstIdx] = 0;
      outputData[dstIdx + 1] = 0;
      outputData[dstIdx + 2] = 0;
      outputData[dstIdx + 3] = 0;
    } else {
      outputData[dstIdx] = data[srcIdx];
      outputData[dstIdx + 1] = data[srcIdx + 1];
      outputData[dstIdx + 2] = data[srcIdx + 2];
      outputData[dstIdx + 3] = a;
    }
  }

  return await sharp(outputData, {
    raw: {
      width,
      height,
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
