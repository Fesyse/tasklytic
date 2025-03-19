import { useQuery } from "@tanstack/react-query"
import { type polar } from "@/server/polar"

type UseProProductProps = {
  enabled?: boolean
}

export const useProProduct = ({ enabled }: UseProProductProps) => {
  return useQuery({
    queryKey: ["product", "pro"],
    queryFn: () =>
      fetch(`/api/polar/get-products`).then(
        res => res.json() as ReturnType<typeof polar.products.list>
      ),
    select: data => data.result.items[0],
    enabled
  })
}
