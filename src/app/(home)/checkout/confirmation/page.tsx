import Link from "next/link"
import { BackgroundLines } from "@/components/ui/background-lines"
import { Button } from "@/components/ui/button"

type CheckoutConfirmationPageProps = {
  searchParams: Promise<{
    checkout_id: string
  }>
}

export default function CheckoutConfirmationPage(
  props: CheckoutConfirmationPageProps
) {
  // Checkout has been confirmed
  // Now, make sure to capture the Checkout.updated webhook event to update the order status in your system

  return (
    <BackgroundLines className="flex items-center justify-center w-full flex-col px-4 h-[calc(100vh-var(--dashboard-header-size))]">
      <div className="flex flex-col items-center justify-center relative z-20">
        <h2 className="bg-clip-text text-transparent text-center bg-gradient-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white text-2xl md:text-4xl lg:text-7xl font-sans py-2 md:py-10 relative font-bold tracking-tight">
          Thank you for your purchase!
        </h2>
        <p className="max-w-xl mx-auto text-sm md:text-lg text-neutral-700 dark:text-neutral-400 text-center">
          Your order has been confirmed. We will send you an email with your
          order details and tracking information.
        </p>
        <Button className="relative mt-6 md:mt-10" asChild>
          <Link href="/projects">Go to projects</Link>
        </Button>
      </div>
    </BackgroundLines>
  )
}
