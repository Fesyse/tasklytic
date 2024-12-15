import { useEffect, useRef } from "react"

export const usePrevious = <T>(current: T) => {
  const previous = useRef(current)

  useEffect(() => {
    previous.current = current
  }, [current])

  return previous.current
}
