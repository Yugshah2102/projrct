import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function NewTripPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create a new trip</h1>
      <form action={createTrip} className="space-y-4">
        <input type="hidden" name="userId" value={session.user.id} />
        <div>
          <label className="block text-sm mb-1">Trip name</label>
          <input name="name" className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Start date</label>
            <input type="date" name="startDate" className="w-full border rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">End date</label>
            <input type="date" name="endDate" className="w-full border rounded px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <button className="px-4 py-2 bg-black text-white rounded">Save</button>
      </form>
    </div>
  );
}

async function createTrip(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const name = String(formData.get("name"));
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));
  const description = (formData.get("description") as string) || undefined;

  await prisma.trip.create({
    data: { userId, name, startDate, endDate, description },
  });
}