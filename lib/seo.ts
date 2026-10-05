import { toAbsoluteUrl } from "@/lib/site-url"

export const BUSINESS_NAME = "Phone Garage"
export const BUSINESS_PHONE = "0403983009"
export const BUSINESS_EMAIL = "info@phonegarage.com.au"
export const BUSINESS_ADDRESS = {
  streetAddress: "27 Church St",
  addressLocality: "Lidcombe",
  addressRegion: "NSW",
  postalCode: "2141",
  addressCountry: "AU",
}

export const DEFAULT_OG_IMAGE = {
  url: "/images/services/hero-workshop.jpg",
  width: 2400,
  height: 1350,
  alt: "Phone Garage repair workshop in Lidcombe",
}

export const LAPTOP_OG_IMAGE = {
  url: "/images/services/laptop-hero-light.jpg",
  width: 1024,
  height: 1024,
  alt: "Laptop repair bench with internal components exposed",
}

export function localBusinessStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": toAbsoluteUrl("/#localbusiness"),
    name: BUSINESS_NAME,
    url: toAbsoluteUrl("/"),
    logo: toAbsoluteUrl("/images/phone-garage-logo.png"),
    image: toAbsoluteUrl(DEFAULT_OG_IMAGE.url),
    telephone: BUSINESS_PHONE,
    email: BUSINESS_EMAIL,
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      ...BUSINESS_ADDRESS,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "17:30",
      },
    ],
    areaServed: ["Lidcombe", "Auburn", "Berala", "Strathfield", "Sydney"],
  }
}
