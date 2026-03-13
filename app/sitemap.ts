import type { MetadataRoute } from "next"
import { toAbsoluteUrl } from "@/lib/site-url"

const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: toAbsoluteUrl("/"),
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteUrl("/services"),
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: toAbsoluteUrl("/quote"),
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: toAbsoluteUrl("/book"),
      lastModified: BUILD_TIME,
      changeFrequency: "weekly",
      priority: 0.88,
    },
    {
      url: toAbsoluteUrl("/privacy-policy"),
      lastModified: BUILD_TIME,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: toAbsoluteUrl("/terms-of-service"),
      lastModified: BUILD_TIME,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]
}
