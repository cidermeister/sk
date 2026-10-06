"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { Star, LogOut, LogIn } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-space-900/50 backdrop-blur-md border-b border-white/5">
      <Link href="/" className="flex items-center gap-2 text-white hover:text-aurora transition-colors">
        <Star className="w-6 h-6 text-aurora" />
        <span className="font-semibold text-lg tracking-wider">GALAXY MEMORIAL</span>
      </Link>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <Link href="/create" className="text-sm text-gray-300 hover:text-white transition-colors">
              Add Tribute
            </Link>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => signIn()}
            className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
}
