import type { MetadataRoute } from "next"
import { brands, models } from "@/lib/data"
import { toAbsoluteUrl } from "@/lib/site-url"

const BUILD_TIME = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const brandUrls = brands.map((brand) => ({
    url: toAbsoluteUrl(`/brands/${brand.id}`),
    lastModified: BUILD_TIME,
    changeFrequency: "monthly" as const,
    priority: 0.76,
  }))

  const modelUrls = models.map((model) => ({
    url: toAbsoluteUrl(`/brands/${model.brandId}/${model.id}`),
    lastModified: BUILD_TIME,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...brandUrls, ...modelUrls]
}
