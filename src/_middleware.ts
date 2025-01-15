import NextAuth from "next-auth"
import { config as authConfig } from "@/server/auth/config"

const { auth } = NextAuth(authConfig)

export { auth as middleware }

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user|robots).*)"]
}
