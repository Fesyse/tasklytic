import { type MiddlewareFunctionProps } from "@rescale/nemo"
import { NextResponse } from "next/server"
import { auth } from "@/server/auth"

export async function signInMiddleware({ request }: MiddlewareFunctionProps) {
  const session = await auth()

  if (session) return NextResponse.redirect(new URL("/dashboard", request.url))

  return NextResponse.next()
}
