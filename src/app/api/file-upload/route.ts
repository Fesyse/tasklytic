import { env } from "@/env"
import { auth } from "@/server/auth"
import { utapi } from "@/server/file-upload"

export type FileUploadResponse = {
  file: string
}

export const POST = async (request: Request) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    })

    if (!session)
      return new Response(null, {
        status: 404
      })

    const formData = await request.formData()

    const file = formData.get("file")
    if (!file || !(file instanceof File))
      return new Response(null, {
        status: 405
      })

    const response = await utapi.uploadFiles(file)

    if (response.error)
      return new Response(null, {
        status: 404
      })

    return Response.json(
      {
        file: response.data?.url
      } satisfies FileUploadResponse,
      {
        headers: {
          "Access-Control-Allow-Origin": env.BETTER_AUTH_URL,
          "Access-Control-Allow-Methods": "GET, POST",
          "Access-Control-Allow-Headers": "Content-Type, Authorization"
        }
      }
    )
  } catch {
    return new Response(null, {
      status: 403
    })
  }
}
