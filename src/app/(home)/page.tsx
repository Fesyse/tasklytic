import Link from "next/link"
import Balance from "react-wrap-balancer"
import { FeaturesSection } from "@/components/blocks/features-section"
import { Button } from "@/components/ui/button"
import { Spotlight } from "@/components/ui/spotlight"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"

export default function Home() {
  return (
    <div className="relative min-h-[calc(100vh-var(--header-size))]) dark:bg-grid-white/[0.02] rounded">
      <Spotlight className="dark:block hidden" fill="rgba(255,255,255,0.2)" />
      <div className="px-4">
        <section className="py-20 text-center">
          <h1 className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600">
            Tasklytic
          </h1>
          <Balance>
            <TextGenerateEffect
              words="Streamline your workflow with smart task management. Organize, prioritize, and track your tasks with ease, all in one powerful tool."
              duration={0.5}
              className="!text-lg max-w-[40rem]"
            />
          </Balance>
        </section>

        <FeaturesSection />

        <section className="py-20 text-center relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Ready to boost your productivity?
            </h2>
            <p className="text-xl mb-8">
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
