import "@/styles/globals.css"

import { Providers } from "@/components/providers"
import { siteConfig } from "@/lib/site-config"
import { type Metadata } from "next"
import { getLocale } from "next-intl/server"
import { Geist } from "next/font/google"

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: siteConfig.name
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }]
}

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans"
})

export default async function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode
  modal: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html
      lang={locale}
      className={`${geist.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="apple-mobile-web-app-title" content="Tasklytic" />
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body>
        <Providers>
          {children}
          {modal}
        </Providers>
      </body>
    </html>
  )
}
