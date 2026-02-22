/*
 * DATA MODEL
 * ----------
 * brands[]         - Device brands (Apple, Samsung, etc.)
 * models[]         - Device models keyed by brandId
 * services[]       - Repair services keyed by modelId (name, time, cost)
 * stores[]         - Physical store locations
 * serviceCategories[] - Top-level service categories
 */

export interface Brand {
  id: string
  name: string
  image: string
  modelCount: number
}

export interface Model {
  id: string
  brandId: string
  name: string
  image: string
  year: string
}

export interface Service {
  id: string
  modelId: string
  name: string
  estimateTime: string
  estimateCost: number
  description: string
}

export interface Store {
  id: string
  name: string
  address: string
  suburb: string
  phone: string
  email: string
  hours: string
  rating: number
  reviewCount: number
  mapUrl: string
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  slug: string
}

export const serviceCategories: ServiceCategory[] = [
  // ── Core repairs ──
  { id: "sc1", name: "Screen Repair", description: "Cracked or broken screen? We fix all types of displays with premium quality parts.", icon: "monitor-smartphone", slug: "screen-repair" },
  { id: "sc2", name: "Battery Replacement", description: "Restore your device's battery life with genuine replacement batteries.", icon: "battery-charging", slug: "battery-replacement" },
  { id: "sc3", name: "Camera Repair", description: "Fix blurry photos and broken camera modules — front and rear.", icon: "camera", slug: "camera-repair" },
  { id: "sc4", name: "Charging Port", description: "Can't charge your device? We repair and replace charging ports and connectors.", icon: "plug-zap", slug: "charging-port" },
  { id: "sc5", name: "Water Damage", description: "Professional water damage assessment, ultrasonic cleaning and recovery.", icon: "droplets", slug: "water-damage" },
  { id: "sc7", name: "Back Glass Repair", description: "Replace cracked back glass panels on modern smartphones.", icon: "smartphone", slug: "back-glass" },
  // ── Audio & connectivity ──
  { id: "sc9", name: "Speaker Repair", description: "Fix muffled, crackling or non-working earpiece and loudspeakers.", icon: "volume-2", slug: "speaker-repair" },
  { id: "sc10", name: "Microphone Repair", description: "People can't hear you? We repair and replace faulty microphones.", icon: "mic", slug: "microphone-repair" },
  { id: "sc11", name: "Headphone Jack", description: "Repair or replace broken 3.5mm headphone jacks and audio components.", icon: "headphones", slug: "headphone-jack" },
  // ── Buttons & physical ──
  { id: "sc12", name: "Power Button", description: "Fix stuck, unresponsive or broken power and volume buttons.", icon: "power", slug: "power-button" },
  { id: "sc13", name: "Home Button / Touch ID", description: "Repair or replace faulty home buttons and Touch ID sensors.", icon: "fingerprint", slug: "home-button" },
  { id: "sc14", name: "Vibration Motor", description: "Not vibrating? We replace vibration motors and haptic engines.", icon: "vibrate", slug: "vibration-motor" },
  // ── Sensors & display ──
  { id: "sc15", name: "Face ID Repair", description: "Fix Face ID and facial recognition issues on supported devices.", icon: "scan-face", slug: "face-id-repair" },
  { id: "sc16", name: "LCD / OLED Replacement", description: "Full display assembly replacement with OEM-quality LCD or OLED panels.", icon: "monitor", slug: "lcd-replacement" },
  { id: "sc17", name: "Touch Screen Issues", description: "Ghost touches, unresponsive areas or digitiser problems — we fix it all.", icon: "hand", slug: "touch-screen" },
  // ── Network & connectivity ──
  { id: "sc18", name: "Wi-Fi / Bluetooth Repair", description: "Fix connectivity issues — weak signal, won't connect, or no Wi-Fi/Bluetooth.", icon: "wifi", slug: "wifi-bluetooth" },
  { id: "sc19", name: "Signal / Antenna Repair", description: "No service or weak signal? We repair antenna and network components.", icon: "signal", slug: "signal-repair" },
  { id: "sc20", name: "SIM Card Tray", description: "Stuck or broken SIM tray? We replace SIM card readers and trays.", icon: "credit-card", slug: "sim-card-tray" },
  // ── Software & data ──
  { id: "sc8", name: "Software Issues", description: "Troubleshoot and fix software problems, boot loops, updates and performance.", icon: "settings", slug: "software-issues" },
  { id: "sc6", name: "Data Recovery", description: "Lost your data? Our specialists can recover files from damaged devices.", icon: "hard-drive", slug: "data-recovery" },
  { id: "sc21", name: "Data Transfer", description: "Seamlessly transfer contacts, photos, apps and data between devices.", icon: "arrow-left-right", slug: "data-transfer" },
  { id: "sc22", name: "Virus / Malware Removal", description: "Remove viruses, malware and spyware. Secure your device and data.", icon: "shield-alert", slug: "virus-removal" },
  // ── Accessories & protection ──
  { id: "sc23", name: "Screen Protector", description: "Professional tempered glass and film screen protector installation.", icon: "shield", slug: "screen-protector" },
  { id: "sc24", name: "Device Unlocking", description: "Carrier unlock, iCloud issues, FRP bypass and network unlocking services.", icon: "unlock", slug: "device-unlocking" },
  // ── Laptop-specific ──
  { id: "sc25", name: "Keyboard Repair", description: "Fix sticky, unresponsive or broken laptop keys and keyboard assemblies.", icon: "keyboard", slug: "keyboard-repair" },
  { id: "sc26", name: "Motherboard Repair", description: "Advanced micro-soldering and motherboard-level component repair.", icon: "circuit-board", slug: "motherboard-repair" },
  { id: "sc27", name: "Hinge Repair", description: "Fix loose, broken or stiff laptop hinges and screen assemblies.", icon: "flip-vertical", slug: "hinge-repair" },
  { id: "sc28", name: "Fan / Overheating", description: "Clean, repair or replace cooling fans. Fix overheating and thermal issues.", icon: "thermometer", slug: "fan-overheating" },
  { id: "sc29", name: "SSD / RAM Upgrade", description: "Speed up your device with SSD upgrades and RAM expansion.", icon: "memory-stick", slug: "storage-upgrade" },
  { id: "sc30", name: "Trackpad Repair", description: "Fix unresponsive, clicking or jumping trackpads on laptops.", icon: "mouse-pointer", slug: "trackpad-repair" },
]

/* ─── Device categories ─── */
export type DeviceCategory = "mobile" | "tablet" | "laptop"

export const brands: Brand[] = [
  // Mobile brands
  { id: "apple", name: "Apple", image: "/brands/apple.svg", modelCount: 24 },
  { id: "samsung", name: "Samsung", image: "/brands/samsung.svg", modelCount: 20 },
  { id: "google", name: "Google", image: "/brands/google.svg", modelCount: 12 },
  { id: "huawei", name: "Huawei", image: "/brands/huawei.svg", modelCount: 10 },
  { id: "oppo", name: "OPPO", image: "/brands/oppo.svg", modelCount: 8 },
  { id: "xiaomi", name: "Xiaomi", image: "/brands/xiaomi.svg", modelCount: 6 },
  { id: "oneplus", name: "OnePlus", image: "/brands/oneplus.svg", modelCount: 6 },
  { id: "nokia", name: "Nokia", image: "/brands/nokia.svg", modelCount: 4 },
  { id: "motorola", name: "Motorola", image: "/brands/motorola.svg", modelCount: 3 },
  { id: "sony", name: "Sony", image: "/brands/sony.svg", modelCount: 3 },
  // Tablet brands
  { id: "ipad", name: "Apple iPad", image: "/brands/ipad.svg", modelCount: 16 },
  { id: "samsung-tab", name: "Samsung Tab", image: "/brands/samsung.svg", modelCount: 6 },
  // Laptop brands
  { id: "macbook", name: "Apple MacBook", image: "/brands/apple.svg", modelCount: 6 },
  { id: "dell", name: "Dell", image: "/brands/dell.svg", modelCount: 4 },
  { id: "hp", name: "HP", image: "/brands/hp.svg", modelCount: 4 },
  { id: "lenovo", name: "Lenovo", image: "/brands/lenovo.svg", modelCount: 4 },
  { id: "asus", name: "ASUS", image: "/brands/asus.svg", modelCount: 3 },
  { id: "acer", name: "Acer", image: "/brands/acer.svg", modelCount: 3 },
  { id: "msi", name: "MSI", image: "/brands/msi.svg", modelCount: 2 },
]

