import React from "react"
import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Phone Garage | Expert Mobile Phone Repairs Australia',
  description: 'Professional mobile phone repair services in Australia. Same-day screen replacements, battery repairs, water damage recovery and more. Quality parts, expert technicians, warranty on all repairs.',
  keywords: ['phone repair', 'mobile repair', 'screen replacement', 'battery replacement', 'Australia', 'Phone Garage'],
  openGraph: {
    title: 'Phone Garage | Expert Mobile Phone Repairs',
    description: 'Professional mobile phone repair services. Same-day repairs with warranty.',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#3CB043',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Lugrasimo&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
