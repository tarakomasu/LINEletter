'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Hero } from "./components/hero"
import { Main } from "./components/main"
import { ServiceCard, cardData } from "./components/service-card"

export default function Dashboard() {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect("/")
    },
  })

  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />
      <Main>
        {cardData.map((card, index) => (
          <ServiceCard key={index} card={card} />
        ))}
      </Main>
    </div>
  )
}
