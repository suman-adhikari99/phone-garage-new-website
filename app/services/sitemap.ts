import type { MetadataRoute } from "next"
import { serviceCategories } from "@/lib/data"
import { toAbsoluteUrl } from "@/lib/site-url"

const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  return serviceCategories.map((category) => ({
    url: toAbsoluteUrl(`/services/${category.slug}`),
    lastModified: BUILD_TIME,
    changeFrequency: "monthly" as const,
    priority: 0.82,
  }))
}
