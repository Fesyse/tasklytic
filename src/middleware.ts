import { getSessionCookie } from "better-auth/cookies"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  if (sessionCookie) {
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    const invitationId = searchParams.get("invitationId")
    if (pathname.startsWith("/auth") && invitationId) {
      return NextResponse.redirect(
        new URL(`/accept-invitation?id=${invitationId}`, request.url)
      )
    }
    if (pathname.startsWith("/auth") && !invitationId) {
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
