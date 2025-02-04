import { NextRequest, NextResponse } from "next/server"

export const middleware = async (request: NextRequest) => {
  // const { data: session } = await betterFetch<Session>(
  //   "/api/auth/get-session",
  //   {
  //     baseURL: request.nextUrl.origin,
  //     headers: {
  //       cookie: request.headers.get("cookie") || "" // Forward the cookies from the request
  //     }
  //   }
  // )

  // if (request.nextUrl.pathname === "/auth/sign-in" && session) {
  //   return NextResponse.redirect(new URL("/not-found", request.url))
  // }

  // if (!session) {
  //   return NextResponse.redirect(new URL("/auth/sign-in", request.url))
  // }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
