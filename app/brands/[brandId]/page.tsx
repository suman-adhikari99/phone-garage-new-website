import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getBrandById, getModelsByBrand } from "../../../lib/data"
import { BrandPage } from "../../../components/pages/brand-page"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface Props {
  params: Promise<{ brandId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { brandId } = await params
  const brand = getBrandById(brandId)
  if (!brand) return {}
  return {
    title: `${brand.name} Repair Services`,
    description: `Professional ${brand.name} repair services. Screen repair, battery replacement, and more for all ${brand.name} models.`,
  }
}

export default async function Brand({ params }: Props) {
  const { brandId } = await params
  const brand = getBrandById(brandId)
  if (!brand) notFound()
  const models = getModelsByBrand(brandId)
  return (
    <>
      <Header />
      <main className="relative z-10 pt-28 sm:pt-32">
        <BrandPage brand={brand} models={models} />
      </main>
      <Footer />
    </>
  )
}
