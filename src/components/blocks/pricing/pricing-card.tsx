import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { PricingCardFeatureWrapper } from "./pricing-card-wrapper"
import { FeatureIcon } from "@/lib/pricing"

type PricingCardProps = {
  name: string
  price: string
  description: string
  features: { name: string; available: boolean }[]
  isPro?: boolean
}

export function PricingCard({
  name,
  price,
  description,
  features,
  isPro = false
}: PricingCardProps) {
  return (
    <Card
      className={cn("w-full max-w-sm", {
        "border-primary/25 shadow-lg": isPro,
        "bg-gradient-to-br": !isPro
      })}
    >
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
        <p className="text-4xl font-extrabold">{price}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <PricingCardFeatureWrapper key={index} index={index}>
              <FeatureIcon available={feature.available} />
              <span>{feature.name}</span>
            </PricingCardFeatureWrapper>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className={cn("w-full", {
            "bg-primary hover:bg-primary/90": isPro
          })}
        >
          {isPro ? "Start Pro Trial" : `Get ${name}`}
        </Button>
      </CardFooter>
    </Card>
  )
}
