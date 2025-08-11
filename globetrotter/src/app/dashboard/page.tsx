import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Trip } from "@/generated/prisma";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    return (
      <div className="p-6">
        <p>
          Please <Link className="underline" href="/login">log in</Link> to view your dashboard.
        </p>
      </div>
    );
  }
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome back{session.user.name ? `, ${session.user.name}` : ""}</h1>
        <p className="text-sm text-gray-600">Plan a new trip or continue where you left off.</p>
      </div>
      <div className="flex gap-3">
        <Link href="/trips/new" className="px-4 py-2 bg-black text-white rounded">Plan New Trip</Link>
        <Link href="/trips" className="px-4 py-2 border rounded">My Trips</Link>
      </div>
      <div>
        <h2 className="text-lg font-medium mb-2">Recent trips</h2>
        {trips.length === 0 ? (
          <p className="text-sm text-gray-600">No trips yet. Create your first trip.</p>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((t: Trip) => (
              <li key={t.id} className="border rounded p-4">
                <h3 className="font-semibold">{t.name}</h3>
                <p className="text-sm text-gray-600">
                  {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                </p>
                <div className="mt-3 flex gap-2">
                  <Link className="underline" href={`/trips/${t.id}`}>View</Link>
                  <Link className="underline" href={`/trips/${t.id}/budget`}>Budget</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}