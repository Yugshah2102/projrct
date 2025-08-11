import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Trip } from "@/generated/prisma";

export default async function TripsListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Trips</h1>
        <Link href="/trips/new" className="px-4 py-2 bg-black text-white rounded">Plan New Trip</Link>
      </div>
      {trips.length === 0 ? (
        <p className="text-sm text-gray-600">No trips yet.</p>
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
                <form action={deleteTrip}>
                  <input type="hidden" name="tripId" value={t.id} />
                  <button className="text-red-600 underline" type="submit">Delete</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function deleteTrip(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  await prisma.trip.delete({ where: { id: tripId } });
}