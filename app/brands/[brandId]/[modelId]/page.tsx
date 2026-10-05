import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandById, getModelById, getServicesByModel } from "../../../../lib/data"
import { ModelPage } from "../../../../components/pages/model-page"
import { DEFAULT_OG_IMAGE } from "@/lib/seo"

interface Props {
  params: Promise<{ brandId: string; modelId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandId, modelId } = await params
  const brand = getBrandById(brandId)
  const model = getModelById(modelId)
  if (!brand || !model) return {}
  const title = `${brand.name} ${model.name} Repair | Phone Garage Lidcombe`
  const description = `Professional ${brand.name} ${model.name} repair services in Lidcombe. Screen repair, battery replacement and same-day service available.`
  return {
    title,
    description,
    alternates: {
      canonical: `/brands/${brandId}/${modelId}`,
    },
    openGraph: {
      title,
      description,
      url: `/brands/${brandId}/${modelId}`,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  }
}

export default async function Model({ params }: Props) {
  const { brandId, modelId } = await params
  const brand = getBrandById(brandId)
  const model = getModelById(modelId)
  if (!brand || !model) notFound()
  const services = getServicesByModel(modelId)
  return <ModelPage brand={brand} model={model} services={services} />
}
