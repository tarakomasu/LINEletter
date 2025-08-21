'use client'

import { useSession, signOut } from "next-auth/react"
import { redirect } from "next/navigation"
import Image from "next/image"
import { isMobile } from "react-device-detect"

const cardData = [
  {
    title: "Card 1",
    description: "This is a short description for card 1.",
    imageUrl: "https://placehold.co/600x400?text=Card+1",
  },
  {
    title: "Card 2",
    description: "This is a short description for card 2.",
    imageUrl: "https://placehold.co/600x400?text=Card+2",
  },
  {
    title: "Card 3",
    description: "This is a short description for card 3.",
    imageUrl: "https://placehold.co/600x400?text=Card+3",
  },
]

export default function Dashboard() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })
  const userDevice = isMobile ? "mobile" : "desktop"

  return (
    <div className="min-h-screen bg-gray-100">
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
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cardData.map((card, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Image
                    src={card.imageUrl}
                    alt={card.title}
                    width={600}
                    height={400}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-2">{card.title}</h2>
                    <p className="text-gray-700">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
