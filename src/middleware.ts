import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  const pathname = request.nextUrl.pathname

  if (sessionCookie) {
    if (pathname === "/" || pathname.startsWith("/auth")) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } else {
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/sign-in", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
