import sharp from "sharp";

export interface RemoveBgOptions {
  featherRadius?: number;
  sensitivity?: number;
  bgType?: "auto" | "white" | "black";
}

/**
 * Remueve el fondo de una imagen dejando transparencia limpia para DTF.
 * Utiliza muestreo perimetral multizona, cálculo de distancia cromática ponderada (perceptual)
 * y difuminado adaptativo de bordes para evitar bordes mordidos o residuos en el RIP.
 */
export async function removeBackground(
  imageBuffer: Buffer,
  options: RemoveBgOptions = {}
): Promise<Buffer> {
  const { featherRadius = 2, sensitivity = 35, bgType = "auto" } = options;

  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let bgR = 255;
  let bgG = 255;
  let bgB = 255;

  if (bgType === "white") {
    bgR = 255;
    bgG = 255;
    bgB = 255;
  } else if (bgType === "black") {
    bgR = 0;
    bgG = 0;
    bgB = 0;
  } else {
    // Muestreo perimetral inteligente: 32 muestras distribuidas en el perímetro
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const stepX = Math.max(1, Math.floor(width / 8));
    const stepY = Math.max(1, Math.floor(height / 8));

    // Borde superior e inferior
    for (let x = 0; x < width; x += stepX) {
      const topIdx = (0 * width + x) * channels;
      const botIdx = ((height - 1) * width + x) * channels;
      if (data[topIdx + 3] > 128) {
        sumR += data[topIdx];
        sumG += data[topIdx + 1];
        sumB += data[topIdx + 2];
        count++;
      }
      if (data[botIdx + 3] > 128) {
        sumR += data[botIdx];
        sumG += data[botIdx + 1];
        sumB += data[botIdx + 2];
        count++;
      }
    }

    // Borde izquierdo y derecho
    for (let y = 0; y < height; y += stepY) {
      const leftIdx = (y * width + 0) * channels;
      const rightIdx = (y * width + (width - 1)) * channels;
      if (data[leftIdx + 3] > 128) {
        sumR += data[leftIdx];
        sumG += data[leftIdx + 1];
        sumB += data[leftIdx + 2];
        count++;
      }
      if (data[rightIdx + 3] > 128) {
        sumR += data[rightIdx];
        sumG += data[rightIdx + 1];
        sumB += data[rightIdx + 2];
        count++;
      }
    }

    if (count > 0) {
      bgR = sumR / count;
      bgG = sumG / count;
      bgB = sumB / count;
    }
  }

  // Distancia máxima perceptual en espacio RGB ponderado
  // Fórmula ponderada para el ojo humano: 2*dr^2 + 4*dg^2 + 3*db^2
  const maxPerceptualDist = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const thresholdDist = (sensitivity / 100) * maxPerceptualDist;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a === 0) continue;

      const dr = r - bgR;
      const dg = g - bgG;
      const db = b - bgB;
      const dist = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);

      if (dist <= thresholdDist) {
        data[idx + 3] = 0; // Transparente
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      } else if (dist < thresholdDist * 1.2) {
        // Transición suave anti-halos
        const factor = (dist - thresholdDist) / (thresholdDist * 0.2);
        data[idx + 3] = Math.round(a * factor);
      }
    }
  }

  let result = sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  });

  if (featherRadius > 0) {
    result = result.blur(Math.max(0.3, featherRadius / 3));
  }

  return await result
    .png({
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
