import { Analytics } from "@vercel/analytics/react"
import { GeistSans } from "geist/font/sans"
import { type Metadata } from "next"
import "@/styles/globals.css"
import { TRPCReactProvider } from "@/trpc/react"

export const metadata: Metadata = {
  title: "Tasklytic",
  description:
    "Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool.",
  icons: [{ rel: "icon", url: "/favicon.ico" }]
}

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Analytics />
      </body>
    </html>
  )
}
