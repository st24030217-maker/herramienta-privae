import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "schema.prisma");

// Obtener DATABASE_URL del entorno o de .env si existe
let dbUrl = (process.env.DATABASE_URL || "").trim();

if (!dbUrl) {
  const envPath = path.join(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/^\s*DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match) {
      dbUrl = match[1].trim();
    }
  }
}

const isVercel = Boolean(process.env.VERCEL);

// Determinar el provider correspondiente:
// En Vercel o con URLs de Postgres -> postgresql
// Con URLs file: -> sqlite
let targetProvider = "postgresql";
if (dbUrl.startsWith("file:")) {
  targetProvider = "sqlite";
} else if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://") || isVercel) {
  targetProvider = "postgresql";
}

try {
  let content = fs.readFileSync(schemaPath, "utf8");
  const regex = /provider\s*=\s*"(sqlite|postgresql)"/;
  const match = content.match(regex);
  if (match && match[1] !== targetProvider) {
    content = content.replace(regex, `provider = "${targetProvider}"`);
    fs.writeFileSync(schemaPath, content, "utf8");
    console.log(`[Prisma Sync] Provider de base de datos ajustado a: "${targetProvider}"`);
  } else {
    console.log(`[Prisma Sync] Provider verificado correctamente: "${match ? match[1] : targetProvider}"`);
  }
} catch (err) {
  console.error("[Prisma Sync] Error al sincronizar provider:", err);
}
