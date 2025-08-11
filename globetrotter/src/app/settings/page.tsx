import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="p-6 max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <form action={updateProfile} className="space-y-3">
        <input type="hidden" name="userId" value={session.user.id} />
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" defaultValue={user?.name ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Email</label>
          <input name="email" type="email" defaultValue={user?.email ?? ""} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm mb-1">Language</label>
          <select name="language" className="w-full border rounded px-3 py-2">
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>
        <button className="px-4 py-2 bg-black text-white rounded">Save</button>
      </form>
      <form action={deleteAccount}>
        <input type="hidden" name="userId" value={session.user.id} />
        <button className="px-4 py-2 border rounded text-red-600">Delete account</button>
      </form>
    </div>
  );
}

async function updateProfile(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const name = (formData.get("name") as string) || undefined;
  const email = (formData.get("email") as string) || undefined;
  await prisma.user.update({ where: { id: userId }, data: { name, email } });
}

async function deleteAccount(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  await prisma.user.delete({ where: { id: userId } });
}