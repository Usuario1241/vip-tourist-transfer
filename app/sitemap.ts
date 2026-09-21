import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://www.viptouristtransfer.com/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}