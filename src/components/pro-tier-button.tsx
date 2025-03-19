"use client"

import Link from "next/link"
import { Button, type ButtonProps } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useProProduct } from "@/hooks/use-pro-product"

type ProTierButtonProps = Omit<ButtonProps, "asChild" | "disabled">

export const ProTierButton: React.FC<ProTierButtonProps> = props => {
  const { data: product, isLoading } = useProProduct({})

  const productHref = product
    ? `/checkout?priceId=${product.prices[0]!.id}`
    : "#"

  return (
    <Button disabled={isLoading} asChild {...props}>
      <Link href={productHref}>
        {isLoading ? (
          <span className="flex gap-2 items-center">
            <LoadingSpinner size={18} /> Loading...
          </span>
        ) : (
          "Get Started"
        )}
      </Link>
    </Button>
  )
}
