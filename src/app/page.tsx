'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        Signed in as {session.user?.id} <br />
        <button
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      Not signed in <br />
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        onClick={() => signIn("line")}
      >
        Sign in with LINE
      </button>
    </div>
  )
}