/* Maps brand IDs to device categories */
export const brandDeviceCategory: Record<string, DeviceCategory> = {
  apple: "mobile", samsung: "mobile", google: "mobile", huawei: "mobile",
  oppo: "mobile", xiaomi: "mobile", oneplus: "mobile", nokia: "mobile",
  motorola: "mobile", sony: "mobile",
  ipad: "tablet", "samsung-tab": "tablet",
  macbook: "laptop", dell: "laptop", hp: "laptop", lenovo: "laptop",
  asus: "laptop", acer: "laptop", msi: "laptop",
}

export function getBrandsByCategory(category: DeviceCategory): Brand[] {
  return brands.filter((b) => brandDeviceCategory[b.id] === category)
}

export const models: Model[] = [
  // ──── Apple iPhone ────
  { id: "iphone-17-pro-max", brandId: "apple", name: "iPhone 17 Pro Max", image: "", year: "2025" },
  { id: "iphone-17-pro", brandId: "apple", name: "iPhone 17 Pro", image: "", year: "2025" },
  { id: "iphone-17-plus", brandId: "apple", name: "iPhone 17 Plus", image: "", year: "2025" },
  { id: "iphone-17", brandId: "apple", name: "iPhone 17", image: "", year: "2025" },
  { id: "iphone-17-air", brandId: "apple", name: "iPhone 17 Air", image: "", year: "2025" },
  { id: "iphone-16e", brandId: "apple", name: "iPhone 16e", image: "", year: "2025" },
  { id: "iphone-16-pro-max", brandId: "apple", name: "iPhone 16 Pro Max", image: "", year: "2024" },
  { id: "iphone-16-pro", brandId: "apple", name: "iPhone 16 Pro", image: "", year: "2024" },
  { id: "iphone-16-plus", brandId: "apple", name: "iPhone 16 Plus", image: "", year: "2024" },
  { id: "iphone-16", brandId: "apple", name: "iPhone 16", image: "", year: "2024" },
  { id: "iphone-15-pro-max", brandId: "apple", name: "iPhone 15 Pro Max", image: "", year: "2023" },
  { id: "iphone-15-pro", brandId: "apple", name: "iPhone 15 Pro", image: "", year: "2023" },
  { id: "iphone-15-plus", brandId: "apple", name: "iPhone 15 Plus", image: "", year: "2023" },
  { id: "iphone-15", brandId: "apple", name: "iPhone 15", image: "", year: "2023" },
  { id: "iphone-14-pro-max", brandId: "apple", name: "iPhone 14 Pro Max", image: "", year: "2022" },
  { id: "iphone-14-pro", brandId: "apple", name: "iPhone 14 Pro", image: "", year: "2022" },
  { id: "iphone-14-plus", brandId: "apple", name: "iPhone 14 Plus", image: "", year: "2022" },
  { id: "iphone-14", brandId: "apple", name: "iPhone 14", image: "", year: "2022" },
  { id: "iphone-13-pro-max", brandId: "apple", name: "iPhone 13 Pro Max", image: "", year: "2021" },
  { id: "iphone-13-pro", brandId: "apple", name: "iPhone 13 Pro", image: "", year: "2021" },
  { id: "iphone-13", brandId: "apple", name: "iPhone 13", image: "", year: "2021" },
  { id: "iphone-13-mini", brandId: "apple", name: "iPhone 13 Mini", image: "", year: "2021" },
  { id: "iphone-12-pro-max", brandId: "apple", name: "iPhone 12 Pro Max", image: "", year: "2020" },
  { id: "iphone-12-pro", brandId: "apple", name: "iPhone 12 Pro", image: "", year: "2020" },
  { id: "iphone-12", brandId: "apple", name: "iPhone 12", image: "", year: "2020" },
  { id: "iphone-12-mini", brandId: "apple", name: "iPhone 12 Mini", image: "", year: "2020" },
  { id: "iphone-11-pro-max", brandId: "apple", name: "iPhone 11 Pro Max", image: "", year: "2019" },
  { id: "iphone-11-pro", brandId: "apple", name: "iPhone 11 Pro", image: "", year: "2019" },
  { id: "iphone-11", brandId: "apple", name: "iPhone 11", image: "", year: "2019" },
  { id: "iphone-xr", brandId: "apple", name: "iPhone XR", image: "", year: "2018" },
  { id: "iphone-xs-max", brandId: "apple", name: "iPhone XS Max", image: "", year: "2018" },
  { id: "iphone-xs", brandId: "apple", name: "iPhone XS", image: "", year: "2018" },
  { id: "iphone-x", brandId: "apple", name: "iPhone X", image: "", year: "2017" },
  { id: "iphone-se-3", brandId: "apple", name: "iPhone SE 3rd Gen", image: "", year: "2022" },
  { id: "iphone-se-2", brandId: "apple", name: "iPhone SE 2nd Gen", image: "", year: "2020" },
  { id: "iphone-se-1", brandId: "apple", name: "iPhone SE 1st Gen", image: "", year: "2016" },
  { id: "iphone-8-plus", brandId: "apple", name: "iPhone 8 Plus", image: "", year: "2017" },
  { id: "iphone-8", brandId: "apple", name: "iPhone 8", image: "", year: "2017" },
  { id: "iphone-7-plus", brandId: "apple", name: "iPhone 7 Plus", image: "", year: "2016" },
  { id: "iphone-7", brandId: "apple", name: "iPhone 7", image: "", year: "2016" },
  { id: "iphone-6s-plus", brandId: "apple", name: "iPhone 6S Plus", image: "", year: "2015" },
  { id: "iphone-6s", brandId: "apple", name: "iPhone 6S", image: "", year: "2015" },
  { id: "iphone-6-plus", brandId: "apple", name: "iPhone 6 Plus", image: "", year: "2014" },
  { id: "iphone-6", brandId: "apple", name: "iPhone 6", image: "", year: "2014" },
  { id: "iphone-5s", brandId: "apple", name: "iPhone 5S", image: "", year: "2013" },
  { id: "iphone-5c", brandId: "apple", name: "iPhone 5C", image: "", year: "2013" },
  { id: "iphone-5", brandId: "apple", name: "iPhone 5", image: "", year: "2012" },

  // ──── Samsung Galaxy S ────
  { id: "galaxy-s25-ultra", brandId: "samsung", name: "Galaxy S25 Ultra", image: "", year: "2025" },
  { id: "galaxy-s25-plus", brandId: "samsung", name: "Galaxy S25+", image: "", year: "2025" },
  { id: "galaxy-s25", brandId: "samsung", name: "Galaxy S25", image: "", year: "2025" },
  { id: "galaxy-s24-fe", brandId: "samsung", name: "Galaxy S24 FE", image: "", year: "2024" },
  { id: "galaxy-s24-ultra", brandId: "samsung", name: "Galaxy S24 Ultra", image: "", year: "2024" },
  { id: "galaxy-s24-plus", brandId: "samsung", name: "Galaxy S24+", image: "", year: "2024" },
  { id: "galaxy-s24", brandId: "samsung", name: "Galaxy S24", image: "", year: "2024" },
  { id: "galaxy-s23-ultra", brandId: "samsung", name: "Galaxy S23 Ultra", image: "", year: "2023" },
  { id: "galaxy-s23-plus", brandId: "samsung", name: "Galaxy S23+", image: "", year: "2023" },
  { id: "galaxy-s23", brandId: "samsung", name: "Galaxy S23", image: "", year: "2023" },
  { id: "galaxy-s22-ultra", brandId: "samsung", name: "Galaxy S22 Ultra", image: "", year: "2022" },
  { id: "galaxy-s22-plus", brandId: "samsung", name: "Galaxy S22+", image: "", year: "2022" },
  { id: "galaxy-s22", brandId: "samsung", name: "Galaxy S22", image: "", year: "2022" },
  { id: "galaxy-s21-ultra", brandId: "samsung", name: "Galaxy S21 Ultra", image: "", year: "2021" },
  { id: "galaxy-s21-fe", brandId: "samsung", name: "Galaxy S21 FE", image: "", year: "2022" },
  { id: "galaxy-s21-plus", brandId: "samsung", name: "Galaxy S21+", image: "", year: "2021" },
  { id: "galaxy-s21", brandId: "samsung", name: "Galaxy S21", image: "", year: "2021" },
  { id: "galaxy-s20-ultra", brandId: "samsung", name: "Galaxy S20 Ultra", image: "", year: "2020" },
  { id: "galaxy-s20-fe", brandId: "samsung", name: "Galaxy S20 FE", image: "", year: "2020" },
  { id: "galaxy-s20-plus", brandId: "samsung", name: "Galaxy S20+", image: "", year: "2020" },
  { id: "galaxy-s20", brandId: "samsung", name: "Galaxy S20", image: "", year: "2020" },
  { id: "galaxy-s10-plus", brandId: "samsung", name: "Galaxy S10+", image: "", year: "2019" },
  { id: "galaxy-s10", brandId: "samsung", name: "Galaxy S10", image: "", year: "2019" },
  { id: "galaxy-s10e", brandId: "samsung", name: "Galaxy S10e", image: "", year: "2019" },
  { id: "galaxy-s9-plus", brandId: "samsung", name: "Galaxy S9+", image: "", year: "2018" },
  { id: "galaxy-s9", brandId: "samsung", name: "Galaxy S9", image: "", year: "2018" },
  { id: "galaxy-s8-plus", brandId: "samsung", name: "Galaxy S8+", image: "", year: "2017" },
  { id: "galaxy-s8", brandId: "samsung", name: "Galaxy S8", image: "", year: "2017" },
  // ──── Samsung Galaxy Z ────
  { id: "galaxy-z-fold-6", brandId: "samsung", name: "Galaxy Z Fold 6", image: "", year: "2024" },
  { id: "galaxy-z-flip-6", brandId: "samsung", name: "Galaxy Z Flip 6", image: "", year: "2024" },
  { id: "galaxy-z-fold-5", brandId: "samsung", name: "Galaxy Z Fold 5", image: "", year: "2023" },
  { id: "galaxy-z-fold-4", brandId: "samsung", name: "Galaxy Z Fold 4", image: "", year: "2022" },
  { id: "galaxy-z-fold-3", brandId: "samsung", name: "Galaxy Z Fold 3", image: "", year: "2021" },
  { id: "galaxy-z-fold-2", brandId: "samsung", name: "Galaxy Z Fold 2", image: "", year: "2020" },
  { id: "galaxy-z-flip-5", brandId: "samsung", name: "Galaxy Z Flip 5", image: "", year: "2023" },
  { id: "galaxy-z-flip-4", brandId: "samsung", name: "Galaxy Z Flip 4", image: "", year: "2022" },
  { id: "galaxy-z-flip-3", brandId: "samsung", name: "Galaxy Z Flip 3", image: "", year: "2021" },
  // ──── Samsung Galaxy Note ────
  { id: "galaxy-note-20-ultra", brandId: "samsung", name: "Galaxy Note 20 Ultra", image: "", year: "2020" },
  { id: "galaxy-note-20", brandId: "samsung", name: "Galaxy Note 20", image: "", year: "2020" },
  { id: "galaxy-note-10-plus", brandId: "samsung", name: "Galaxy Note 10+", image: "", year: "2019" },
  { id: "galaxy-note-10", brandId: "samsung", name: "Galaxy Note 10", image: "", year: "2019" },
  { id: "galaxy-note-9", brandId: "samsung", name: "Galaxy Note 9", image: "", year: "2018" },
  { id: "galaxy-note-8", brandId: "samsung", name: "Galaxy Note 8", image: "", year: "2017" },
  // ──── Samsung Galaxy A ────
  { id: "galaxy-a56", brandId: "samsung", name: "Galaxy A56 5G", image: "", year: "2025" },
  { id: "galaxy-a36", brandId: "samsung", name: "Galaxy A36 5G", image: "", year: "2025" },
  { id: "galaxy-a26", brandId: "samsung", name: "Galaxy A26 5G", image: "", year: "2025" },
  { id: "galaxy-a16", brandId: "samsung", name: "Galaxy A16 5G", image: "", year: "2024" },
  { id: "galaxy-a55", brandId: "samsung", name: "Galaxy A55", image: "", year: "2024" },
  { id: "galaxy-a54", brandId: "samsung", name: "Galaxy A54", image: "", year: "2023" },
  { id: "galaxy-a53", brandId: "samsung", name: "Galaxy A53", image: "", year: "2022" },
  { id: "galaxy-a52", brandId: "samsung", name: "Galaxy A52", image: "", year: "2021" },
  { id: "galaxy-a51", brandId: "samsung", name: "Galaxy A51", image: "", year: "2020" },
  { id: "galaxy-a50", brandId: "samsung", name: "Galaxy A50", image: "", year: "2019" },
  { id: "galaxy-a34", brandId: "samsung", name: "Galaxy A34", image: "", year: "2023" },
  { id: "galaxy-a32", brandId: "samsung", name: "Galaxy A32", image: "", year: "2021" },
  { id: "galaxy-a21s", brandId: "samsung", name: "Galaxy A21S", image: "", year: "2020" },
  { id: "galaxy-a15", brandId: "samsung", name: "Galaxy A15", image: "", year: "2023" },
  { id: "galaxy-a14", brandId: "samsung", name: "Galaxy A14", image: "", year: "2023" },
  { id: "galaxy-a13", brandId: "samsung", name: "Galaxy A13", image: "", year: "2022" },
  { id: "galaxy-a12", brandId: "samsung", name: "Galaxy A12", image: "", year: "2020" },

  // ──── Google Pixel ────
  { id: "pixel-9a", brandId: "google", name: "Pixel 9a", image: "", year: "2025" },
  { id: "pixel-9-pro-fold", brandId: "google", name: "Pixel 9 Pro Fold", image: "", year: "2024" },
  { id: "pixel-9-pro-xl", brandId: "google", name: "Pixel 9 Pro XL", image: "", year: "2024" },
  { id: "pixel-9-pro", brandId: "google", name: "Pixel 9 Pro", image: "", year: "2024" },
  { id: "pixel-9", brandId: "google", name: "Pixel 9", image: "", year: "2024" },
  { id: "pixel-8-pro", brandId: "google", name: "Pixel 8 Pro", image: "", year: "2023" },
  { id: "pixel-8a", brandId: "google", name: "Pixel 8a", image: "", year: "2024" },
  { id: "pixel-8", brandId: "google", name: "Pixel 8", image: "", year: "2023" },
  { id: "pixel-7-pro", brandId: "google", name: "Pixel 7 Pro", image: "", year: "2022" },
  { id: "pixel-7a", brandId: "google", name: "Pixel 7a", image: "", year: "2023" },
  { id: "pixel-7", brandId: "google", name: "Pixel 7", image: "", year: "2022" },
  { id: "pixel-6-pro", brandId: "google", name: "Pixel 6 Pro", image: "", year: "2021" },
  { id: "pixel-6a", brandId: "google", name: "Pixel 6a", image: "", year: "2022" },
  { id: "pixel-6", brandId: "google", name: "Pixel 6", image: "", year: "2021" },
  { id: "pixel-5a", brandId: "google", name: "Pixel 5a", image: "", year: "2021" },
  { id: "pixel-5", brandId: "google", name: "Pixel 5", image: "", year: "2020" },
  { id: "pixel-4a-5g", brandId: "google", name: "Pixel 4a 5G", image: "", year: "2020" },
  { id: "pixel-4a", brandId: "google", name: "Pixel 4a", image: "", year: "2020" },
  { id: "pixel-4-xl", brandId: "google", name: "Pixel 4 XL", image: "", year: "2019" },
  { id: "pixel-4", brandId: "google", name: "Pixel 4", image: "", year: "2019" },
  { id: "pixel-3a-xl", brandId: "google", name: "Pixel 3a XL", image: "", year: "2019" },
  { id: "pixel-3a", brandId: "google", name: "Pixel 3a", image: "", year: "2019" },
  { id: "pixel-3-xl", brandId: "google", name: "Pixel 3 XL", image: "", year: "2018" },
  { id: "pixel-3", brandId: "google", name: "Pixel 3", image: "", year: "2018" },

  // ──── Huawei ────
  { id: "pura-70-ultra", brandId: "huawei", name: "Pura 70 Ultra", image: "", year: "2024" },
  { id: "pura-70-pro", brandId: "huawei", name: "Pura 70 Pro", image: "", year: "2024" },
  { id: "pura-70", brandId: "huawei", name: "Pura 70", image: "", year: "2024" },
  { id: "mate-60-pro", brandId: "huawei", name: "Mate 60 Pro", image: "", year: "2023" },
  { id: "mate-x5", brandId: "huawei", name: "Mate X5", image: "", year: "2023" },
  { id: "nova-12-ultra", brandId: "huawei", name: "Nova 12 Ultra", image: "", year: "2024" },
  { id: "nova-12-pro", brandId: "huawei", name: "Nova 12 Pro", image: "", year: "2024" },
  { id: "p60-pro", brandId: "huawei", name: "P60 Pro", image: "", year: "2023" },
  { id: "p40-pro", brandId: "huawei", name: "P40 Pro", image: "", year: "2020" },
  { id: "p30-pro", brandId: "huawei", name: "P30 Pro", image: "", year: "2019" },
  { id: "p30", brandId: "huawei", name: "P30", image: "", year: "2019" },
  { id: "p20-pro", brandId: "huawei", name: "P20 Pro", image: "", year: "2018" },
  { id: "p20", brandId: "huawei", name: "P20", image: "", year: "2018" },
  { id: "mate-50-pro", brandId: "huawei", name: "Mate 50 Pro", image: "", year: "2022" },
  { id: "mate-20-pro", brandId: "huawei", name: "Mate 20 Pro", image: "", year: "2018" },
  { id: "mate-10", brandId: "huawei", name: "Mate 10", image: "", year: "2017" },

  // ──── OPPO ────
  { id: "find-x8-pro", brandId: "oppo", name: "Find X8 Pro", image: "", year: "2024" },
  { id: "find-x8", brandId: "oppo", name: "Find X8", image: "", year: "2024" },
  { id: "find-x7-ultra", brandId: "oppo", name: "Find X7 Ultra", image: "", year: "2024" },
  { id: "reno-12-pro", brandId: "oppo", name: "Reno 12 Pro 5G", image: "", year: "2024" },
  { id: "reno-12", brandId: "oppo", name: "Reno 12 5G", image: "", year: "2024" },
  { id: "reno-11-pro", brandId: "oppo", name: "Reno 11 Pro 5G", image: "", year: "2024" },
  { id: "reno-11", brandId: "oppo", name: "Reno 11 5G", image: "", year: "2024" },
  { id: "oppo-a3-pro", brandId: "oppo", name: "A3 Pro", image: "", year: "2024" },
  { id: "oppo-a2-pro", brandId: "oppo", name: "A2 Pro", image: "", year: "2024" },
  { id: "find-x6-pro", brandId: "oppo", name: "Find X6 Pro", image: "", year: "2023" },
  { id: "reno-10-pro", brandId: "oppo", name: "Reno 10 Pro", image: "", year: "2023" },
  { id: "oppo-a77", brandId: "oppo", name: "A77", image: "", year: "2022" },
  { id: "oppo-a73", brandId: "oppo", name: "A73", image: "", year: "2020" },
  { id: "oppo-a54", brandId: "oppo", name: "A54 5G", image: "", year: "2021" },
  { id: "oppo-a53", brandId: "oppo", name: "A53", image: "", year: "2020" },
  { id: "oppo-r17-pro", brandId: "oppo", name: "R17 Pro", image: "", year: "2018" },
  { id: "oppo-r15", brandId: "oppo", name: "R15", image: "", year: "2018" },

  // ──── Xiaomi ────
  { id: "xiaomi-15-ultra", brandId: "xiaomi", name: "15 Ultra", image: "", year: "2025" },
  { id: "xiaomi-15-pro", brandId: "xiaomi", name: "15 Pro", image: "", year: "2025" },
  { id: "xiaomi-15", brandId: "xiaomi", name: "15", image: "", year: "2025" },
  { id: "xiaomi-14-ultra", brandId: "xiaomi", name: "14 Ultra", image: "", year: "2024" },
  { id: "xiaomi-14-pro", brandId: "xiaomi", name: "14 Pro", image: "", year: "2024" },
  { id: "xiaomi-14", brandId: "xiaomi", name: "14", image: "", year: "2024" },
  { id: "xiaomi-14t-pro", brandId: "xiaomi", name: "14T Pro", image: "", year: "2024" },
  { id: "xiaomi-14t", brandId: "xiaomi", name: "14T", image: "", year: "2024" },
  { id: "xiaomi-13-pro", brandId: "xiaomi", name: "13 Pro", image: "", year: "2023" },
  { id: "xiaomi-13", brandId: "xiaomi", name: "13", image: "", year: "2023" },
  { id: "redmi-note-14-pro-plus", brandId: "xiaomi", name: "Redmi Note 14 Pro+", image: "", year: "2025" },
  { id: "redmi-note-14-pro", brandId: "xiaomi", name: "Redmi Note 14 Pro", image: "", year: "2025" },
  { id: "redmi-note-14", brandId: "xiaomi", name: "Redmi Note 14", image: "", year: "2025" },
  { id: "poco-f6-pro", brandId: "xiaomi", name: "Poco F6 Pro", image: "", year: "2024" },
  { id: "poco-f6", brandId: "xiaomi", name: "Poco F6", image: "", year: "2024" },
  { id: "poco-x6-pro", brandId: "xiaomi", name: "Poco X6 Pro", image: "", year: "2024" },
  { id: "poco-x6", brandId: "xiaomi", name: "Poco X6", image: "", year: "2024" },
  { id: "redmi-note-13-pro", brandId: "xiaomi", name: "Redmi Note 13 Pro", image: "", year: "2024" },
  { id: "redmi-note-12", brandId: "xiaomi", name: "Redmi Note 12", image: "", year: "2023" },
  { id: "redmi-note-11-pro", brandId: "xiaomi", name: "Redmi Note 11 Pro 5G", image: "", year: "2022" },
  { id: "redmi-note-10-pro", brandId: "xiaomi", name: "Redmi Note 10 Pro", image: "", year: "2021" },
  { id: "redmi-note-10", brandId: "xiaomi", name: "Redmi Note 10", image: "", year: "2021" },
  { id: "redmi-note-9", brandId: "xiaomi", name: "Redmi Note 9", image: "", year: "2020" },
  { id: "redmi-note-8-pro", brandId: "xiaomi", name: "Redmi Note 8 Pro", image: "", year: "2019" },
  { id: "redmi-note-7", brandId: "xiaomi", name: "Redmi Note 7", image: "", year: "2019" },
  { id: "poco-f5", brandId: "xiaomi", name: "Poco F5", image: "", year: "2023" },
  { id: "poco-f4", brandId: "xiaomi", name: "Poco F4", image: "", year: "2022" },
  { id: "poco-x5-pro", brandId: "xiaomi", name: "Poco X5 Pro", image: "", year: "2023" },
  { id: "poco-x3-pro", brandId: "xiaomi", name: "Poco X3 Pro", image: "", year: "2021" },
  { id: "poco-f1", brandId: "xiaomi", name: "Poco F1", image: "", year: "2018" },

  // ──── OnePlus ────
  { id: "oneplus-13", brandId: "oneplus", name: "13", image: "", year: "2025" },
  { id: "oneplus-13r", brandId: "oneplus", name: "13R", image: "", year: "2025" },
  { id: "oneplus-open", brandId: "oneplus", name: "Open", image: "", year: "2023" },
  { id: "oneplus-12r", brandId: "oneplus", name: "12R", image: "", year: "2024" },
  { id: "oneplus-12", brandId: "oneplus", name: "12", image: "", year: "2024" },
  { id: "oneplus-11", brandId: "oneplus", name: "11", image: "", year: "2023" },
  { id: "oneplus-10-pro", brandId: "oneplus", name: "10 Pro", image: "", year: "2022" },
  { id: "oneplus-10t", brandId: "oneplus", name: "10T 5G", image: "", year: "2022" },
  { id: "oneplus-9-pro", brandId: "oneplus", name: "9 Pro", image: "", year: "2021" },
  { id: "oneplus-9", brandId: "oneplus", name: "9", image: "", year: "2021" },
  { id: "oneplus-8-pro", brandId: "oneplus", name: "8 Pro", image: "", year: "2020" },
  { id: "oneplus-8", brandId: "oneplus", name: "8", image: "", year: "2020" },
  { id: "oneplus-7t-pro", brandId: "oneplus", name: "7T Pro", image: "", year: "2019" },
  { id: "oneplus-7t", brandId: "oneplus", name: "7T", image: "", year: "2019" },
  { id: "oneplus-7-pro", brandId: "oneplus", name: "7 Pro", image: "", year: "2019" },
  { id: "oneplus-7", brandId: "oneplus", name: "7", image: "", year: "2019" },
  { id: "oneplus-6t", brandId: "oneplus", name: "6T", image: "", year: "2018" },
  { id: "oneplus-6", brandId: "oneplus", name: "6", image: "", year: "2018" },

  // ──── Nokia ────
  { id: "nokia-g42", brandId: "nokia", name: "G42 5G", image: "", year: "2023" },
  { id: "nokia-g310", brandId: "nokia", name: "G310 5G", image: "", year: "2024" },
  { id: "nokia-c300", brandId: "nokia", name: "C300", image: "", year: "2024" },
  { id: "nokia-g60", brandId: "nokia", name: "G60", image: "", year: "2022" },
  { id: "nokia-g22", brandId: "nokia", name: "G22", image: "", year: "2023" },
  { id: "nokia-g21", brandId: "nokia", name: "G21", image: "", year: "2022" },
  { id: "nokia-g20", brandId: "nokia", name: "G20", image: "", year: "2021" },
  { id: "nokia-8-1", brandId: "nokia", name: "8.1", image: "", year: "2018" },
  { id: "nokia-7-plus", brandId: "nokia", name: "7 Plus", image: "", year: "2018" },
  { id: "nokia-7-1", brandId: "nokia", name: "7.1", image: "", year: "2018" },

  // ──── Motorola ────
  { id: "moto-edge-50-ultra", brandId: "motorola", name: "Edge 50 Ultra", image: "", year: "2024" },
  { id: "moto-edge-50-pro", brandId: "motorola", name: "Edge 50 Pro", image: "", year: "2024" },
  { id: "moto-edge-50-fusion", brandId: "motorola", name: "Edge 50 Fusion", image: "", year: "2024" },
  { id: "moto-razr-50-ultra", brandId: "motorola", name: "Razr 50 Ultra", image: "", year: "2024" },
  { id: "moto-razr-50", brandId: "motorola", name: "Razr 50", image: "", year: "2024" },
  { id: "moto-g85", brandId: "motorola", name: "Moto G85", image: "", year: "2024" },
  { id: "moto-g-power-2024", brandId: "motorola", name: "Moto G Power (2024)", image: "", year: "2024" },
  { id: "moto-edge-40", brandId: "motorola", name: "Edge 40 Pro", image: "", year: "2023" },
  { id: "moto-g84", brandId: "motorola", name: "Moto G84", image: "", year: "2023" },
  { id: "moto-g-power", brandId: "motorola", name: "Moto G Power (2023)", image: "", year: "2023" },

  // ──── Sony ────
  { id: "xperia-1-vi", brandId: "sony", name: "Xperia 1 VI", image: "", year: "2024" },
  { id: "xperia-10-vi", brandId: "sony", name: "Xperia 10 VI", image: "", year: "2024" },
  { id: "xperia-5-v", brandId: "sony", name: "Xperia 5 V", image: "", year: "2023" },
  { id: "xperia-1-v", brandId: "sony", name: "Xperia 1 V", image: "", year: "2023" },
  { id: "xperia-10-v", brandId: "sony", name: "Xperia 10 V", image: "", year: "2023" },
  { id: "xperia-5-iv", brandId: "sony", name: "Xperia 5 IV", image: "", year: "2022" },
  { id: "xperia-1-iv", brandId: "sony", name: "Xperia 1 IV", image: "", year: "2022" },
  { id: "xperia-xz2", brandId: "sony", name: "Xperia XZ2", image: "", year: "2018" },
  { id: "xperia-xz-premium", brandId: "sony", name: "Xperia XZ Premium", image: "", year: "2017" },

  // ──── iPad ────
  { id: "ipad-pro-13-m4", brandId: "ipad", name: "iPad Pro 13\" M4", image: "", year: "2024" },
  { id: "ipad-pro-11-m4", brandId: "ipad", name: "iPad Pro 11\" M4", image: "", year: "2024" },
  { id: "ipad-pro-12-9-6", brandId: "ipad", name: "iPad Pro 12.9\" (6th Gen M2)", image: "", year: "2022" },
  { id: "ipad-pro-12-9-5", brandId: "ipad", name: "iPad Pro 12.9\" (5th Gen M1)", image: "", year: "2021" },
  { id: "ipad-pro-12-9-4", brandId: "ipad", name: "iPad Pro 12.9\" (4th Gen)", image: "", year: "2020" },
  { id: "ipad-pro-12-9-3", brandId: "ipad", name: "iPad Pro 12.9\" (3rd Gen)", image: "", year: "2018" },
  { id: "ipad-pro-11-4", brandId: "ipad", name: "iPad Pro 11\" (4th Gen M2)", image: "", year: "2022" },
  { id: "ipad-pro-11-3", brandId: "ipad", name: "iPad Pro 11\" (3rd Gen M1)", image: "", year: "2021" },
  { id: "ipad-pro-11-2", brandId: "ipad", name: "iPad Pro 11\" (2nd Gen)", image: "", year: "2020" },
  { id: "ipad-pro-11-1", brandId: "ipad", name: "iPad Pro 11\" (1st Gen)", image: "", year: "2018" },
  { id: "ipad-air-6-m2", brandId: "ipad", name: "iPad Air 13\" M2", image: "", year: "2024" },
  { id: "ipad-air-6-11-m2", brandId: "ipad", name: "iPad Air 11\" M2", image: "", year: "2024" },
  { id: "ipad-air-5", brandId: "ipad", name: "iPad Air 5 (M1)", image: "", year: "2022" },
  { id: "ipad-air-4", brandId: "ipad", name: "iPad Air 4", image: "", year: "2020" },
  { id: "ipad-air-3", brandId: "ipad", name: "iPad Air 3", image: "", year: "2019" },
  { id: "ipad-10", brandId: "ipad", name: "iPad 10th Gen", image: "", year: "2022" },
  { id: "ipad-9", brandId: "ipad", name: "iPad 9th Gen", image: "", year: "2021" },
  { id: "ipad-8", brandId: "ipad", name: "iPad 8th Gen", image: "", year: "2020" },
  { id: "ipad-7", brandId: "ipad", name: "iPad 7th Gen", image: "", year: "2019" },
  { id: "ipad-6", brandId: "ipad", name: "iPad 6th Gen", image: "", year: "2018" },
  { id: "ipad-mini-7", brandId: "ipad", name: "iPad Mini 7 (A17 Pro)", image: "", year: "2024" },
  { id: "ipad-mini-6", brandId: "ipad", name: "iPad Mini 6", image: "", year: "2021" },
  { id: "ipad-mini-5", brandId: "ipad", name: "iPad Mini 5", image: "", year: "2019" },
  { id: "ipad-mini-4", brandId: "ipad", name: "iPad Mini 4", image: "", year: "2015" },

  // ──── Samsung Tab ────
  { id: "tab-s10-ultra", brandId: "samsung-tab", name: "Tab S10 Ultra", image: "", year: "2024" },
  { id: "tab-s10-plus", brandId: "samsung-tab", name: "Tab S10+", image: "", year: "2024" },
  { id: "tab-s9-ultra", brandId: "samsung-tab", name: "Tab S9 Ultra", image: "", year: "2023" },
  { id: "tab-s9-fe-plus", brandId: "samsung-tab", name: "Tab S9 FE+", image: "", year: "2023" },
  { id: "tab-s9-fe", brandId: "samsung-tab", name: "Tab S9 FE", image: "", year: "2023" },
  { id: "tab-s9-plus", brandId: "samsung-tab", name: "Tab S9+", image: "", year: "2023" },
  { id: "tab-s9", brandId: "samsung-tab", name: "Tab S9", image: "", year: "2023" },
  { id: "tab-s8-ultra", brandId: "samsung-tab", name: "Tab S8 Ultra", image: "", year: "2022" },
  { id: "tab-s8-plus", brandId: "samsung-tab", name: "Tab S8+", image: "", year: "2022" },
  { id: "tab-s8", brandId: "samsung-tab", name: "Tab S8", image: "", year: "2022" },
  { id: "tab-s7-fe", brandId: "samsung-tab", name: "Tab S7 FE", image: "", year: "2021" },
  { id: "tab-s7-plus", brandId: "samsung-tab", name: "Tab S7+", image: "", year: "2020" },
  { id: "tab-s7", brandId: "samsung-tab", name: "Tab S7", image: "", year: "2020" },
  { id: "tab-s6-lite", brandId: "samsung-tab", name: "Tab S6 Lite", image: "", year: "2020" },
  { id: "tab-a8", brandId: "samsung-tab", name: "Tab A8", image: "", year: "2021" },
  { id: "tab-a7", brandId: "samsung-tab", name: "Tab A7", image: "", year: "2020" },

  // ──── MacBook ────
  { id: "macbook-pro-16-m4", brandId: "macbook", name: "MacBook Pro 16\" M4 Pro/Max", image: "", year: "2024" },
  { id: "macbook-pro-14-m4", brandId: "macbook", name: "MacBook Pro 14\" M4", image: "", year: "2024" },
  { id: "macbook-pro-16-m3", brandId: "macbook", name: "MacBook Pro 16\" M3", image: "", year: "2023" },
  { id: "macbook-pro-14-m3", brandId: "macbook", name: "MacBook Pro 14\" M3", image: "", year: "2023" },
  { id: "macbook-pro-16-m2", brandId: "macbook", name: "MacBook Pro 16\" M2", image: "", year: "2023" },
  { id: "macbook-pro-14-m2", brandId: "macbook", name: "MacBook Pro 14\" M2", image: "", year: "2023" },
  { id: "macbook-pro-16-m1", brandId: "macbook", name: "MacBook Pro 16\" M1 Pro/Max", image: "", year: "2021" },
  { id: "macbook-pro-14-m1", brandId: "macbook", name: "MacBook Pro 14\" M1 Pro/Max", image: "", year: "2021" },
  { id: "macbook-pro-13-m2", brandId: "macbook", name: "MacBook Pro 13\" M2", image: "", year: "2022" },
  { id: "macbook-pro-13-m1", brandId: "macbook", name: "MacBook Pro 13\" M1", image: "", year: "2020" },
  { id: "macbook-air-15-m3", brandId: "macbook", name: "MacBook Air 15\" M3", image: "", year: "2024" },
  { id: "macbook-air-13-m3", brandId: "macbook", name: "MacBook Air 13\" M3", image: "", year: "2024" },
  { id: "macbook-air-15-m2", brandId: "macbook", name: "MacBook Air 15\" M2", image: "", year: "2023" },
  { id: "macbook-air-13-m2", brandId: "macbook", name: "MacBook Air 13\" M2", image: "", year: "2022" },
  { id: "macbook-air-m1", brandId: "macbook", name: "MacBook Air M1", image: "", year: "2020" },
  { id: "macbook-pro-16-2019", brandId: "macbook", name: "MacBook Pro 16\" (2019)", image: "", year: "2019" },
  { id: "macbook-pro-15-2018", brandId: "macbook", name: "MacBook Pro 15\" (2018)", image: "", year: "2018" },
  { id: "macbook-pro-13-2020-intel", brandId: "macbook", name: "MacBook Pro 13\" (2020 Intel)", image: "", year: "2020" },
  { id: "macbook-air-2020-intel", brandId: "macbook", name: "MacBook Air (2020 Intel)", image: "", year: "2020" },
  { id: "macbook-air-2019", brandId: "macbook", name: "MacBook Air (2019)", image: "", year: "2019" },
  { id: "macbook-air-2018", brandId: "macbook", name: "MacBook Air (2018)", image: "", year: "2018" },

  // ──── Dell ────
  { id: "dell-xps-16-2024", brandId: "dell", name: "XPS 16 (2024)", image: "", year: "2024" },
  { id: "dell-xps-14-2024", brandId: "dell", name: "XPS 14 (2024)", image: "", year: "2024" },
  { id: "dell-xps-13-2024", brandId: "dell", name: "XPS 13 (2024)", image: "", year: "2024" },
  { id: "dell-xps-15", brandId: "dell", name: "XPS 15 (2023)", image: "", year: "2023" },
  { id: "dell-xps-13", brandId: "dell", name: "XPS 13 (2023)", image: "", year: "2023" },
  { id: "dell-inspiron-16", brandId: "dell", name: "Inspiron 16", image: "", year: "2024" },
  { id: "dell-inspiron-15", brandId: "dell", name: "Inspiron 15", image: "", year: "2023" },
  { id: "dell-inspiron-14", brandId: "dell", name: "Inspiron 14", image: "", year: "2023" },
  { id: "dell-latitude-14", brandId: "dell", name: "Latitude 14", image: "", year: "2023" },
  { id: "dell-latitude-7440", brandId: "dell", name: "Latitude 7440", image: "", year: "2024" },
  { id: "dell-g16-gaming", brandId: "dell", name: "G16 Gaming", image: "", year: "2024" },

  // ──── HP ────
  { id: "hp-spectre-x360-2024", brandId: "hp", name: "Spectre x360 14 (2024)", image: "", year: "2024" },
  { id: "hp-omnibook-ultra", brandId: "hp", name: "OmniBook Ultra 14", image: "", year: "2024" },
  { id: "hp-envy-16-2024", brandId: "hp", name: "Envy 16 (2024)", image: "", year: "2024" },
  { id: "hp-spectre-x360", brandId: "hp", name: "Spectre x360 (2023)", image: "", year: "2023" },
  { id: "hp-envy-15", brandId: "hp", name: "Envy 15", image: "", year: "2023" },
  { id: "hp-pavilion-plus-14", brandId: "hp", name: "Pavilion Plus 14", image: "", year: "2024" },
  { id: "hp-pavilion-15", brandId: "hp", name: "Pavilion 15", image: "", year: "2023" },
  { id: "hp-elitebook-840-g11", brandId: "hp", name: "EliteBook 840 G11", image: "", year: "2024" },
  { id: "hp-elitebook-840", brandId: "hp", name: "EliteBook 840", image: "", year: "2023" },
  { id: "hp-omen-16", brandId: "hp", name: "OMEN 16", image: "", year: "2024" },

  // ──── Lenovo ────
  { id: "lenovo-thinkpad-x1-2024", brandId: "lenovo", name: "ThinkPad X1 Carbon Gen 12", image: "", year: "2024" },
  { id: "lenovo-yoga-pro-9i", brandId: "lenovo", name: "Yoga Pro 9i", image: "", year: "2024" },
  { id: "lenovo-yoga-slim-7x", brandId: "lenovo", name: "Yoga Slim 7x", image: "", year: "2024" },
  { id: "lenovo-legion-pro-7i", brandId: "lenovo", name: "Legion Pro 7i", image: "", year: "2024" },
  { id: "lenovo-thinkpad-x1", brandId: "lenovo", name: "ThinkPad X1 Carbon Gen 11", image: "", year: "2023" },
  { id: "lenovo-yoga-9i", brandId: "lenovo", name: "Yoga 9i", image: "", year: "2023" },
  { id: "lenovo-ideapad-5", brandId: "lenovo", name: "IdeaPad 5", image: "", year: "2023" },
  { id: "lenovo-ideapad-pro-5i", brandId: "lenovo", name: "IdeaPad Pro 5i", image: "", year: "2024" },
  { id: "lenovo-legion-5", brandId: "lenovo", name: "Legion 5", image: "", year: "2023" },

  // ──── ASUS ────
  { id: "asus-zenbook-14-2024", brandId: "asus", name: "ZenBook 14 OLED (2024)", image: "", year: "2024" },
  { id: "asus-zenbook-s-16", brandId: "asus", name: "ZenBook S 16", image: "", year: "2024" },
  { id: "asus-rog-zephyrus-g16-2024", brandId: "asus", name: "ROG Zephyrus G16 (2024)", image: "", year: "2024" },
  { id: "asus-rog-strix-g16", brandId: "asus", name: "ROG Strix G16 (2024)", image: "", year: "2024" },
  { id: "asus-proart-studiobook", brandId: "asus", name: "ProArt Studiobook 16", image: "", year: "2024" },
  { id: "asus-zenbook-14", brandId: "asus", name: "ZenBook 14 (2023)", image: "", year: "2023" },
  { id: "asus-rog-zephyrus", brandId: "asus", name: "ROG Zephyrus G14 (2023)", image: "", year: "2023" },
  { id: "asus-vivobook-s-15", brandId: "asus", name: "VivoBook S 15", image: "", year: "2024" },
  { id: "asus-vivobook-15", brandId: "asus", name: "VivoBook 15 (2023)", image: "", year: "2023" },

  // ──── Acer ────
  { id: "acer-swift-go-14-2024", brandId: "acer", name: "Swift Go 14 (2024)", image: "", year: "2024" },
  { id: "acer-swift-x-14", brandId: "acer", name: "Swift X 14", image: "", year: "2024" },
  { id: "acer-nitro-v-16", brandId: "acer", name: "Nitro V 16", image: "", year: "2024" },
  { id: "acer-predator-helios-16", brandId: "acer", name: "Predator Helios 16", image: "", year: "2024" },
  { id: "acer-swift-5", brandId: "acer", name: "Swift 5 (2023)", image: "", year: "2023" },
  { id: "acer-aspire-5", brandId: "acer", name: "Aspire 5 (2023)", image: "", year: "2023" },
  { id: "acer-aspire-go-15", brandId: "acer", name: "Aspire Go 15", image: "", year: "2024" },
  { id: "acer-nitro-5", brandId: "acer", name: "Nitro 5 (2023)", image: "", year: "2023" },

  // ──── MSI ────
  { id: "msi-stealth-18-2024", brandId: "msi", name: "Stealth 18 AI Studio", image: "", year: "2024" },
  { id: "msi-prestige-16-2024", brandId: "msi", name: "Prestige 16 AI Evo", image: "", year: "2024" },
  { id: "msi-raider-18-hx", brandId: "msi", name: "Raider 18 HX", image: "", year: "2024" },
  { id: "msi-creator-16-2024", brandId: "msi", name: "Creator 16 AI Studio", image: "", year: "2024" },
  { id: "msi-stealth-16", brandId: "msi", name: "Stealth 16 (2023)", image: "", year: "2023" },
  { id: "msi-modern-14", brandId: "msi", name: "Modern 14 (2023)", image: "", year: "2023" },
  { id: "msi-thin-15", brandId: "msi", name: "Thin 15", image: "", year: "2024" },
]

