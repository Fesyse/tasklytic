import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import { Comfortaa } from "next/font/google"
import { type PropsWithChildren } from "react"
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
const comfortaa = Comfortaa({
  subsets: ["latin"],
  variable: "--font-comfortaa"
})

type RootLayoutProps = {
  modal: React.ReactNode
}

export default function RootLayout({
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
        <Providers>
          <Layout>
            {children}
            {modal}
          </Layout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
