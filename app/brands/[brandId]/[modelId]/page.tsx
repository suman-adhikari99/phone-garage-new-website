import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandById, getModelById, getServicesByModel } from "../../../../lib/data"
import { ModelPage } from "../../../../components/pages/model-page"

interface Props {
  params: Promise<{ brandId: string; modelId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandId, modelId } = await params
  const brand = getBrandById(brandId)
  const model = getModelById(modelId)
  if (!brand || !model) return {}
  return {
    title: `${brand.name} ${model.name} Repair`,
    description: `Professional ${brand.name} ${model.name} repair services. Screen repair from $149, battery replacement from $79. Same-day service available.`,
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
