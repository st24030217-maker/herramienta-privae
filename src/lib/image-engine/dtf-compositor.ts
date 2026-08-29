import sharp from "sharp";

export interface DTFItem {
  imageBuffer: Buffer;
  xCm: number;       // Posición horizontal en cm
  yCm: number;       // Posición vertical en cm
  widthCm: number;   // Ancho en cm
  heightCm: number;  // Alto en cm
  rotation?: number; // Grados (0, 90, 180, 270, etc.)
}

export interface ComposeDTFOptions {
  format: "58x100" | "58x200";
  items: DTFItem[];
}

const DPI = 300;
const CM_TO_INCH = 1 / 2.54;

export function cmToPixels(cm: number): number {
  return Math.round(cm * CM_TO_INCH * DPI);
}

/**
 * Compone el lienzo final para impresión DTF a 300 DPI con dimensiones físicas exactas:
 * - 58 cm x 100 cm => 6850 x 11811 px
 * - 58 cm x 200 cm => 6850 x 23622 px
 */
export async function composeDTFCanvas(options: ComposeDTFOptions): Promise<Buffer> {
  const { format, items } = options;

  const canvasWidthPx = cmToPixels(58); // 6850 px
  const canvasHeightPx = format === "58x100" ? cmToPixels(100) : cmToPixels(200); // 11811 px o 23622 px

  // Preparar todas las capas redimensionadas y posicionadas
  const compositeLayers: sharp.OverlayOptions[] = [];

  for (const item of items) {
    const itemWidthPx = Math.max(1, cmToPixels(item.widthCm));
    const itemHeightPx = Math.max(1, cmToPixels(item.heightCm));
    const leftPx = Math.max(0, cmToPixels(item.xCm));
    const topPx = Math.max(0, cmToPixels(item.yCm));

    // Validar que no se salga completamente del lienzo
    if (leftPx >= canvasWidthPx || topPx >= canvasHeightPx) {
      continue;
    }

    let processedItem = sharp(item.imageBuffer).ensureAlpha().resize(itemWidthPx, itemHeightPx, {
      fit: "fill",
      kernel: sharp.kernel.lanczos3,
    });

    if (item.rotation && item.rotation !== 0) {
      processedItem = processedItem.rotate(item.rotation, {
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      });
    }

    const itemBuffer = await processedItem.toBuffer();

    compositeLayers.push({
      input: itemBuffer,
      left: leftPx,
      top: topPx,
    });
  }

  // Crear lienzo transparente base
  const canvas = sharp({
    create: {
      width: canvasWidthPx,
      height: canvasHeightPx,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  });

  if (compositeLayers.length > 0) {
    canvas.composite(compositeLayers);
  }

  return await canvas
    .png({
      compressionLevel: 7,
      adaptiveFiltering: true,
    })
    .withMetadata({
      density: DPI,
    })
    .toBuffer();
}
