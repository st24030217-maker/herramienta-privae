import { NextResponse } from "next/server";

export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25 MB

export function fileTooLarge(file: File | null): NextResponse | null {
  if (file && file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `El archivo excede el límite máximo de ${
          MAX_UPLOAD_BYTES / (1024 * 1024)
        } MB.`,
      },
      { status: 413 }
    );
  }
  return null;
}
