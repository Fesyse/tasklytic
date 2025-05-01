import { Icons } from "@/components/ui/icons"
import { siteConfig } from "@/lib/site-config"
import Link from "next/link"

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-noise grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link href="/" className="flex items-center gap-2 font-medium">
            <Icons.logo />
            {siteConfig.name}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="bg-muted bg-noise relative hidden lg:block"></div>
    </div>
  )
}
