import { type NextAuthConfig } from "next-auth"
import { providers } from "./providers"
import { env } from "@/env"

const unprotectedRoutes = ["/auth", "/pricing"]

export const config: NextAuthConfig = {
  providers,
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id
      }
    }),
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl
      const isUnprotectedRoute = unprotectedRoutes.some(route =>
        pathname === "/" ? true : pathname.startsWith(route)
      )
      return isUnprotectedRoute || !!auth
    }
  },
  pages: {
    signIn: "/auth/sign-in"
  },
  secret: env.NEXTAUTH_SECRET
}
