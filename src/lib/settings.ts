import { prisma } from "./prisma";

export interface PlatformConfig {
  planPriceUsd: number;
  stripePriceId: string;
  fileRetentionMinutes: number;
  storeReturnUrl: string;
}

const DEFAULT_CONFIG: PlatformConfig = {
  planPriceUsd: 19.99,
  stripePriceId: process.env.STRIPE_PRICE_ID || "",
  fileRetentionMinutes: 60,
  storeReturnUrl: process.env.NEXT_PUBLIC_STORE_URL || "https://privaetextil.com",
};

export async function getPlatformConfig(): Promise<PlatformConfig> {
  try {
    const rows = await prisma.setting.findMany({
      where: {
        key: {
          in: [
            "PLAN_PRICE_USD",
            "STRIPE_PRICE_ID",
            "FILE_RETENTION_MINUTES",
            "STORE_RETURN_URL",
          ],
        },
      },
    });

    const map = new Map(rows.map((r) => [r.key, r.value]));
    const parsedPrice = parseFloat(map.get("PLAN_PRICE_USD") || "");
    const parsedRetention = parseInt(map.get("FILE_RETENTION_MINUTES") || "", 10);

    return {
      planPriceUsd:
        !isNaN(parsedPrice) && parsedPrice > 0
          ? parsedPrice
          : DEFAULT_CONFIG.planPriceUsd,
      stripePriceId:
        map.get("STRIPE_PRICE_ID") ?? DEFAULT_CONFIG.stripePriceId,
      fileRetentionMinutes:
        !isNaN(parsedRetention) && parsedRetention > 0
          ? parsedRetention
          : DEFAULT_CONFIG.fileRetentionMinutes,
      storeReturnUrl:
        map.get("STORE_RETURN_URL") || DEFAULT_CONFIG.storeReturnUrl,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function updatePlatformSetting(
  key: string,
  value: string,
  description?: string
) {
  return prisma.setting.upsert({
    where: { key },
    update: { value, ...(description ? { description } : {}) },
    create: { key, value, description: description || null },
  });
}
