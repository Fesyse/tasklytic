import { auth } from "@/server/auth"
import { headers } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  const pathname = request.nextUrl.pathname

  if (session) {
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
  runtime: "nodejs",
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
