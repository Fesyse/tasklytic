import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/server/auth"
import { pusherServer } from "@/server/pusher"

export async function POST(req: Request) {
  const formData = await req.formData()
  const { socket_id, channel_name } = z
    .object({ socket_id: z.string(), channel_name: z.string() })
    .parse(Object.fromEntries(formData.entries()))

  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const pusherAuth = pusherServer.authorizeChannel(socket_id, channel_name, {
    user_id: session.user.id,
    user_info: session.user
  })
  return NextResponse.json(pusherAuth, { status: 201 })
}
