import { TributeData } from "@/components/galaxy/Star";
import { prisma } from "@/lib/prisma";
import { Suspense } from "react";
import { GalaxyClient } from "@/components/galaxy/GalaxyClient";

async function getTributes(): Promise<TributeData[]> {
  try {
    const tributes = await prisma.tribute.findMany({
      select: {
        id: true,
        name: true,
        birthDate: true,
        passingDate: true,
        audioUrl: true,
        photoUrl: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    // Serialize dates to ISO strings to pass to Client Components
    return tributes.map(t => ({
      ...t,
      birthDate: t.birthDate.toISOString(),
      passingDate: t.passingDate.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch tributes:", error);
    return [];
  }
}

export default async function Home() {
  const tributes = await getTributes();

  return (
    <main className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
      <Suspense fallback={<div className="flex items-center justify-center h-full text-aurora">Loading Galaxy...</div>}>
        <GalaxyClient tributes={tributes} />
      </Suspense>
    </main>
  );
}
