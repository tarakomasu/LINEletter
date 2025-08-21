'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { isMobile } from "react-device-detect"
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
  console.log(isMobile)
  const userDevice = isMobile ? "mobile" : "desktop"
  console.log(userDevice)
  return (
    <div className="min-h-screen bg-gray-100">
      <Hero />
      <Main>
        {cardData.map((card, index) => (
          <ServiceCard key={index} card={card} devise={userDevice}/>
        ))}
      </Main>
    </div>
  )
}
