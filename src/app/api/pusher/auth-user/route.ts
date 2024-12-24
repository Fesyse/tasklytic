import { type NextApiRequest, type NextApiResponse } from "next"
import { z } from "zod"
import { auth } from "@/server/auth"
import { pusherServer } from "@/server/pusher"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { socket_id } = z.object({ socket_id: z.string() }).parse(req.body)
  const session = await auth()

  if (!session) {
    return res.status(401).send({ message: "Unauthorized" })
  }
  const pusherAuth = pusherServer.authenticateUser(socket_id, session.user)
  res.send(pusherAuth)
}
