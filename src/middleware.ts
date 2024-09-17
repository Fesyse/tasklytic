import NextAuth from "next-auth"

const unprotectedRoutes = ["/", "/pricing"]

export default NextAuth({
  callbacks: {
    session({ session, user }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: user.id
        }
      }
    },
    authorized({ request, auth }) {
      const pathname = request.nextUrl.pathname
      const isUnprotectedRoute = unprotectedRoutes.some(
        route => pathname === route
      )

      // Ensure the user is authorized before allowing access to protected routes
      if (isUnprotectedRoute) return true
      if (!auth) return false
      if (pathname.startsWith("/auth")) return true

      return !!auth
    }
  },
  providers: [],
  pages: {
    signIn: "/auth/sign-in"
  }
}).auth

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|user).*)"]
}
