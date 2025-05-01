import "@/styles/globals.css"

import { type Metadata } from "next"
import { Geist } from "next/font/google"

import { TRPCReactProvider } from "@/trpc/react"
import { ThemeProvider } from "next-themes"

export const metadata: Metadata = {
  title: "froo",
  description:
    "Improve your discipline, improve your life. Froo helps you build the habits you need to succeed.",
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
