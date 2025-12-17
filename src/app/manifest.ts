// src/app/manifest.ts
import type { MetadataRoute } from "next";
import { manifestConfig } from "@/core/seo/manifest.config";

export default function manifest(): MetadataRoute.Manifest {
  return manifestConfig;
}
