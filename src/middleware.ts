import { getSessionCookie } from "better-auth/cookies"
import createIntlMiddleware from "next-intl/middleware"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./i18n/routing"

const handleI18nRouting = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams

  const sessionCookie = getSessionCookie(request)

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

  if (!pathname.startsWith("/dashboard")) {
    const response = handleI18nRouting(request)
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
