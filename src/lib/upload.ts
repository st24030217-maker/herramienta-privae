import { NextResponse } from "next/server";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/tiff",
]);

const ALLOWED_EXTENSIONS = new Set(["png", "jpg", "jpeg", "webp", "tif", "tiff"]);

export function fileTooLarge(file: File | null): NextResponse | null {
  if (!file) {
    return NextResponse.json(
      { error: "No se proporcionó ningún archivo." },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `El archivo excede el límite máximo de ${
          MAX_UPLOAD_BYTES / (1024 * 1024)
        } MB.`,
      },
      { status: 413 }
    );
  }

  // Validación de tipo MIME
  if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return NextResponse.json(
      {
        error: "Formato de archivo no admitido. Usa imágenes PNG, JPG o WebP válidas.",
      },
      { status: 415 }
    );
  }

  // Validación de extensión
  const extension = file.name?.split(".").pop()?.toLowerCase();
  if (extension && !ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      {
        error: "Extensión de archivo no permitida. Solo se admiten archivos PNG, JPG y WebP.",
      },
      { status: 415 }
    );
  }

  return null;
}

/**
 * Valida la firma binaria real (magic bytes) de la imagen para impedir
 * archivos maliciosos renombrados como imágenes (SVGs con XSS, ejecutables, scripts).
 */
export function isValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return true;
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }

  // WebP: RIFF .... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }

  // TIFF (Intel / Motorola)
  if (
    (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) ||
    (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a)
  ) {
    return true;
  }

  return false;
}

export function validateImageBuffer(buffer: Buffer): NextResponse | null {
  if (!isValidImageMagicBytes(buffer)) {
    return NextResponse.json(
      { error: "La firma del archivo no corresponde a una imagen PNG, JPG o WebP válida." },
      { status: 415 }
    );
  }
  return null;
}
