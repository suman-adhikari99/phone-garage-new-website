import { Inter, Instrument_Serif } from "next/font/google"

export const bodyFont = Inter({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-sans",
})

export const displayFont = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
})
