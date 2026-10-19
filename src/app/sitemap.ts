import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://herramienta-privae.vercel.app";
  const now = new Date();

  const routes = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/tools/remove-bg", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/tools/enhance", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/tools/remove-color", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/tools/clean-alpha", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/tools/dtf-builder", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/guia", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/terminos", priority: 0.5, changeFrequency: "yearly" as const },
    { path: "/privacidad", priority: 0.5, changeFrequency: "yearly" as const },
  ];

  return routes.map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
