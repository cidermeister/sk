import { NextResponse } from "next/server";
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

    const tribute = await prisma.tribute.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        passingDate: new Date(passingDate),
        audioUrl,
        photoUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(tribute);
  } catch (error) {
    console.error("Tribute creation error:", error);
    return NextResponse.json({ error: "Failed to create tribute" }, { status: 500 });
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
