"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Header } from "../common-components/header";
import { Main } from "./components/main";
import { ServiceCard } from "./components/service-card";

export default function Dashboard() {
  useSession({
    required: true,
    onUnauthenticated() {
      redirect("/");
    },
  });

  return (
    <div className="min-h-screen bg-gray-100 pt-16 md:pt-28">
      <Header />
      <Main>
        <ServiceCard />
      </Main>
    </div>
  );
}
