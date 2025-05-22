import { useEffect, useState } from "react"

import type { Observable } from "dexie"

/**
 * React hook for subscribing to a Dexie observable
 * @param getObservable Function that returns a Dexie observable
 * @param deps Dependency array for the hook
 * @returns The current value of the observable
 */
export function useObservable<T>(
  getObservable: () => Observable<T>,
  deps: React.DependencyList = []
): T | undefined {
  const [value, setValue] = useState<T>()

  useEffect(() => {
    const observable = getObservable()
    const subscription = observable.subscribe({
      next: (result) => {
        setValue(result)
      },
      error: (error) => {
        console.error("Observable error:", error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, deps)

  return value
}
