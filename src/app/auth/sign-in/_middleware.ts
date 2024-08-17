import { type MiddlewareFunctionProps } from "@rescale/nemo"
import { NextResponse } from "next/server"
import { getServerAuthSession } from "@/server/auth"

export async function signInMiddleware({ request }: MiddlewareFunctionProps) {
  const session = await getServerAuthSession()

  if (session) return NextResponse.redirect(new URL("/dashboard", request.url))

  return NextResponse.next()
}
