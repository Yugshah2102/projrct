import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TripSharePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: session.user.id } });
  if (!trip) redirect("/trips");

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const publicUrl = trip.shareSlug ? `${base}/p/${trip.shareSlug}` : null;

  return (
    <div className="p-6 space-y-4 max-w-xl">
      <h1 className="text-2xl font-semibold">Share Trip</h1>
      {publicUrl ? (
        <div className="space-y-2">
          <div className="text-sm">Public URL</div>
          <a className="underline" href={publicUrl} target="_blank">{publicUrl}</a>
        </div>
      ) : (
        <p className="text-sm text-gray-600">This trip is not public yet.</p>
      )}
      <form action={togglePublic}>
        <input type="hidden" name="tripId" value={trip.id} />
        <input type="hidden" name="makePublic" value={publicUrl ? "false" : "true"} />
        <button className="px-4 py-2 bg-black text-white rounded">
          {publicUrl ? "Make Private" : "Make Public"}
        </button>
      </form>
    </div>
  );
}

async function togglePublic(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  const makePublic = String(formData.get("makePublic")) === "true";
  if (makePublic) {
    const slug = Math.random().toString(36).slice(2, 10);
    await prisma.trip.update({ where: { id: tripId }, data: { isPublic: true, shareSlug: slug } });
  } else {
    await prisma.trip.update({ where: { id: tripId }, data: { isPublic: false, shareSlug: null } });
  }
}