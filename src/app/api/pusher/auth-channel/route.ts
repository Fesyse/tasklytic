import { NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/server/auth"
import { pusherServer } from "@/server/pusher"

export async function POST(req: Request) {
  const formData = await req.formData()
  const { socket_id } = z
    .object({ socket_id: z.string() })
    .parse(Object.fromEntries(formData.entries()))

  const session = await auth()

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const pusherAuth = pusherServer.authenticateUser(socket_id, session.user)
  return NextResponse.json(pusherAuth, { status: 201 })
}
