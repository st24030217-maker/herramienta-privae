import { NextRequest, NextResponse } from "next/server";
import { removeBackground } from "@/lib/image-engine/remove-background";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fileTooLarge } from "@/lib/upload";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (user && !user.subscription.isAccessGranted) {
      return NextResponse.json(
        { error: "Tu período de prueba ha terminado. Suscríbete para continuar." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const sensitivity = parseInt(formData.get("sensitivity") as string || "35");
    const featherRadius = parseInt(formData.get("featherRadius") as string || "2");

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 });
    }

    const sizeError = fileTooLarge(file);
    if (sizeError) return sizeError;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const processedBuffer = await removeBackground(buffer, {
      sensitivity,
      featherRadius,
    });

    if (user) {
      await prisma.toolUsage.create({
        data: {
          userId: user.id,
          toolName: "REMOVE_BG",
          inputName: file.name,
          outputDpi: 300,
        },
      }).catch(() => {});
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="privae_sin_fondo_${Date.now()}.png"`,
      },
    });
  } catch (error: any) {
    console.error("Error al remover fondo:", error);
    return NextResponse.json(
      { error: "Error al remover fondo: " + (error.message || "desconocido") },
      { status: 500 }
    );
  }
}
