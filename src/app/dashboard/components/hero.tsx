'use client'

import { useSession } from "next-auth/react"
import Image from "next/image"

export function Hero() {
  const { data: session } = useSession()

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="https://placehold.co/150x50?text=App+Logo"
            alt="App screenshot"
            width={150}
            height={50}
          />
        </div>
        <div className="flex items-center">
          {session?.user?.image && (
            <Image
              className="rounded-full mr-4"
              src={session.user.image}
              alt="User profile picture"
              width={40}
              height={40}
            />
          )}
          <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
