"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export function Header() {
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white text-[#06C755] shadow-md rounded-b-lg border-b-2 border-[#06C755]">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-2 md:space-x-3">
          <Image
            src="/simple.png"
            alt="App Icon"
            width={60} // Intrinsic width for aspect ratio
            height={60}
            className="w-[45px] h-[45px] md:w-[60px] md:h-[60px]" // Responsive size
          />
          <h1 className="text-3xl md:text-4xl font-bold">LINE Letter</h1>
        </div>
        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-[50px]"></div> // Placeholder to prevent layout shift
          ) : session ? (
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity rounded-full p-1"
            >
              <span className="text-base font-bold hidden sm:inline">{session.user?.name}</span>
              {session.user?.image && (
                <Image
                  className="rounded-full w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
                  src={session.user.image}
                  alt="User profile picture"
                  width={50}
                  height={50}
                />
              )}
            </button>
          ) : (
            <button
              onClick={() => signIn("line")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-6 h-6 md:w-7 md:h-7"
              >
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span className="text-base font-bold">ログイン</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
