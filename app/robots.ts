import type { MetadataRoute } from "next"
import { getSiteUrl, toAbsoluteUrl } from "@/lib/site-url"

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard/"],
      },
    ],
    sitemap: [
      toAbsoluteUrl("/sitemap.xml"),
      toAbsoluteUrl("/services/sitemap.xml"),
      toAbsoluteUrl("/brands/sitemap.xml"),
    ],
    host: siteUrl,
  }
}
