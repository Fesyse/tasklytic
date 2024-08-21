import Link from "next/link"
import Balance from "react-wrap-balancer"
import { FeaturesSection } from "@/components/blocks/features-section"
import { Button } from "@/components/ui/button"
import { Beam } from "@/components/ui/grid-beam"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { cn } from "@/lib/utils"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-var(--header-size))]) relative rounded dark:bg-grid-white/[0.02]">
      <Spotlight className="hidden dark:block" fill="rgba(255,255,255,0.2)" />
      <div className="px-4">
        <section className="py-6 text-center md:py-10">
          <h1 className="bg-gradient-to-b from-foreground/25 to-foreground bg-clip-text text-6xl font-bold text-transparent dark:from-neutral-200 dark:to-neutral-600">
            Tasklytic
          </h1>
          <Balance>
            <TextGenerateEffect
              words="Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool."
              duration={0.5}
              className="max-w-[40rem] !text-base md:!text-lg"
            />
          </Balance>
        </section>

        <div className="flex flex-col-reverse md:flex-col">
          <div className="relative h-full w-full">
            <Beam className="-mt-20 hidden xl:ml-28 xl:block" />
            <FeaturesSection />
          </div>

          <section className="relative pt-8 text-center md:pt-12">
            <div className="relative z-10">
              <h2 className="mb-2 text-2xl font-bold md:mb-4 md:text-3xl">
                Ready to boost your productivity?
              </h2>
              <p className="mb-4 text-base md:mb-8 md:text-xl">
                Join Tasklytic today and streamline your task management
              </p>
              <Button
                size="lg"
                asChild
                className={cn(
                  "group relative overflow-hidden transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg",
                  // light mode
                  "bg-gradient-to-tr from-zinc-900 to-zinc-700 text-zinc-50 hover:shadow-zinc-500/30",
                  // dark mode
                  "dark:bg-gradient-to-tr dark:from-zinc-50 dark:to-zinc-100 dark:text-zinc-900 dark:hover:shadow-zinc-700/30"
                )}
              >
                <Link href="/auth/sign-in">
                  Get Started
                  {/* gives shiny effect on hover */}
                  <span className="absolute inset-0 flex size-full justify-center [transform:skew(-14deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-14deg)_translateX(100%)]">
                    <span className="relative h-full w-8 bg-white/20 dark:bg-black/10" />
                  </span>
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}