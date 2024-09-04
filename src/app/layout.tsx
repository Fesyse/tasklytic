import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import { Comfortaa } from "next/font/google"
import { type PropsWithChildren } from "react"
import { Layout } from "@/components/layout"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import { api } from "@/trpc/server"

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
  const projects = await api.project.getAll()
  return (
    <html
      lang="en"
      className={cn(GeistSans.variable, comfortaa.variable, "font-geist-sans")}
    >
      <head />
      <body>
        <Providers>
          <Layout projects={projects}>
            {children}
            {modal}
          </Layout>
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
