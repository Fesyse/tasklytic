"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { Skeleton } from "@/components/ui/skeleton"
import { Link } from "@/i18n/routing"
import { authClient } from "@/lib/auth-client"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { useTranslations } from "next-intl"
import NextLink from "next/link"
import React from "react"

const menuItems = [
  { key: "features", href: "#features" },
  { key: "solution", href: "#solution" },
  { key: "pricing", href: "#pricing" },
  { key: "about", href: "#about" }
] as const

export const Header = () => {
  const t = useTranslations("HomeHeader")

  const { data, isPending } = authClient.useSession()
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Icons.icon className="text-primary" />
                <span className="text-xl">{siteConfig.name}</span>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState == true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{t(`Nav.${item.key}`)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{t(`Nav.${item.key}`)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                {isPending ? (
                  <Skeleton className="h-8 w-32" />
                ) : !data?.user ? (
                  <>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <Link href="/auth/sign-in">
                        <span>{t("Login.login")}</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled && "lg:hidden")}
                    >
                      <Link href="/auth/sign-up">
                        <span>{t("Login.sign-up")}</span>
                      </Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                    >
                      <Link href="/auth/sign-up">
                        <span>{t("Login.start")}</span>
                      </Link>
                    </Button>
                  </>
                ) : (
                  <Button asChild variant="outline" size="sm">
                    <NextLink href="/dashboard">
                      {isScrolled
                        ? t("Login.short-go-to-dashboard")
                        : t("Login.go-to-dashboard")}
                    </NextLink>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