// Services for a generic model (same structure replicated per model)
function generateServices(modelId: string): Service[] {
  return [
    // Core repairs
    { id: `${modelId}-screen`, modelId, name: "Screen Repair", estimateTime: "30-60 min", estimateCost: 149, description: "Premium quality screen replacement with warranty" },
    { id: `${modelId}-battery`, modelId, name: "Battery Replacement", estimateTime: "20-40 min", estimateCost: 79, description: "Genuine battery replacement to restore full capacity" },
    { id: `${modelId}-camera`, modelId, name: "Camera Repair", estimateTime: "30-60 min", estimateCost: 119, description: "Fix front or rear camera modules" },
    { id: `${modelId}-charging`, modelId, name: "Charging Port", estimateTime: "30-45 min", estimateCost: 89, description: "Charging port replacement and cleaning" },
    { id: `${modelId}-water`, modelId, name: "Water Damage", estimateTime: "1-3 hours", estimateCost: 99, description: "Water damage assessment, cleaning and repair" },
    { id: `${modelId}-backglass`, modelId, name: "Back Glass Repair", estimateTime: "45-90 min", estimateCost: 129, description: "Premium back glass panel replacement" },
    // Audio & connectivity
    { id: `${modelId}-speaker`, modelId, name: "Speaker Repair", estimateTime: "20-40 min", estimateCost: 69, description: "Fix muffled or non-working speakers" },
    { id: `${modelId}-microphone`, modelId, name: "Microphone Repair", estimateTime: "20-40 min", estimateCost: 69, description: "Microphone replacement for call issues" },
    { id: `${modelId}-headphone-jack`, modelId, name: "Headphone Jack", estimateTime: "20-30 min", estimateCost: 59, description: "Headphone jack repair or replacement" },
    // Buttons & physical
    { id: `${modelId}-power-button`, modelId, name: "Power Button", estimateTime: "20-40 min", estimateCost: 69, description: "Power/volume button repair" },
    { id: `${modelId}-home-button`, modelId, name: "Home Button / Touch ID", estimateTime: "30-45 min", estimateCost: 89, description: "Home button and Touch ID repair" },
    { id: `${modelId}-vibration`, modelId, name: "Vibration Motor", estimateTime: "20-30 min", estimateCost: 59, description: "Vibration motor / haptic engine replacement" },
    // Sensors & display
    { id: `${modelId}-face-id`, modelId, name: "Face ID Repair", estimateTime: "45-90 min", estimateCost: 179, description: "Face ID sensor repair and calibration" },
    { id: `${modelId}-lcd`, modelId, name: "LCD / OLED Replacement", estimateTime: "30-60 min", estimateCost: 169, description: "Full display assembly replacement" },
    { id: `${modelId}-touch-screen`, modelId, name: "Touch Screen Issues", estimateTime: "30-60 min", estimateCost: 139, description: "Digitiser and touch layer repair" },
    // Network & connectivity
    { id: `${modelId}-wifi`, modelId, name: "Wi-Fi / Bluetooth Repair", estimateTime: "30-60 min", estimateCost: 89, description: "Wi-Fi and Bluetooth module repair" },
    { id: `${modelId}-signal`, modelId, name: "Signal / Antenna Repair", estimateTime: "30-60 min", estimateCost: 89, description: "Antenna and signal component repair" },
    { id: `${modelId}-sim-tray`, modelId, name: "SIM Card Tray", estimateTime: "15-25 min", estimateCost: 49, description: "SIM card reader and tray replacement" },
    // Software & data
    { id: `${modelId}-software`, modelId, name: "Software Fix", estimateTime: "30-60 min", estimateCost: 59, description: "Software troubleshooting and optimization" },
    { id: `${modelId}-data-recovery`, modelId, name: "Data Recovery", estimateTime: "1-4 hours", estimateCost: 129, description: "Data recovery from damaged devices" },
    { id: `${modelId}-data-transfer`, modelId, name: "Data Transfer", estimateTime: "30-60 min", estimateCost: 49, description: "Transfer data between old and new devices" },
    { id: `${modelId}-virus`, modelId, name: "Virus / Malware Removal", estimateTime: "30-60 min", estimateCost: 69, description: "Remove viruses and secure your device" },
    // Accessories
    { id: `${modelId}-screen-protector`, modelId, name: "Screen Protector", estimateTime: "10-15 min", estimateCost: 29, description: "Professional screen protector installation" },
    { id: `${modelId}-unlocking`, modelId, name: "Device Unlocking", estimateTime: "30-60 min", estimateCost: 79, description: "Carrier and network unlocking" },
    // Laptop-specific
    { id: `${modelId}-keyboard`, modelId, name: "Keyboard Repair", estimateTime: "45-90 min", estimateCost: 149, description: "Keyboard replacement or key repair" },
    { id: `${modelId}-motherboard`, modelId, name: "Motherboard Repair", estimateTime: "2-5 hours", estimateCost: 249, description: "Motherboard-level micro-soldering repair" },
    { id: `${modelId}-hinge`, modelId, name: "Hinge Repair", estimateTime: "45-90 min", estimateCost: 129, description: "Laptop hinge and bracket repair" },
    { id: `${modelId}-fan`, modelId, name: "Fan / Overheating", estimateTime: "30-60 min", estimateCost: 89, description: "Fan cleaning, replacement and thermal paste" },
    { id: `${modelId}-storage`, modelId, name: "SSD / RAM Upgrade", estimateTime: "30-60 min", estimateCost: 99, description: "Storage and memory upgrades" },
    { id: `${modelId}-trackpad`, modelId, name: "Trackpad Repair", estimateTime: "30-60 min", estimateCost: 109, description: "Trackpad repair or replacement" },
  ]
}

