import NextAuth from "next-auth"
import { authOptions } from "@/server/auth"

const handler = NextAuth(authOptions) as Function
export { handler as GET, handler as POST }
