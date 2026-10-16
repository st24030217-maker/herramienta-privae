import sharp from "sharp";

export interface RemoveBgOptions {
  featherRadius?: number; // 0 a 8 px
  sensitivity?: number;   // 10 a 80 %
  bgType?: "auto" | "white" | "black";
  mode?: "contiguous" | "global"; // "contiguous" protege detalles interiores (ojos, letras blancas, etc.)
  customBgColor?: { r: number; g: number; b: number };
}

/**
 * Conector opcional a motor de IA neuronal en la nube (Remove.bg / ClipDrop) para cabello complejo,
 * garantizando siempre post-procesamiento y certificación de salida PNG RGBA a 300 DPI reales.
 */
async function tryCloudAiBackgroundRemoval(imageBuffer: Buffer): Promise<Buffer | null> {
  const removeBgKey = process.env.REMOVEBG_API_KEY;
  if (removeBgKey && removeBgKey.trim().length > 10) {
    try {
      const form = new FormData();
      form.append(
        "image_file",
        new Blob([new Uint8Array(imageBuffer)], { type: "image/png" }),
        "input.png"
      );
      form.append("size", "auto");
      form.append("format", "png");
      form.append("channels", "rgba");

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": removeBgKey.trim() },
        body: form,
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return await sharp(Buffer.from(arrayBuf))
          .ensureAlpha()
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .withMetadata({ density: 300 })
          .toBuffer();
      }
    } catch (err) {
      console.warn("Fallback a motor local DTF tras error en Remove.bg API:", err);
    }
  }

  const clipdropKey = process.env.CLIPDROP_API_KEY;
  if (clipdropKey && clipdropKey.trim().length > 10) {
    try {
      const form = new FormData();
      form.append(
        "image_file",
        new Blob([new Uint8Array(imageBuffer)], { type: "image/png" }),
        "input.png"
      );

      const res = await fetch("https://clipdrop-api.co/remove-background/v1", {
        method: "POST",
        headers: { "x-api-key": clipdropKey.trim() },
        body: form,
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        return await sharp(Buffer.from(arrayBuf))
          .ensureAlpha()
          .png({ compressionLevel: 9, adaptiveFiltering: true })
          .withMetadata({ density: 300 })
          .toBuffer();
      }
    } catch (err) {
      console.warn("Fallback a motor local DTF tras error en ClipDrop API:", err);
    }
  }

  return null;
}

/**
 * Motor profesional de remoción de fondo para DTF textil (Sección 03 - 01 Remover Fondo).
 * - Soporta conector IA neuronal (si se configura REMOVEBG_API_KEY / CLIPDROP_API_KEY) + Motor en Servidor de Alta Precisión.
 * - Algoritmo Flood-Fill 8-conectado + Alpha Matting de Borde Fino para cabello, pelaje y formas irregulares.
 * - Descontaminación cromática de bordes (Color Decontamination) para eliminar el color del fondo en hebras de cabello y contornos.
 * - Salida estricta en PNG RGBA sin fondo a mínimo 300 DPI reales.
 */
