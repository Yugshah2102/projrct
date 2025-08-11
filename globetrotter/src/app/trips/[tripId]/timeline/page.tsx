import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { format, eachDayOfInterval } from "date-fns";

export default async function TripTimelinePage({ params }: { params: Promise<{ tripId: string }> }) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { activities: { orderBy: { date: "asc" } } },
  });
  if (!trip) return notFound();

  const days = eachDayOfInterval({ start: trip.startDate, end: trip.endDate });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Timeline</h1>
      <div className="space-y-4">
        {days.map((d) => {
          const ds = format(d, "yyyy-MM-dd");
          const todays = trip.activities.filter((a) => format(a.date, "yyyy-MM-dd") === ds);
          return (
            <div key={ds} className="border rounded p-4">
              <div className="font-medium mb-2">{format(d, "EEE, MMM d, yyyy")}</div>
              {todays.length === 0 ? (
                <div className="text-sm text-gray-600">No activities planned.</div>
              ) : (
                <ul className="space-y-1">
                  {todays.map((a) => (
                    <li key={a.id} className="flex justify-between">
                      <span>{a.title}</span>
                      {a.startTime && a.endTime && (
                        <span className="text-sm text-gray-600">{a.startTime} - {a.endTime}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}