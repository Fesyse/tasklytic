import { PricingCard } from "@/components/ui/dark-gradient-pricing"
import { Spotlight } from "@/components/ui/spotlight"

export default async function Page() {
  return (
    <div className="min-h-[calc(100vh-var(--dashboard-header-size))]) relative dark:bg-grid-white/[0.02] overflow-x-hidden">
      <Spotlight />
      <section className="relative overflow-hidden bg-background text-foreground">
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 md:px-8">
          <div className="mb-12 space-y-3">
            <h2 className="text-center text-3xl font-semibold leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight">
              Pricing
            </h2>
            <p className="text-center text-base text-muted-foreground md:text-lg">
              Use it for free for yourself, upgrade when your team needs
              advanced control.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <PricingCard
              tier="Free"
              price="$0/mo"
              bestFor="Best for individuals"
              CTA="Get started for free"
              benefits={[
                { text: "One project", checked: true },
                { text: "Email support", checked: true },
                { text: "100 blocks for notes", checked: true },
                { text: "AI copilot", checked: false },
                { text: "File uploads in notes", checked: false },
                { text: "Priority support", checked: false }
              ]}
              href={`/auth/sign-in`}
            />
            <PricingCard
              tier="Pro"
              price="$4.99/mo"
              bestFor="Best individuals"
              CTA="Get started"
              benefits={[
                { text: "AI copilot", checked: true },
                { text: "Five projects", checked: true },
                { text: "Email support", checked: true },
                { text: "Unlimited blocks", checked: true },
                { text: "Unlimited file uploads", checked: true },
                { text: "Priority support", checked: false }
              ]}
            />
            <PricingCard
              tier="Enterprise"
              price="Contact us"
              bestFor="Best for startups/companies"
              CTA="Contact us"
              benefits={[
                { text: "AI copilot", checked: true },
                { text: "Email support", checked: true },
                { text: "Unlimited projects", checked: true },
                { text: "Unlimited blocks", checked: true },
                { text: "Unlimited file uploads", checked: true },
                { text: "Priority support", checked: true }
              ]}
              href={`https://book.tasklytic.com/pricing`}
            />
          </div>
        </div>
      </section>
    </div>
  )
}