// Build services for all models
export const services: Service[] = models.flatMap((m) => generateServices(m.id))

export const stores: Store[] = [
  {
    id: "lidcombe",
    name: "Lidcombe",
    address: "27 Church St, Lidcombe NSW 2141",
    suburb: "Lidcombe",
    phone: "0403983009",
    email: "info@phonegarage.com.au",
    hours: "Mon-Fri 9am-7pm, Sat-Sun 10am-5:30pm",
    rating: 4.9,
    reviewCount: 283,
    mapUrl: "https://www.google.com/maps?q=Phone+Garage,+27+Church+St,+Lidcombe+NSW+2141&output=embed",
  },
]

export const reviews = [
  { id: "r1", name: "Sarah M.", rating: 5, text: "Incredible service! My iPhone screen was fixed in under 30 minutes. The quality is just like new.", store: "Lidcombe" },
  { id: "r2", name: "James T.", rating: 5, text: "Best repair shop in Sydney. Fair prices, fast turnaround, and they actually explain what they're doing.", store: "Lidcombe" },
  { id: "r3", name: "Lisa K.", rating: 5, text: "Thought my phone was gone after water damage. They saved everything including my data. Highly recommend.", store: "Lidcombe" },
  { id: "r4", name: "David R.", rating: 4, text: "Quick battery replacement for my Samsung. Phone feels brand new again. Great warranty too.", store: "Lidcombe" },
  { id: "r5", name: "Emma W.", rating: 5, text: "Professional, transparent pricing, and incredibly fast. Won't go anywhere else for phone repairs.", store: "Lidcombe" },
  { id: "r6", name: "Michael P.", rating: 5, text: "Camera was completely broken after a drop. Fixed same day with genuine parts. Outstanding work.", store: "Lidcombe" },
]

