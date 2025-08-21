import LineProvider from "next-auth/providers/line"

export const authOptions = {
    providers: [
      LineProvider({
        clientId: process.env.LINE_CLIENT_ID ?? "",
        clientSecret: process.env.LINE_CLIENT_SECRET ?? "",
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
  }