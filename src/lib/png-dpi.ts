/**
 * Inyecta el chunk oficial PNG pHYs de 300 DPI (11811 píxeles por metro)
 * garantizando que Photoshop, Illustrator y cualquier software RIP de impresión DTF
 * reconozca exactamente 300 DPI y dimensiones físicas reales en centímetros.
 */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

export async function inject300DpiIntoPngBlob(blob: Blob, dpi = 300): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Verificar firma PNG
  if (
    bytes.length < 33 ||
    bytes[0] !== 0x89 ||
    bytes[1] !== 0x50 ||
    bytes[2] !== 0x4e ||
    bytes[3] !== 0x47
  ) {
    return blob;
  }

  const ppm = Math.round(dpi / 0.0254); // 300 DPI = 11811 px/metro
  const physChunk = new Uint8Array(21);
  const view = new DataView(physChunk.buffer);

  // Longitud de datos = 9 bytes
  view.setUint32(0, 9, false);
  // Tipo 'pHYs' (0x70, 0x48, 0x59, 0x73)
  physChunk[4] = 0x70;
  physChunk[5] = 0x48;
  physChunk[6] = 0x59;
  physChunk[7] = 0x73;
  // X pixels per unit
  view.setUint32(8, ppm, false);
  // Y pixels per unit
  view.setUint32(12, ppm, false);
  // Unit specifier = 1 (metro)
  physChunk[16] = 1;

  // Calcular CRC sobre tipo + datos (bytes 4 a 16)
  const crc = crc32(physChunk.subarray(4, 17));
  view.setUint32(17, crc, false);

  // Insertar justo después del chunk IHDR (8 bytes de firma + 25 bytes de IHDR = offset 33)
  const ihdrEnd = 33;
  const output = new Uint8Array(bytes.length + physChunk.length);
  output.set(bytes.subarray(0, ihdrEnd), 0);
  output.set(physChunk, ihdrEnd);
  output.set(bytes.subarray(ihdrEnd), ihdrEnd + physChunk.length);

  return new Blob([output], { type: "image/png" });
}
