import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { z } from "zod"

type UnsplashUser = {
  id: string
  username: string
  name: string
  first_name: string
  last_name: string
  instagram_username: string
  twitter_username: string
  portfolio_url: string
  profile_image: {
    small: string
    medium: string
    large: string
  }
  links: {
    self: string
    html: string
    photos: string
    likes: string
  }
}
type UnsplashImage = {
  id: string
  created_at: string
  width: number
  height: number
  /** In HEX */
  color: string
  blur_hash: string
  likes: number
  liked_by_user: boolean
  description: string
  user: UnsplashUser
  current_user_collections: []
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    self: string
    html: string
    download: string
  }
}
type UnsplashSearchImagesResponse = {
  total: number
  total_pages: number
  results: UnsplashImage[]
}

export const noteRouter = createTRPCRouter({
  getUnsplashImages: protectedProcedure
    .input(
      z.object({
        page: z.number().default(1),
        query: z.string()
      })
    )
    .query(async ({ input }) => {
      const result = (await fetch(
        `https://api.unsplash.com/search/photos?query=${input.query}&page=${input.page}&per_page=15`
      ).then((res) => res.json())) as UnsplashSearchImagesResponse

      console.log(result)
      return result
    })
})
