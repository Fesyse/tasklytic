import { Check, X } from "lucide-react"

export const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    description: "For individuals just getting started",
    features: [
      { name: "1 user", available: true },
      { name: "5 projects", available: true },
      { name: "2GB storage", available: true },
      { name: "API access", available: false },
      { name: "Email support", available: false }
    ]
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professionals and growing teams",
    features: [
      { name: "Unlimited users", available: true },
      { name: "Unlimited projects", available: true },
      { name: "20GB storage", available: true },
      { name: "API access", available: true },
      { name: "Priority email support", available: true }
    ]
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large-scale organizations",
    features: [
      { name: "Unlimited users", available: true },
      { name: "Unlimited projects", available: true },
      { name: "Unlimited storage", available: true },
      { name: "API access", available: true },
      { name: "24/7 phone support", available: true }
    ]
  }
]

export const FeatureIcon = ({ available }: { available: boolean }) => {
  return available ? (
    <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
  ) : (
    <X className="h-5 w-5 flex-shrink-0 text-red-500" />
  )
}
