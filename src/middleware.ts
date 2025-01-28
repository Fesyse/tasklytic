import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "@/server/auth/config"

const { auth } = NextAuth(authConfig)

export const middleware = auth(async req => {
  if (req.nextUrl.pathname === "/auth/sign-in") {
    const session = await auth()

    if (session) {
      return NextResponse.redirect(new URL("/projects", req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
