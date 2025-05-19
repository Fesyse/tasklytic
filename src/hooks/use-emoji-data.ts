import { EMOJI_DATA_URL } from "@/app/api/emoji/[slug]/route"
import { useQuery, type UseQueryOptions } from "@tanstack/react-query"
import type { Emoji } from "frimousse"

export const useEmojiData = (
  options: Omit<UseQueryOptions<Emoji[], Error>, "queryKey" | "queryFn">
) => {
  return useQuery<Emoji[], Error>({
    queryKey: ["emoji-data"],
    queryFn: async () => {
      const response = await fetch(`${EMOJI_DATA_URL}/en/data.json`)
      if (!response.ok) {
        throw new Error(`Failed to fetch emoji data: ${response.statusText}`)
      }
      const json = (await response.json()) as Emoji[]

      return json
    },
    ...options
  })
}
