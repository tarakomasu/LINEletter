'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Image from "next/image"

export default function Dashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      {session?.user?.image && (
        <Image
          className="rounded-full mt-4"
          src={session.user.image}
          alt="User profile picture"
          width={100}
          height={100}
        />
      )}
      <p className="mt-4">Welcome, {session?.user?.name}!</p>
    </div>
  )
}
