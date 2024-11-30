"use client"

import { useChat as useBaseChat } from "ai/react"

export const useChat = () => {
  return useBaseChat({
    id: "editor",
    api: "/api/ai/command",
    fetch: async (input, init) => {
      const res = await fetch(input, init)

      if (!res.ok) {
        const stream = res.body

        return new Response(stream, {
          headers: {
            Connection: "keep-alive",
            "Content-Type": "text/plain"
          }
        })
      }

      return res
    }
  })
}
