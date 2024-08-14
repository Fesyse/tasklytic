import NextAuth from "next-auth"
import { authOptions } from "@/server/auth"

const handler = NextAuth(authOptions) as (...args: any) => any
export { handler as GET, handler as POST }
