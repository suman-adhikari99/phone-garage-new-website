import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { serviceCategories, brands } from "../../../lib/data"
import { ServiceCategoryPage } from "../../../components/pages/service-category-page"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = serviceCategories.find((c) => c.slug === slug)
  if (!category) return {}
  return {
    title: `${category.name} Services`,
    description: category.description,
  }
}

export default async function ServiceCategory({ params }: Props) {
  const { slug } = await params
  const category = serviceCategories.find((c) => c.slug === slug)
  if (!category) notFound()
  return <ServiceCategoryPage category={category} brands={brands} />
}
