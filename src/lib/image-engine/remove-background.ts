import sharp from "sharp";

export interface RemoveBgOptions {
  featherRadius?: number; // 0 a 8 px
  sensitivity?: number;   // 10 a 80 %
  bgType?: "auto" | "white" | "black";
  mode?: "contiguous" | "global"; // "contiguous" protege detalles interiores (ojos, letras blancas, etc.)
  customBgColor?: { r: number; g: number; b: number };
}

/**
 * Motor profesional de remoción de fondo para DTF textil.
 * - Algoritmo Flood-Fill contiguo desde bordes: preserva detalles interiores del estampado.
 * - Antialiasing exclusivo en canal alfa: no difumina ni degrada los píxeles de color RGB.
 * - Soporte de recorte por tolerancia perceptual ponderada (2R + 4G + 3B).
 * - Salida estricta a 300 DPI reales para RIP textil.
 */
export async function removeBackground(
  imageBuffer: Buffer,
  options: RemoveBgOptions = {}
): Promise<Buffer> {
  const { 
    featherRadius = 2, 
    sensitivity = 35, 
    bgType = "auto",
    mode = "contiguous",
    customBgColor
  } = options;

  const originalSharp = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await originalSharp.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const totalPixels = width * height;

  let bgR = 255;
  let bgG = 255;
  let bgB = 255;

  if (customBgColor) {
    bgR = customBgColor.r;
    bgG = customBgColor.g;
    bgB = customBgColor.b;
  } else if (bgType === "white") {
    bgR = 255;
    bgG = 255;
    bgB = 255;
  } else if (bgType === "black") {
    bgR = 0;
    bgG = 0;
    bgB = 0;
  } else {
    // Muestreo perimetral multizona inteligente
    let sumR = 0, sumG = 0, sumB = 0, count = 0;
    const stepX = Math.max(1, Math.floor(width / 16));
    const stepY = Math.max(1, Math.floor(height / 16));

    for (let x = 0; x < width; x += stepX) {
      const topIdx = (0 * width + x) * channels;
      const botIdx = ((height - 1) * width + x) * channels;
      if (data[topIdx + 3] > 120) {
        sumR += data[topIdx]; sumG += data[topIdx + 1]; sumB += data[topIdx + 2]; count++;
      }
      if (data[botIdx + 3] > 120) {
        sumR += data[botIdx]; sumG += data[botIdx + 1]; sumB += data[botIdx + 2]; count++;
      }
    }

    for (let y = 0; y < height; y += stepY) {
      const leftIdx = (y * width + 0) * channels;
      const rightIdx = (y * width + (width - 1)) * channels;
      if (data[leftIdx + 3] > 120) {
        sumR += data[leftIdx]; sumG += data[leftIdx + 1]; sumB += data[leftIdx + 2]; count++;
      }
      if (data[rightIdx + 3] > 120) {
        sumR += data[rightIdx]; sumG += data[rightIdx + 1]; sumB += data[rightIdx + 2]; count++;
      }
    }

    if (count > 0) {
      bgR = sumR / count;
      bgG = sumG / count;
      bgB = sumB / count;
    }
  }

  // Distancia máxima perceptual en espacio ponderado
  const maxPerceptualDist = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const thresholdDist = (sensitivity / 100) * maxPerceptualDist;

  const colorMatchesBg = (r: number, g: number, b: number) => {
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    const dist = Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
    return dist <= thresholdDist;
  };

  const getPixelDist = (r: number, g: number, b: number) => {
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    return Math.sqrt(2 * dr * dr + 4 * dr * dr + 3 * db * db);
  };

  // Máscara de opacidad (1 byte por píxel)
  const alphaMask = new Uint8Array(totalPixels);

  if (mode === "contiguous") {
    // Algoritmo Flood-Fill BFS desde los bordes exteriores
    // visited[p]: 0 = sin visitar, 1 = fondo conectado a exterior
    const isBgConnected = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    const pushCoord = (x: number, y: number) => {
      const p = y * width + x;
      if (isBgConnected[p] === 1) return;
      const idx = p * channels;
      const a = data[idx + 3];
      // Si ya era transparente o coincide con el color de fondo
      if (a === 0 || colorMatchesBg(data[idx], data[idx + 1], data[idx + 2])) {
        isBgConnected[p] = 1;
        queue[tail++] = p;
      }
    };

    // Semillas en todo el perímetro exterior
    for (let x = 0; x < width; x++) {
      pushCoord(x, 0);
      pushCoord(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      pushCoord(0, y);
      pushCoord(width - 1, y);
    }

    // BFS 4-conectado
    while (head < tail) {
      const p = queue[head++];
      const px = p % width;
      const py = Math.floor(p / width);

      // 4 vecinos
      const neighbors = [
        px > 0 ? p - 1 : -1,
        px < width - 1 ? p + 1 : -1,
        py > 0 ? p - width : -1,
        py < height - 1 ? p + width : -1,
      ];

      for (let i = 0; i < 4; i++) {
        const np = neighbors[i];
        if (np >= 0 && isBgConnected[np] === 0) {
          const nidx = np * channels;
          const a = data[nidx + 3];
          if (a === 0 || colorMatchesBg(data[nidx], data[nidx + 1], data[nidx + 2])) {
            isBgConnected[np] = 1;
            queue[tail++] = np;
          }
        }
      }
    }

    // Llenar la máscara de alfa preservando interiores intactos
    for (let p = 0; p < totalPixels; p++) {
      const idx = p * channels;
      const a = data[idx + 3];
      if (a === 0) {
        alphaMask[p] = 0;
      } else if (isBgConnected[p] === 1) {
        alphaMask[p] = 0; // Removido
      } else {
        alphaMask[p] = a; // Preservado (incluyendo elementos interiores blancos)
      }
    }
  } else {
    // Modo Global: purga el color en todo el documento
    for (let p = 0; p < totalPixels; p++) {
      const idx = p * channels;
      const a = data[idx + 3];
      if (a === 0) {
        alphaMask[p] = 0;
      } else {
        const dist = getPixelDist(data[idx], data[idx + 1], data[idx + 2]);
        if (dist <= thresholdDist) {
          alphaMask[p] = 0;
        } else if (dist < thresholdDist * 1.25) {
          const factor = (dist - thresholdDist) / (thresholdDist * 0.25);
          alphaMask[p] = Math.round(a * factor);
        } else {
          alphaMask[p] = a;
        }
      }
    }
  }

  // Suavizado / Feathering EXCLUSIVO sobre el canal alfa (evita desenfocar colores RGB)
  let finalAlpha: Uint8Array = alphaMask;
  if (featherRadius > 0) {
    const blurredAlphaBuffer = await sharp(Buffer.from(alphaMask.buffer), {
      raw: { width, height, channels: 1 },
    })
      .blur(Math.max(0.3, featherRadius * 0.45))
      .raw()
      .toBuffer();

    finalAlpha = new Uint8Array(blurredAlphaBuffer);
  }

  // Reconstruir imagen RGBA manteniendo los colores RGB 100% nítidos
  const outputData = Buffer.alloc(totalPixels * 4);
  for (let p = 0; p < totalPixels; p++) {
    const srcIdx = p * channels;
    const dstIdx = p * 4;
    const alphaVal = finalAlpha[p];

    if (alphaVal === 0) {
      outputData[dstIdx] = 0;
      outputData[dstIdx + 1] = 0;
      outputData[dstIdx + 2] = 0;
      outputData[dstIdx + 3] = 0;
    } else {
      outputData[dstIdx] = data[srcIdx];
      outputData[dstIdx + 1] = data[srcIdx + 1];
      outputData[dstIdx + 2] = data[srcIdx + 2];
      outputData[dstIdx + 3] = alphaVal;
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
      compressionLevel: 9,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: 300,
    })
    .toBuffer();
}
