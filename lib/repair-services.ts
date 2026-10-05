import {
  BatteryCharging,
  Cpu,
  Droplets,
  Gamepad2,
  HardDrive,
  Laptop,
  MonitorSmartphone,
  Smartphone,
  Tablet,
  Watch,
  type LucideIcon,
} from "lucide-react"
import type { QuoteDeviceCategory } from "@/lib/quote-devices"

export const REPAIR_SERVICES_PATH = "/our-services"
export const LAPTOP_REPAIR_PATH = "/laptop-repair"

export interface RepairQuotePreset {
  device?: QuoteDeviceCategory
  brand?: string
  issue?: string
}

export interface RepairService {
  slug: string
  title: string
  menuLabel: string
  tagline: string
  description: string
  highlights: string[]
  badge: string
  image: string
  icon: LucideIcon
  quote?: RepairQuotePreset
  /** Dedicated page for this service; otherwise it links to its section on the services page. */
  page?: string
}

export const repairServices: RepairService[] = [
  {
    slug: "phone-screen-repairs",
    title: "Phone Screen Repairs",
    menuLabel: "Phone Screen Repairs",
    tagline: "From shattered to flawless.",
    description:
      "Cracked, bleeding or unresponsive? We fit premium screens that look, feel and touch exactly like the original.",
    highlights: ["iPhone, Samsung, Pixel & more", "True-tone colour accuracy", "Most fixed while you wait"],
    badge: "Same day",
    image: "/images/services/phone-screen-repairs.jpg",
    icon: Smartphone,
    quote: { device: "mobile", issue: "screen" },
  },
  {
    slug: "laptop-repairs",
    title: "Laptop Repairs",
    menuLabel: "Laptop Repairs",
    tagline: "Back to work, fast.",
    description:
      "MacBooks and Windows laptops brought back to life — screens, keyboards, batteries, hinges and more.",
    highlights: ["MacBook, Dell, HP, Lenovo", "Keyboard & trackpad fixes", "SSD & RAM upgrades"],
    badge: "All brands",
    image: "/images/services/laptop-repairs.jpg",
    icon: Laptop,
    quote: { device: "laptop" },
    page: LAPTOP_REPAIR_PATH,
  },
  {
    slug: "water-damage-repairs",
    title: "Water Damage Repairs",
    menuLabel: "Water Damage Repairs",
    tagline: "Dropped it in? Don't panic.",
    description:
      "Ultrasonic cleaning and board-level treatment to stop corrosion before it spreads. The sooner, the better.",
    highlights: ["Free liquid assessment", "Ultrasonic deep clean", "Data-first recovery"],
    badge: "Act fast",
    image: "/images/services/water-damage-repairs.jpg",
    icon: Droplets,
    quote: { device: "mobile", issue: "water" },
  },
  {
    slug: "oled-display-replacement",
    title: "OLED Screen & Display Replacement",
    menuLabel: "OLED / Display Replacement",
    tagline: "Deep blacks. Vivid colour.",
    description:
      "Full display assemblies with genuine-grade OLED panels — no lines, no dead pixels, no green tint.",
    highlights: ["OEM-grade OLED panels", "Face ID & sensors preserved", "Calibrated brightness"],
    badge: "Premium parts",
    image: "/images/services/oled-display-replacement.jpg",
    icon: MonitorSmartphone,
    quote: { device: "mobile", issue: "screen" },
  },
  {
    slug: "apple-watch-repairs",
    title: "Apple Watch Repairs",
    menuLabel: "Apple Watch Repairs",
    tagline: "Small device. Precision care.",
    description:
      "Screen, glass and battery repairs for every Apple Watch series, sealed with care to keep it water-ready.",
    highlights: ["Series 3 to Ultra", "Glass & display repairs", "Battery replacements"],
    badge: "Precision",
    image: "/images/services/apple-watch-repairs.jpg",
    icon: Watch,
    quote: { device: "watch", brand: "apple-watch" },
  },
  {
    slug: "ipad-repairs",
    title: "iPad Repairs",
    menuLabel: "iPad Repairs",
    tagline: "Your canvas, restored.",
    description:
      "Cracked glass, tired batteries or a dead charging port — every iPad, from mini to Pro, made whole again.",
    highlights: ["iPad, Air, mini & Pro", "Glass & LCD replacement", "Charging port & battery"],
    badge: "Every model",
    image: "/images/services/ipad-repairs.jpg",
    icon: Tablet,
    quote: { device: "tablet", brand: "ipad" },
  },
  {
    slug: "data-recovery",
    title: "Data Recovery",
    menuLabel: "Data Recovery",
    tagline: "Your memories, recovered.",
    description:
      "Photos, contacts and files rescued from dead, dropped or water-damaged devices — handled with total privacy.",
    highlights: ["Phones, laptops & drives", "Dead & damaged devices", "Confidential handling"],
    badge: "Private",
    image: "/images/services/data-recovery.jpg",
    icon: HardDrive,
    quote: { issue: "data" },
  },
  {
    slug: "motherboard-repairs",
    title: "Motherboard Repairs",
    menuLabel: "Motherboard Repairs",
    tagline: "Micro-soldering mastery.",
    description:
      "When others say it's unrepairable, we go board-level — fixing no-power, no-charge and short-circuit faults.",
    highlights: ["Micro-soldering experts", "No power & boot loops", "Chip-level diagnostics"],
    badge: "Expert level",
    image: "/images/services/motherboard-repairs.jpg",
    icon: Cpu,
    quote: { issue: "motherboard" },
  },
  {
    slug: "gaming-console-repairs",
    title: "PS4 / PS5 Console Repairs",
    menuLabel: "PS4 / PS5 Console Repairs",
    tagline: "Get back in the game.",
    description:
      "HDMI ports, overheating, disc drives and controllers — your PlayStation fixed and ready for the next match.",
    highlights: ["HDMI port replacement", "Overheating & fan service", "Controller drift fixes"],
    badge: "Gamers' choice",
    image: "/images/services/gaming-console-repairs.jpg",
    icon: Gamepad2,
    quote: { device: "console", brand: "playstation" },
  },
  {
    slug: "parts-replacement",
    title: "Screen, Charging Port, Battery & Glass Replacement",
    menuLabel: "Port, Battery & Glass Replacement",
    tagline: "The everyday fixes, done right.",
    description:
      "Cracked screen, loose charging port, fading battery or smashed back glass — swapped quickly with quality parts.",
    highlights: ["Cracked screen replacement", "Charging port & battery", "Back glass replacement"],
    badge: "Quick fix",
    image: "/images/services/parts-replacement.jpg",
    icon: BatteryCharging,
    quote: { device: "mobile" },
  },
]

export function getRepairServiceHref(slug: string) {
  return `${REPAIR_SERVICES_PATH}#${slug}`
}

export function getRepairServicePageHref(service: RepairService) {
  return service.page ?? getRepairServiceHref(service.slug)
}

export function getRepairServiceQuoteHref(service: RepairService) {
  if (!service.quote) return "/quote"
  const params = new URLSearchParams()
  if (service.quote.device) params.set("device", service.quote.device)
  if (service.quote.brand) params.set("brand", service.quote.brand)
  if (service.quote.issue) params.set("issue", service.quote.issue)
  return `/quote?${params.toString()}`
}
