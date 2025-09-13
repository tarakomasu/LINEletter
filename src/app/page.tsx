"use client";

// Auth
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        Loading...
      </div>
    );
  }

  // if (session) {
  //   redirect("/pages/app-list");
  // } else {
  //   redirect("/pages/landing");
  // }

  return null; // Or a loading spinner
}
