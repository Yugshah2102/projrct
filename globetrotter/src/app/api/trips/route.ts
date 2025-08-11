import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const trips = await prisma.trip.findMany({ where: { userId: session.user.id } });
  return NextResponse.json(trips);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const trip = await prisma.trip.create({ data: { ...body, userId: session.user.id } });
  return NextResponse.json(trip);
}