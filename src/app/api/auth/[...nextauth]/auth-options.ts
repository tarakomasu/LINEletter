import LineProvider from "next-auth/providers/line"
import { Session } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    interface Session {
      user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
      }
    }
  }

export const authOptions = {
    providers: [
      LineProvider({
        clientId: process.env.LINE_CLIENT_ID ?? "",
        clientSecret: process.env.LINE_CLIENT_SECRET ?? "",
        checks: ["state"],
      }),
    ],
    callbacks: {
        session: async ({ session, token }: { session: Session; token: JWT }) => {
          if (session?.user) {
            session.user.id = token.sub as string
          }
          return session
        },
      },
      session: {
        strategy: "jwt", 
      },
    secret: process.env.NEXTAUTH_SECRET,
  }