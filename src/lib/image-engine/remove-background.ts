import sharp from "sharp";

export interface RemoveBgOptions {
  featherRadius?: number;
  sensitivity?: number;
}

/**
 * Remueve el fondo de una imagen dejando transparencia limpia.
 * Incluye procesamiento de bordes y preservación de detalles finos a 300 DPI.
 */
export async function removeBackground(
  imageBuffer: Buffer,
  options: RemoveBgOptions = {}
): Promise<Buffer> {
  const { featherRadius = 2, sensitivity = 35 } = options;

  const image = sharp(imageBuffer).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  // Analizar muestras de esquinas para detectar el color de fondo predominante
  const cornerCoords = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];

  let bgR = 0, bgG = 0, bgB = 0;
  for (const [cx, cy] of cornerCoords) {
    const idx = (cy * width + cx) * channels;
    bgR += data[idx];
    bgG += data[idx + 1];
    bgB += data[idx + 2];
  }
  bgR /= 4;
  bgG /= 4;
  bgB /= 4;

  const maxDist = Math.sqrt(255 * 255 * 3);
  const thresholdDist = (sensitivity / 100) * maxDist;

  // Matriz de máscara alfa
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const dist = Math.sqrt(
        (r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2
      );

      if (dist <= thresholdDist) {
        data[idx + 3] = 0; // Transparente
      } else if (dist < thresholdDist * 1.25) {
        // Transición suave
        const factor = (dist - thresholdDist) / (thresholdDist * 0.25);
        data[idx + 3] = Math.round(data[idx + 3] * factor);
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