export async function removeBackground(
  imageBuffer: Buffer,
  options: RemoveBgOptions = {}
): Promise<Buffer> {
  // 1. Si hay API Key de IA configurada y no se forzó un color personalizado manual, usar IA neuronal + certificación 300 DPI
  if (!options.customBgColor) {
    const cloudResult = await tryCloudAiBackgroundRemoval(imageBuffer);
    if (cloudResult) {
      return cloudResult;
    }
  }

  const {
    featherRadius = 2,
    sensitivity = 35,
    bgType = "auto",
    mode = "contiguous",
    customBgColor,
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
    // Muestreo perimetral robusto por mediana (ignora mechones de cabello que toquen el borde)
    const samplesR: number[] = [];
    const samplesG: number[] = [];
    const samplesB: number[] = [];
    const stepX = Math.max(1, Math.floor(width / 24));
    const stepY = Math.max(1, Math.floor(height / 24));

    for (let x = 0; x < width; x += stepX) {
      const topIdx = (0 * width + x) * channels;
      const botIdx = ((height - 1) * width + x) * channels;
      if (data[topIdx + 3] > 120) {
        samplesR.push(data[topIdx]);
        samplesG.push(data[topIdx + 1]);
        samplesB.push(data[topIdx + 2]);
      }
      if (data[botIdx + 3] > 120) {
        samplesR.push(data[botIdx]);
        samplesG.push(data[botIdx + 1]);
        samplesB.push(data[botIdx + 2]);
      }
    }

    for (let y = 0; y < height; y += stepY) {
      const leftIdx = (y * width + 0) * channels;
      const rightIdx = (y * width + (width - 1)) * channels;
      if (data[leftIdx + 3] > 120) {
        samplesR.push(data[leftIdx]);
        samplesG.push(data[leftIdx + 1]);
        samplesB.push(data[leftIdx + 2]);
      }
      if (data[rightIdx + 3] > 120) {
        samplesR.push(data[rightIdx]);
        samplesG.push(data[rightIdx + 1]);
        samplesB.push(data[rightIdx + 2]);
      }
    }

    if (samplesR.length > 0) {
      samplesR.sort((a, b) => a - b);
      samplesG.sort((a, b) => a - b);
      samplesB.sort((a, b) => a - b);
      const mid = Math.floor(samplesR.length / 2);
      bgR = samplesR[mid];
      bgG = samplesG[mid];
      bgB = samplesB[mid];
    }
  }

  // Distancia máxima perceptual en espacio ponderado (Redmean perceptual approximation)
  const maxPerceptualDist = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const thresholdDist = (sensitivity / 100) * maxPerceptualDist;
  // Banda de transición para hebras de cabello, bordes finos y formas irregulares
  const hairMattingDist = thresholdDist * 1.42;

  const getPixelDist = (r: number, g: number, b: number) => {
    const dr = r - bgR;
    const dg = g - bgG;
    const db = b - bgB;
    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
  };

  const alphaMask = new Uint8Array(totalPixels);
  const isBgRegion = new Uint8Array(totalPixels);

  if (mode === "contiguous") {
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    const pushCoord = (x: number, y: number) => {
      const p = y * width + x;
      if (isBgRegion[p] === 1) return;
      const idx = p * channels;
      const a = data[idx + 3];
      if (a === 0 || getPixelDist(data[idx], data[idx + 1], data[idx + 2]) <= thresholdDist) {
        isBgRegion[p] = 1;
        queue[tail++] = p;
      }
    };

    for (let x = 0; x < width; x++) {
      pushCoord(x, 0);
      pushCoord(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      pushCoord(0, y);
      pushCoord(width - 1, y);
    }

    // BFS 8-conectado para penetrar entre huecos finos de cabello y formas irregulares
    while (head < tail) {
      const p = queue[head++];
      const px = p % width;
      const py = Math.floor(p / width);

      for (let dy = -1; dy <= 1; dy++) {
        const ny = py + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = px + dx;
          if (nx < 0 || nx >= width) continue;
          const np = ny * width + nx;
          if (isBgRegion[np] === 0) {
            const nidx = np * channels;
            const a = data[nidx + 3];
            if (a === 0 || getPixelDist(data[nidx], data[nidx + 1], data[nidx + 2]) <= thresholdDist) {
              isBgRegion[np] = 1;
              queue[tail++] = np;
            }
          }
        }
      }
    }

    // Evaluar máscara de alfa con Alpha Matting en bordes adyacentes al fondo (cabello y bordes finos)
    for (let p = 0; p < totalPixels; p++) {
      const idx = p * channels;
      const a = data[idx + 3];
      if (a === 0 || isBgRegion[p] === 1) {
        alphaMask[p] = 0;
        continue;
      }

      // Verificar si el píxel está en la frontera con el fondo (radio de 2 px para hebras finas)
      const px = p % width;
      const py = Math.floor(p / width);
      let touchesBg = false;
      for (let dy = -2; dy <= 2 && !touchesBg; dy++) {
        const ny = py + dy;
        if (ny < 0 || ny >= height) continue;
        for (let dx = -2; dx <= 2; dx++) {
          const nx = px + dx;
          if (nx < 0 || nx >= width) continue;
          if (isBgRegion[ny * width + nx] === 1) {
            touchesBg = true;
            break;
          }
        }
      }

      if (touchesBg) {
        const dist = getPixelDist(data[idx], data[idx + 1], data[idx + 2]);
        if (dist <= thresholdDist) {
          alphaMask[p] = 0;
        } else if (dist < hairMattingDist) {
          const rawFactor = (dist - thresholdDist) / (hairMattingDist - thresholdDist);
          // Curva sigmoide suave para preservar detalle de cabello sin neblina DTF
          const smoothFactor = rawFactor * rawFactor * (3 - 2 * rawFactor);
          const computedAlpha = Math.round(a * smoothFactor);
          alphaMask[p] = computedAlpha < 24 ? 0 : computedAlpha;
        } else {
          alphaMask[p] = a;
        }
      } else {
        alphaMask[p] = a;
      }
    }
  } else {
    // Modo Global: purga el color en todo el documento incluyendo huecos cerrados entre cabellos o letras
    for (let p = 0; p < totalPixels; p++) {
      const idx = p * channels;
      const a = data[idx + 3];
      if (a === 0) {
        alphaMask[p] = 0;
      } else {
        const dist = getPixelDist(data[idx], data[idx + 1], data[idx + 2]);
        if (dist <= thresholdDist) {
          alphaMask[p] = 0;
        } else if (dist < hairMattingDist) {
          const rawFactor = (dist - thresholdDist) / (hairMattingDist - thresholdDist);
          const smoothFactor = rawFactor * rawFactor * (3 - 2 * rawFactor);
          const computedAlpha = Math.round(a * smoothFactor);
          alphaMask[p] = computedAlpha < 24 ? 0 : computedAlpha;
        } else {
          alphaMask[p] = a;
        }
      }
    }
  }

  // Suavizado ligero sobre el canal alfa cuando featherRadius > 0
  let finalAlpha: Uint8Array = alphaMask;
  if (featherRadius > 0) {
    const blurredAlphaBuffer = await sharp(Buffer.from(alphaMask), {
      raw: { width, height, channels: 1 },
    })
      .blur(Math.max(0.3, featherRadius * 0.4))
      .raw()
      .toBuffer();

    finalAlpha = new Uint8Array(blurredAlphaBuffer);
  }

  // Reconstruir imagen RGBA con Descontaminación Cromática de Bordes (Color Decontamination)
  // Elimina la contaminación del color de fondo en las hebras de cabello y bordes finos
  const outputData = Buffer.alloc(totalPixels * 4);
  for (let p = 0; p < totalPixels; p++) {
    const srcIdx = p * channels;
    const dstIdx = p * 4;
    let alphaVal = finalAlpha[p];

    // Purgar micro-residuos (< 20) para evitar puntos blancos en el polvo adhesivo DTF
    if (alphaVal < 20) {
      outputData[dstIdx] = 0;
      outputData[dstIdx + 1] = 0;
      outputData[dstIdx + 2] = 0;
      outputData[dstIdx + 3] = 0;
    } else {
      let r = data[srcIdx];
      let g = data[srcIdx + 1];
      let b = data[srcIdx + 2];

      // Descontaminar color de fondo en píxeles de borde / cabello (alpha entre 20 y 245)
      if (alphaVal < 245) {
        const aNorm = Math.max(0.15, alphaVal / 255);
        r = Math.min(255, Math.max(0, Math.round((r - (1 - aNorm) * bgR) / aNorm)));
        g = Math.min(255, Math.max(0, Math.round((g - (1 - aNorm) * bgG) / aNorm)));
        b = Math.min(255, Math.max(0, Math.round((b - (1 - aNorm) * bgB) / aNorm)));
        // Endurecer ligeramente el alfa ya descontaminado para impresión DTF firme
        alphaVal = Math.min(255, Math.round(alphaVal * 1.12));
      }

      outputData[dstIdx] = r;
      outputData[dstIdx + 1] = g;
      outputData[dstIdx + 2] = b;
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
