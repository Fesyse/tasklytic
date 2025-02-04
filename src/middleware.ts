import { getSessionCookie } from "better-auth"
import { NextRequest, NextResponse } from "next/server"

export const middleware = (request: NextRequest) => {
  const sessionCookie = getSessionCookie(request)

  if (request.nextUrl.pathname === "/auth/sign-in" && sessionCookie) {
    return NextResponse.redirect(new URL("/not-found", request.url))
  }

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)",
    /^\/projects\//,
    /^\/auth\/sign-in(\?.*)?$/
  ]
}
