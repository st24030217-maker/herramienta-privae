import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando sembrado de base de datos Privae Textil...");

  // 1. Crear usuario Administrador inicial
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@privae.com").toLowerCase().trim();
  const defaultPassword = "AdminPassword2026!";
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: "ADMIN",
    },
    create: {
      email: adminEmail,
      name: "Administrador Privae",
      passwordHash,
      role: "ADMIN",
      subscription: {
        create: {
          status: "ACTIVE",
          trialEndsAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          planPrice: 0.0,
        },
      },
    },
    include: {
      subscription: true,
    },
  });

  console.log(`Usuario Administrador listo: ${admin.email} (Rol: ${admin.role})`);

  // 2. Crear configuraciones base del taller
  const initialSettings = [
    { key: "PLATFORM_NAME", value: "Privae Textil DTF Prepress" },
    { key: "DEFAULT_TRIAL_DAYS", value: "5", description: "Días de prueba asignados al registrarse" },
    { key: "GRACE_PERIOD_DAYS", value: "3", description: "Días naturales de gracia tras fallo de pago" },
    { key: "PLAN_PRICE_MONTHLY", value: "19.99", description: "Precio mensual en USD de membresía activa" },
    { key: "MAX_CANVAS_ITEMS", value: "50", description: "Máximo de elementos admitidos por pliego" },
    { key: "CERTIFIED_DPI", value: "300", description: "Resolución oficial requerida para taller DTF" },
  ];

  for (const s of initialSettings) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  console.log("Configuraciones del taller registradas correctamente.");
  console.log("==================================================");
  console.log("Credenciales de acceso inicial:");
  console.log(`Email:      ${adminEmail}`);
  console.log(`Contraseña: ${defaultPassword}`);
  console.log("==================================================");
}

main()
  .catch((e) => {
    console.error("Error al sembrar base de datos:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
