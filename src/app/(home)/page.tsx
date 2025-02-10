import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import Balance from "react-wrap-balancer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Beam } from "@/components/ui/grid-beam"
import { Icons } from "@/components/ui/icons"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { CTAWithGithub } from "@/components/blocks/cta"
import { FeaturesSection } from "@/components/blocks/features-section"
import { siteConfig } from "@/config"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-var(--dashboard-header-size))]) overflow-x-hidden relative rounded dark:bg-grid-white/[0.02]">
      <Spotlight />

      <section className="container mt-4 min-h-[calc(100vh-20rem)] flex flex-col justify-center">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left relative">
            <Link href={siteConfig.announcement.href}>
              <Badge variant="outline">
                {siteConfig.announcement.title}
                <ArrowUpRight className="ml-2 size-4" />
              </Badge>
            </Link>
            <Beam className="-mt-12 -ml-2 hidden xl:block" />
            <h1 className="my-6 text-pretty text-4xl font-bold lg:text-6xl">
              {siteConfig.title}
            </h1>
            <Balance>
              <TextGenerateEffect
                words={siteConfig.description}
                duration={0.25}
                className="!text-sm sm:!text-base md:!text-lg mb-8 max-w-xl text-muted-foreground lg:text-xl"
              />
            </Balance>
            <div className="flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start">
              <Button className="w-full sm:w-auto">
                <Link href="/auth/sign-in" prefetch={true}>
                  Start for Free 🎉
                </Link>
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="/pricing">
                  Pricing Plans
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
          <Image
            src="https://shadcnblocks.com/images/block/placeholder-1.svg"
            width={1280}
            height={720}
            alt="placeholder hero"
            className="max-h-96 w-full rounded-md object-cover"
          />
        </div>
      </section>

      <section className="bg-muted relative my-10 min-h-[800px] md:my-20">
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          className="absolute top-0 bg-transparent"
        >
          <path
            d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
            className="fill-background"
          ></path>
        </svg>
        <div className="container rounded-lg overflow-hidden border-2">
          <Icons.placeholder className=" absolute left-1/2 top-1/2 h-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/25 grayscale" />
        </div>
        <svg
          viewBox="0 0 1440 58"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          className="absolute bottom-0"
        >
          <path
            transform="rotate(180) translate(-1440, -60)"
            d="M-100 58C-100 58 218.416 36.3297 693.5 36.3297C1168.58 36.3297 1487 58 1487 58V-3.8147e-06H-100V58Z"
            className="fill-background"
          ></path>
        </svg>
      </section>

      <section className="container relative flex w-full flex-col justify-center">
        <h2 className="mb-4 text-center text-2xl font-bold md:mb-6 md:text-4xl">
          Our features
        </h2>
        <FeaturesSection />
      </section>
      <section>
        <CTAWithGithub />
      </section>
    </div>
  )
}
