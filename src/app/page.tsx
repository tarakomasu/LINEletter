'use client'

import { useSession, signIn } from "next-auth/react"
import { redirect } from "next/navigation"

export default function Home() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div className="flex flex-col items-center justify-center min-h-screen py-2">Loading...</div>
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <button
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md"
        onClick={() => signIn("line")}
      >
        Sign in with LINE
      </button>
    </div>
  )
}
