import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function PublicTripPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = await prisma.trip.findFirst({
    where: { shareSlug: slug, isPublic: true },
    include: { stops: { orderBy: { position: "asc" } }, activities: { orderBy: { date: "asc" } } },
  });
  if (!trip) return notFound();

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">{trip.name}</h1>
        <p className="text-sm text-gray-600">
          {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <form action={copyTrip}>
          <input type="hidden" name="tripId" value={trip.id} />
          <button className="px-3 py-2 bg-black text-white rounded">Copy Trip</button>
        </form>
        <Link className="px-3 py-2 border rounded" href="/signup">Sign up to plan your own</Link>
      </div>
      <section>
        <h2 className="text-lg font-medium mb-2">Stops</h2>
        <ul className="space-y-2">
          {trip.stops.map((s) => (
            <li key={s.id} className="border rounded p-3">
              <div className="font-medium">{s.city}{s.country ? `, ${s.country}` : ""}</div>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-medium mb-2">Activities</h2>
        <ul className="space-y-2">
          {trip.activities.map((a) => (
            <li key={a.id} className="border rounded p-3">
              <div className="font-medium">{a.title}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function copyTrip(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  const source = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { stops: true, activities: true, budgetItems: true },
  });
  if (!source) return;
  const draft = await prisma.trip.create({
    data: {
      userId: "", // anonymous; will reassign after signup via onboarding if needed
      name: `${source.name} (Copy)`,
      startDate: source.startDate,
      endDate: source.endDate,
      description: source.description ?? undefined,
      isPublic: false,
      stops: { create: source.stops.map((s) => ({
        city: s.city,
        country: s.country ?? undefined,
        startDate: s.startDate,
        endDate: s.endDate,
        position: s.position,
      })) },
      activities: { create: source.activities.map((a) => ({
        title: a.title,
        date: a.date,
        stopId: null,
        category: a.category,
        costCents: a.costCents,
        currency: a.currency,
        startTime: a.startTime ?? undefined,
        endTime: a.endTime ?? undefined,
        orderIndex: a.orderIndex,
        locationName: a.locationName ?? undefined,
        externalUrl: a.externalUrl ?? undefined,
      })) },
      budgetItems: { create: source.budgetItems.map((b) => ({
        category: b.category,
        amountCents: b.amountCents,
        currency: b.currency,
        notes: b.notes ?? undefined,
      })) },
    },
  });
  // Note: In a real app, redirect to signup with draft trip reference
}