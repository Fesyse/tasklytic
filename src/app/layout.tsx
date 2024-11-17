import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { fileRouter } from "@/server/file-upload"
import "@/styles/globals.css"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin"
import { Analytics } from "@vercel/analytics/react"
import { type Metadata } from "next"
import { Comfortaa, Recursive } from "next/font/google"
import { type PropsWithChildren } from "react"
import { extractRouterConfig } from "uploadthing/server"

export const metadata: Metadata = {
  title: {
    default: "Tasklytic",
    template: "%s | Tasklytic"
  },
  description:
    "Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool."
}
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa"
})
const recursive = Recursive({
  subsets: ["latin"],
  variable: "--font-recursive"
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
      className={cn(recursive.variable, comfortaa.variable, "font-recursive")}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon.svg" sizes="any" type="image/svg+" />
      </head>
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
