import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, birthDate, passingDate, audioUrl, photoUrl } = body;

    if (!name || !birthDate || !passingDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let resolvedUserId = session.user.id;

    // Explicitly verify the user exists in the database to prevent P2003 Foreign Key Constraint violations
    let dbUser = await prisma.user.findUnique({ where: { id: resolvedUserId } });

    // If they don't exist (e.g. stale cookie, db reset, or old auto-login string), try to recover using Dev User
    if (!dbUser) {
      dbUser = await prisma.user.upsert({
        where: { email: "dev@example.com" },
        update: {},
        create: {
          email: "dev@example.com",
          name: "Dev User",
        },
      });
      resolvedUserId = dbUser.id;
    }

    const tribute = await prisma.tribute.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        passingDate: new Date(passingDate),
        audioUrl,
        photoUrl,
        userId: resolvedUserId,
      },
    });

    revalidatePath("/");
    return NextResponse.json(tribute);
  } catch (error) {
    console.error("Tribute creation error:", error);
    return NextResponse.json({ error: "Failed to create tribute", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tributes = await prisma.tribute.findMany({
      select: {
        id: true,
        name: true,
        birthDate: true,
        passingDate: true,
        audioUrl: true,
        photoUrl: true,
      }
    });
    return NextResponse.json(tributes);
  } catch (error) {
    console.error("Failed to fetch tributes", error);
    return NextResponse.json({ error: "Failed to fetch tributes" }, { status: 500 });
  }
}
