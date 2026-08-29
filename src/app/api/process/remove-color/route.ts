import { NextRequest, NextResponse } from "next/server";
import { removeColorFromImage } from "@/lib/image-engine/remove-color";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    // Validar acceso (si es demo o tiene sesión)
    if (user && !user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Suscríbete para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const r = parseInt(formData.get("r") as string || "255");
    const g = parseInt(formData.get("g") as string || "255");
    const b = parseInt(formData.get("b") as string || "255");
    const tolerance = parseInt(formData.get("tolerance") as string || "30");
    const smoothness = parseInt(formData.get("smoothness") as string || "10");

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const processedBuffer = await removeColorFromImage(
      buffer,
      { r, g, b },
      tolerance,
      smoothness
    );

    // Registrar uso si hay usuario logueado
    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "REMOVE_COLOR",
          inputName: file.name,
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_sin_color_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al procesar eliminación de color:", error);
    return NextResponse.json(
      { error: "Error al procesar la imagen: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
