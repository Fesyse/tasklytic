import { useLiveQuery } from "dexie-react-hooks"
import { useEffect, useState } from "react"

export function useDexieDb<T>(queryFunction: () => Promise<T>, deps?: any[]) {
  const [isLoading, setIsLoading] = useState(true)

  const data = useLiveQuery(async () => {
    setIsLoading(true)
    try {
      const result = await queryFunction()
      return result
    } finally {
      setIsLoading(false)
    }
  }, deps)

  useEffect(() => {
    if (data) {
      setIsLoading(false)
    }
  }, [data])

  return { data, isLoading, isError: !data && !isLoading }
}
