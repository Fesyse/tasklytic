import "@/styles/globals.css"

import { type Metadata } from "next"
import { Geist } from "next/font/google"

import { siteConfig } from "@/lib/site-config"
import { TRPCReactProvider } from "@/trpc/react"
import { ThemeProvider } from "next-themes"

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
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
      </head>
      <body>
        <TRPCReactProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </TRPCReactProvider>
      </body>
    </html>
  )
}
