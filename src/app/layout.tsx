import { Analytics } from "@vercel/analytics/react"
import { type Metadata } from "next"
import { Comfortaa, Raleway } from "next/font/google"
import { PropsWithChildren } from "react"
import { Layout } from "@/components/layout"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
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

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway"
})
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa"
})

type RootLayoutProps = {
  settings: React.ReactNode
}

export default function RootLayout({
  children,
  settings
}: Readonly<PropsWithChildren<RootLayoutProps>>) {
  return (
    <html
      lang="en"
      className={cn(raleway.variable, comfortaa.variable, "font-raleway")}
    >
      <head />
      <body>
        <Providers>
          <Layout>
            {children}
            {settings}
          </Layout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
