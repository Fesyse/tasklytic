import { type NextRequest, NextResponse } from "next/server"

export const middleware = async (req: NextRequest, res: NextResponse) => {
  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
