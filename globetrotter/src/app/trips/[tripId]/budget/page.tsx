import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import BudgetChart, { type BudgetDatum } from "@/components/BudgetChart";
import type { BudgetCategory } from "@/generated/prisma";

export default async function TripBudgetPage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { budgetItems: true },
  });
  if (!trip) return notFound();

  const totalCents = trip.budgetItems.reduce((s, b) => s + b.amountCents, 0);
  const data: BudgetDatum[] = Object.entries(
    trip.budgetItems.reduce<Record<string, number>>((acc, b) => {
      acc[b.category] = (acc[b.category] || 0) + b.amountCents;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value: Math.round(value / 100) }));

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Budget & Cost Breakdown</h1>
      <form action={addBudgetItem} className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end max-w-3xl">
        <input type="hidden" name="tripId" value={trip.id} />
        <div>
          <label className="block text-sm mb-1">Category</label>
          <select name="category" className="w-full border rounded px-3 py-2">
            <option>TRANSPORT</option>
            <option>STAY</option>
            <option>ACTIVITIES</option>
            <option>MEALS</option>
            <option>OTHER</option>
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Amount (USD)</label>
          <input type="number" name="amount" className="w-full border rounded px-3 py-2" min={0} step={1} required />
        </div>
        <div>
          <label className="block text-sm mb-1">Notes</label>
          <input name="notes" className="w-full border rounded px-3 py-2" />
        </div>
        <button className="px-3 py-2 bg-black text-white rounded">Add</button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BudgetChart data={data} />
        <div>
          <h2 className="text-lg font-medium mb-2">Breakdown</h2>
          <ul className="space-y-1">
            {data.map((d) => (
              <li key={d.name} className="flex justify-between">
                <span>{d.name}</span>
                <span>${d.value.toLocaleString()}</span>
              </li>
            ))}
            <li className="flex justify-between font-semibold border-t pt-2 mt-2">
              <span>Total</span>
              <span>${Math.round(totalCents / 100).toLocaleString()}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

async function addBudgetItem(formData: FormData) {
  "use server";
  const tripId = String(formData.get("tripId"));
  const category = String(formData.get("category")) as BudgetCategory;
  const amount = Number(formData.get("amount"));
  const notes = (formData.get("notes") as string) || undefined;
  await prisma.budgetItem.create({
    data: { tripId, category, amountCents: Math.round(amount * 100), notes },
  });
}