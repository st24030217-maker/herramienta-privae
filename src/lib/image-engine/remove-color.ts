import sharp from "sharp";

export interface RemoveColorOptions {
  tolerance?: number; // 0 a 100
  smoothness?: number; // 0 a 50
  defringe?: boolean; // Neutraliza la contaminación del color eliminado en los bordes
  mode?: "global" | "contiguous"; // "global" en todo el diseño o "contiguous" solo exterior
}

/**
 * Elimina un color específico con alta precisión perceptual para DTF textil.
 * - Soporta cálculo de distancia cromática perceptual ponderada (2R + 4G + 3B).
 * - Neutralización de halos residuales (De-fringe).
 * - Modo global o contiguo desde bordes.
 * - Salida estricta a 300 DPI.
 */
export async function removeColorFromImage(
  imageBuffer: Buffer,
  targetColor: { r: number; g: number; b: number },
  options: RemoveColorOptions | number = 30,
  legacySmoothness: number = 10
): Promise<Buffer> {
  const opts: RemoveColorOptions =
    typeof options === "number"
      ? { tolerance: options, smoothness: legacySmoothness, defringe: true, mode: "global" }
      : { tolerance: 30, smoothness: 10, defringe: true, mode: "global", ...options };

  const { tolerance = 30, smoothness = 10, defringe = true, mode = "global" } = opts;

  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const width = info.width;
  const height = info.height;
  const channels = info.channels;
  const totalPixels = width * height;

  const maxDistance = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const tolDistance = (tolerance / 100) * maxDistance;
  const smoothDistance = (smoothness / 100) * maxDistance;

  const getDist = (r: number, g: number, b: number) => {
    const dr = r - targetColor.r;
    const dg = g - targetColor.g;
    const db = b - targetColor.b;
    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
  };

  const isMatching = (r: number, g: number, b: number) => getDist(r, g, b) <= tolDistance;

  if (mode === "contiguous") {
    // Modo Flood Fill desde bordes
    const isBgConnected = new Uint8Array(totalPixels);
    const queue = new Int32Array(totalPixels);
    let head = 0;
    let tail = 0;

    const pushCoord = (x: number, y: number) => {
      const p = y * width + x;
      if (isBgConnected[p] === 1) return;
      const idx = p * channels;
      if (data[idx + 3] === 0 || isMatching(data[idx], data[idx + 1], data[idx + 2])) {
        isBgConnected[p] = 1;
        queue[tail++] = p;
      }
    };

    for (let x = 0; x < width; x++) { pushCoord(x, 0); pushCoord(x, height - 1); }
    for (let y = 0; y < height; y++) { pushCoord(0, y); pushCoord(width - 1, y); }

    while (head < tail) {
      const p = queue[head++];
      const px = p % width;
      const py = Math.floor(p / width);

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
          if (data[nidx + 3] === 0 || isMatching(data[nidx], data[nidx + 1], data[nidx + 2])) {
            isBgConnected[np] = 1;
            queue[tail++] = np;
          }
        }
      }
    }

    for (let p = 0; p < totalPixels; p++) {
      const idx = p * channels;
      if (isBgConnected[p] === 1) {
        data[idx + 3] = 0;
        data[idx] = 0;
        data[idx + 1] = 0;
        data[idx + 2] = 0;
      }
    }
  } else {
    // Modo Global
    for (let i = 0; i < data.length; i += channels) {
      const a = data[i + 3];
      if (a === 0) continue;

      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const dist = getDist(r, g, b);

      if (dist <= tolDistance) {
        data[i + 3] = 0;
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
      } else if (dist < tolDistance + smoothDistance && smoothDistance > 0) {
        const factor = (dist - tolDistance) / smoothDistance;
        data[i + 3] = Math.round(a * factor);

        // De-fringe: si el borde conserva tinte del color eliminado, neutralizarlo
        if (defringe && factor < 0.8) {
          data[i] = Math.round(data[i] * factor);
          data[i + 1] = Math.round(data[i + 1] * factor);
          data[i + 2] = Math.round(data[i + 2] * factor);
        }
      }
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