export const faqs = [
  {
    question: "What types of devices do you repair?",
    answer:
      "Phone Garage repairs phones, tablets, laptops, MacBooks, and game consoles including PlayStation, Xbox, and Nintendo Switch.",
  },
  {
    question: "How long does a typical repair take?",
    answer:
      "Most repairs are completed on the spot while you shop. Some complex repairs or rare parts may require a few days.",
  },
  {
    question: "Do you offer a warranty on repairs?",
    answer:
      "Yes, all our repairs come with a six-month warranty for your peace of mind.",
  },
  {
    question: "Can I get a free quote before approving repairs?",
    answer:
      "Absolutely! We provide free quotes for all devices, and you will only pay if you decide to proceed with the repair.",
  },
  {
    question: "Do you use original parts for repairs?",
    answer:
      "We stock both OEM (original) and high-quality aftermarket parts to suit your needs and budget.",
  },
  {
    question: "Do I need an appointment, or can I walk in?",
    answer:
      "No appointment necessary—walk-ins are welcome. You can also mail in your device for repair if you can't visit in person.",
  },
  {
    question: "Are your technicians qualified and experienced?",
    answer:
      "Our team has over 10 years of experience and consistently upholds high standards in all repair services.",
  },
  {
    question: "Is my data safe during repair?",
    answer:
      "We treat customer privacy seriously, but recommend backing up your device before bringing it in for service.",
  },
]

export function getModelsByBrand(brandId: string): Model[] {
  return models.filter((m) => m.brandId === brandId)
}

export function getServicesByModel(modelId: string): Service[] {
  return services.filter((s) => s.modelId === modelId)
}

export function getBrandById(brandId: string): Brand | undefined {
  return brands.find((b) => b.id === brandId)
}

export function getModelById(modelId: string): Model | undefined {
  return models.find((m) => m.id === modelId)
}

export function getStoreById(storeId: string): Store | undefined {
  return stores.find((s) => s.id === storeId)
}
