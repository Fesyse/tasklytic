import { type MiddlewareFunctionProps } from "@rescale/nemo"
import { getSession } from "next-auth/react"
import { NextResponse } from "next/server"

export async function signInMiddleware({ request }: MiddlewareFunctionProps) {
  const session = await getSession()

  if (session) return NextResponse.redirect(new URL("/dashboard", request.url))

  return NextResponse.next()
}
