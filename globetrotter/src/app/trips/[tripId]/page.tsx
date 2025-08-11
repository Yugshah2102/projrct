import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function TripDetailPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { stops: { orderBy: { position: "asc" } }, activities: { orderBy: { date: "asc" } } },
  });
  if (!trip) return notFound();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{trip.name}</h1>
          <p className="text-sm text-gray-600">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Link className="px-3 py-2 border rounded" href={`/trips/${trip.id}/timeline`}>Timeline</Link>
          <Link className="px-3 py-2 border rounded" href={`/trips/${trip.id}/budget`}>Budget</Link>
          <Link className="px-3 py-2 border rounded" href={`/trips/${trip.id}/share`}>Share</Link>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Stops</h2>
        <form action={addStop} className="flex gap-2 items-end">
          <input type="hidden" name="tripId" value={trip.id} />
          <div>
            <label className="block text-sm mb-1">City</label>
            <input name="city" className="border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Country</label>
            <input name="country" className="border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Start</label>
            <input type="date" name="startDate" className="border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">End</label>
            <input type="date" name="endDate" className="border rounded px-3 py-2" required />
          </div>
          <button className="px-3 py-2 bg-black text-white rounded">Add Stop</button>
        </form>
        <ul className="space-y-2">
          {trip.stops.map((s) => (
            <li key={s.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.city}{s.country ? `, ${s.country}` : ""}</div>
                <div className="text-sm text-gray-600">
                  {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                </div>
              </div>
              <form action={deleteStop}>
                <input type="hidden" name="stopId" value={s.id} />
                <button className="text-red-600 underline" type="submit">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Activities</h2>
        <form action={addActivity} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 items-end">
          <input type="hidden" name="tripId" value={trip.id} />
          <div>
            <label className="block text-sm mb-1">Title</label>
            <input name="title" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input type="date" name="date" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Stop (optional)</label>
            <select name="stopId" className="w-full border rounded px-3 py-2">
              <option value="">None</option>
              {trip.stops.map((s) => (
                <option key={s.id} value={s.id}>{s.city}</option>
              ))}
            </select>
          </div>
          <button className="px-3 py-2 bg-black text-white rounded">Add Activity</button>
        </form>
        <ul className="space-y-2">
          {trip.activities.map((a) => (
            <li key={a.id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-sm text-gray-600">{new Date(a.date).toLocaleDateString()}</div>
              </div>
              <form action={deleteActivity}>
                <input type="hidden" name="activityId" value={a.id} />
                <button className="text-red-600 underline" type="submit">Remove</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

async function addStop(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  const city = String(formData.get("city"));
  const country = (formData.get("country") as string) || undefined;
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));

  const count = await prisma.stop.count({ where: { tripId } });
  await prisma.stop.create({
    data: { tripId, city, country, startDate, endDate, position: count },
  });
}

async function deleteStop(formData: FormData) {
  "use server";
  const stopId = String(formData.get("stopId"));
  await prisma.stop.delete({ where: { id: stopId } });
}

async function addActivity(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  const title = String(formData.get("title"));
  const date = new Date(String(formData.get("date")));
  const stopIdRaw = String(formData.get("stopId") || "");
  const stopId = stopIdRaw.length ? stopIdRaw : undefined;
  await prisma.activity.create({ data: { tripId, title, date, stopId } });
}

async function deleteActivity(formData: FormData) {
  "use server";
  const activityId = String(formData.get("activityId"));
  await prisma.activity.delete({ where: { id: activityId } });
}