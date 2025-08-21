// src/pages/api/auth/[...nextauth].ts
import LineProvider from "next-auth/providers/line"
import NextAuth from "next-auth"

export default NextAuth({
  providers: [
    LineProvider({
      clientId: process.env.LINE_CLIENT_ID ?? "",
      clientSecret: process.env.LINE_CLIENT_SECRET ?? "",
      checks: ["state"],
    })
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub as string
      }
      return session
    },
  },
  session: {
    strategy: "jwt", 
  },
})

declare module "next-auth" {
  interface Session {
    user: {
      id: string
    }
  }
}
