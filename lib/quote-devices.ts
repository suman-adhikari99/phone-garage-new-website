import {
  Camera,
  Computer,
  Gamepad2,
  HardDrive,
  Headphones,
  Laptop,
  Monitor,
  Printer,
  Shapes,
  Speaker,
  Watch,
  type LucideIcon,
} from "lucide-react"
import type { DeviceCategory } from "@/lib/data"

export type ExtraDeviceCategory = "watch" | "console" | "other"
export type QuoteDeviceCategory = DeviceCategory | ExtraDeviceCategory

export interface QuoteModelOption {
  id: string
  name: string
  sub?: string
}

/** A brand with no models asks the customer to type their model instead. */
export interface QuoteBrandOption {
  id: string
  name: string
  logo?: string
  icon?: LucideIcon
  modelCount?: number
  models: QuoteModelOption[]
}

const logo = (slug: string) => `https://cdn.simpleicons.org/${slug}/000000`

const notSure = (brandId: string): QuoteModelOption => ({
  id: `${brandId}-not-sure`,
  name: "Not sure / other model",
  sub: "We'll confirm in store",
})

export const extraDeviceBrands: Record<ExtraDeviceCategory, QuoteBrandOption[]> = {
  watch: [
    {
      id: "apple-watch",
      name: "Apple Watch",
      logo: logo("apple"),
      models: [
        { id: "apple-watch-ultra-4", name: "Apple Watch Ultra 4", sub: "Release 2026" },
        { id: "apple-watch-series-12", name: "Apple Watch Series 12", sub: "Release 2026" },
        { id: "apple-watch-ultra-3", name: "Apple Watch Ultra 3", sub: "Release 2025" },
        { id: "apple-watch-series-11", name: "Apple Watch Series 11", sub: "Release 2025" },
        { id: "apple-watch-se-3", name: "Apple Watch SE (3rd gen)", sub: "Release 2025" },
        { id: "apple-watch-series-10", name: "Apple Watch Series 10", sub: "Release 2024" },
        { id: "apple-watch-ultra-2", name: "Apple Watch Ultra 2", sub: "Release 2023" },
        { id: "apple-watch-series-9", name: "Apple Watch Series 9", sub: "Release 2023" },
        { id: "apple-watch-ultra", name: "Apple Watch Ultra", sub: "Release 2022" },
        { id: "apple-watch-series-8", name: "Apple Watch Series 8", sub: "Release 2022" },
        { id: "apple-watch-se-2", name: "Apple Watch SE (2nd gen)", sub: "Release 2022" },
        { id: "apple-watch-series-7", name: "Apple Watch Series 7", sub: "Release 2021" },
        { id: "apple-watch-series-6", name: "Apple Watch Series 6", sub: "Release 2020" },
        { id: "apple-watch-se", name: "Apple Watch SE (1st gen)", sub: "Release 2020" },
        { id: "apple-watch-series-5", name: "Apple Watch Series 5", sub: "Release 2019" },
        { id: "apple-watch-series-4", name: "Apple Watch Series 4", sub: "Release 2018" },
        { id: "apple-watch-series-3", name: "Apple Watch Series 3", sub: "Release 2017" },
        notSure("apple-watch"),
      ],
    },
    {
      id: "galaxy-watch",
      name: "Samsung Galaxy Watch",
      logo: logo("samsung"),
      models: [
        { id: "galaxy-watch-8", name: "Galaxy Watch8 / Watch8 Classic", sub: "Release 2025" },
        { id: "galaxy-watch-ultra", name: "Galaxy Watch Ultra", sub: "Release 2024" },
        { id: "galaxy-watch-7", name: "Galaxy Watch7", sub: "Release 2024" },
        { id: "galaxy-watch-6", name: "Galaxy Watch6 / Watch6 Classic", sub: "Release 2023" },
        { id: "galaxy-watch-5", name: "Galaxy Watch5 / Watch5 Pro", sub: "Release 2022" },
        { id: "galaxy-watch-4", name: "Galaxy Watch4 / Watch4 Classic", sub: "Release 2021" },
        notSure("galaxy-watch"),
      ],
    },
    {
      id: "pixel-watch",
      name: "Google Pixel Watch",
      logo: logo("google"),
      models: [
        { id: "pixel-watch-4", name: "Pixel Watch 4", sub: "Release 2025" },
        { id: "pixel-watch-3", name: "Pixel Watch 3", sub: "Release 2024" },
        { id: "pixel-watch-2", name: "Pixel Watch 2", sub: "Release 2023" },
        { id: "pixel-watch", name: "Pixel Watch", sub: "Release 2022" },
        notSure("pixel-watch"),
      ],
    },
    {
      id: "garmin",
      name: "Garmin",
      logo: logo("garmin"),
      models: [
        { id: "garmin-fenix", name: "Fenix series" },
        { id: "garmin-forerunner", name: "Forerunner series" },
        { id: "garmin-venu", name: "Venu series" },
        { id: "garmin-epix-instinct", name: "Epix / Instinct series" },
        notSure("garmin"),
      ],
    },
    {
      id: "fitbit",
      name: "Fitbit",
      logo: logo("fitbit"),
      models: [
        { id: "fitbit-sense-versa", name: "Sense / Versa series" },
        { id: "fitbit-charge", name: "Charge series" },
        notSure("fitbit"),
      ],
    },
    { id: "other-watch", name: "Other smart watch", icon: Watch, models: [] },
  ],
  console: [
    {
      id: "playstation",
      name: "PlayStation",
      logo: logo("playstation"),
      models: [
        { id: "ps5-pro", name: "PlayStation 5 Pro", sub: "Release 2024" },
        { id: "ps5-slim", name: "PlayStation 5 Slim", sub: "Release 2023" },
        { id: "ps5", name: "PlayStation 5", sub: "Release 2020" },
        { id: "ps4-pro", name: "PlayStation 4 Pro", sub: "Release 2016" },
        { id: "ps4-slim", name: "PlayStation 4 Slim", sub: "Release 2016" },
        { id: "ps4", name: "PlayStation 4", sub: "Release 2013" },
        { id: "ps-portal", name: "PlayStation Portal", sub: "Release 2023" },
        { id: "ps-controller", name: "DualSense / DualShock controller", sub: "Controller" },
      ],
    },
    {
      id: "xbox",
      name: "Xbox",
      icon: Gamepad2,
      models: [
        { id: "xbox-series-x", name: "Xbox Series X", sub: "Release 2020" },
        { id: "xbox-series-s", name: "Xbox Series S", sub: "Release 2020" },
        { id: "xbox-one-x", name: "Xbox One X", sub: "Release 2017" },
        { id: "xbox-one-s", name: "Xbox One S", sub: "Release 2016" },
        { id: "xbox-one", name: "Xbox One", sub: "Release 2013" },
        { id: "xbox-controller", name: "Xbox wireless controller", sub: "Controller" },
      ],
    },
    {
      id: "nintendo",
      name: "Nintendo Switch",
      icon: Gamepad2,
      models: [
        { id: "switch-2", name: "Nintendo Switch 2", sub: "Release 2025" },
        { id: "switch-oled", name: "Nintendo Switch OLED", sub: "Release 2021" },
        { id: "switch-lite", name: "Nintendo Switch Lite", sub: "Release 2019" },
        { id: "switch", name: "Nintendo Switch", sub: "Release 2017" },
        { id: "switch-controller", name: "Joy-Con / Pro controller", sub: "Controller" },
      ],
    },
    { id: "other-console", name: "Other console", icon: Gamepad2, models: [] },
  ],
  other: [
    { id: "digital-camera", name: "Digital camera", icon: Camera, models: [] },
    { id: "monitor", name: "Monitor", icon: Monitor, models: [] },
    { id: "desktop-computer", name: "Desktop computer", icon: Computer, models: [] },
    { id: "headphones", name: "Headphones & earbuds", icon: Headphones, models: [] },
    { id: "speaker", name: "Speaker & audio", icon: Speaker, models: [] },
    { id: "storage-drive", name: "Hard drive / SSD", icon: HardDrive, models: [] },
    { id: "printer", name: "Printer", icon: Printer, models: [] },
    { id: "something-else", name: "Something else", icon: Shapes, models: [] },
  ],
}

/** Laptop brands without a model catalogue — shown after the catalogued ones. */
export const extraLaptopBrands: QuoteBrandOption[] = [
  { id: "surface", name: "Microsoft Surface", icon: Laptop, models: [] },
  { id: "galaxy-book", name: "Samsung Galaxy Book", logo: logo("samsung"), models: [] },
  { id: "razer", name: "Razer", logo: logo("razer"), models: [] },
  { id: "lg-gram", name: "LG gram", logo: logo("lg"), models: [] },
  { id: "alienware", name: "Alienware", logo: logo("alienware"), models: [] },
  { id: "huawei-matebook", name: "Huawei MateBook", logo: logo("huawei"), models: [] },
  { id: "toshiba", name: "Toshiba / Dynabook", logo: logo("toshiba"), models: [] },
  { id: "chromebook", name: "Chromebook", logo: logo("google"), models: [] },
  { id: "gigabyte", name: "Gigabyte / Aorus", icon: Laptop, models: [] },
  { id: "other-laptop", name: "Other laptop brand", icon: Laptop, models: [] },
]

export function isExtraDeviceCategory(value: string): value is ExtraDeviceCategory {
  return value === "watch" || value === "console" || value === "other"
}
