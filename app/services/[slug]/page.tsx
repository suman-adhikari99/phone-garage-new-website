import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { serviceCategories } from "../../../lib/data"
import { ServiceCategoryPage } from "../../../components/pages/service-category-page"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = serviceCategories.find((c) => c.slug === slug)
  if (!category) return {}
  const title = `${category.name} Services | Phone Garage Lidcombe`
  return {
    title,
    description: category.description,
    alternates: {
      canonical: `/services/${slug}`,
    },
    openGraph: {
      title,
      description: category.description,
      url: `/services/${slug}`,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: category.description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export default async function ServiceCategory({ params }: Props) {
  const { slug } = await params
  const category = serviceCategories.find((c) => c.slug === slug)
  if (!category) notFound()
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <ServiceCategoryPage category={category} />
      </main>
      <Footer />
    </>
  )
}
