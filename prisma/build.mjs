import { execSync } from "child_process";

console.log("[Build] Paso 1: Sincronizando provider de base de datos...");
try {
  execSync("node prisma/sync-provider.mjs", { stdio: "inherit" });
} catch (err) {
  console.warn("[Build] Aviso en sync-provider:", err.message);
}

console.log("[Build] Paso 2: Generando cliente de Prisma...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
} catch (err) {
  console.error("[Build] Error al generar cliente de Prisma:", err.message);
  process.exit(1);
}

console.log("[Build] Paso 3: Verificando base de datos...");
if (process.env.DATABASE_URL) {
  try {
    execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });
    console.log("[Build] Base de datos sincronizada con éxito.");
  } catch (err) {
    console.warn("[Build] Aviso: db push no completado durante el build (se omitió para no bloquear despliegue):", err.message);
  }
} else {
  console.log("[Build] DATABASE_URL no detectada en build, omitiendo db push.");
}

console.log("[Build] Paso 4: Compilando Next.js...");
execSync("npx next build", { stdio: "inherit" });
console.log("[Build] ¡Compilación finalizada con éxito!");
