import { betterFetch } from "@better-fetch/fetch"
import { NextRequest, NextResponse } from "next/server"
import { type Session } from "./server/auth"

const protectedRoutes = ["/projects", "/create-project"]

export const middleware = async (request: NextRequest) => {
  const { data: session } = await betterFetch<Session>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: {
        // Get the cookie from the request
        cookie: request.headers.get("cookie") || ""
      }
    }
  )

  const pathname = request.nextUrl.pathname

  if (pathname === "/auth/sign-in" && session) {
    return NextResponse.redirect(new URL("/projects", request.url))
  }

  if (protectedRoutes.some(p => pathname.startsWith(p)) && !session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
