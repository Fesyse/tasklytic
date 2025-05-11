import "@/styles/globals.css"

import { Providers } from "@/components/providers"
import { siteConfig } from "@/lib/site-config"
import { type Metadata } from "next"
import { Geist } from "next/font/google"

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }]
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Tasklytic" />
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
