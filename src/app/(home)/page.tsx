import Link from "next/link"
import Balance from "react-wrap-balancer"
import { FeaturesSection } from "@/components/blocks/features-section"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-var(--header-size))]) relative rounded dark:bg-grid-white/[0.02]">
      <Spotlight className="hidden dark:block" fill="rgba(255,255,255,0.2)" />
      <div className="px-4">
        <section className="py-20 text-center">
          <h1 className="bg-gradient-to-b from-foreground/25 to-foreground bg-clip-text text-6xl font-bold text-transparent dark:from-neutral-200 dark:to-neutral-600">
            Tasklytic
          </h1>
          <Balance>
            <TextGenerateEffect
              words="Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool."
              duration={0.5}
              className="max-w-[40rem] !text-lg"
            />
          </Balance>
        </section>

        <FeaturesSection />

        <section className="relative py-20 text-center">
          <div className="relative z-10">
            <h2 className="mb-4 text-3xl font-bold">
              Ready to boost your productivity?
            </h2>
            <p className="mb-8 text-xl">
              Join Tasklytic today and streamline your task management
            </p>
            <Button size="lg" asChild>
              <Link href="/auth/sign-in">Get Started</Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
