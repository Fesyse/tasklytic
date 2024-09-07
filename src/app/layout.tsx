import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import { Comfortaa } from "next/font/google"
import { type PropsWithChildren } from "react"
import { extractRouterConfig } from "uploadthing/server"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { fileRouter } from "@/server/file-upload"
import "@/styles/globals.css"

export const metadata: Metadata = {
  title: {
    default: "Tasklytic",
    template: "%s | Tasklytic"
  },
  description:
    "Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool.",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
}
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa"
})

type RootLayoutProps = {
  modal: React.ReactNode
}

export default async function RootLayout({
  children,
  modal
}: Readonly<PropsWithChildren<RootLayoutProps>>) {
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, comfortaa.variable, "font-geist-sans")}
    >
      <head />
      <body>
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <Providers>
          {children}
          {modal}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
