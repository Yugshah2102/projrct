import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-3xl font-semibold">GlobeTrotter</h1>
        <p className="text-gray-700">
          Dream, design, and organize multi-city trips with a personalized, intelligent, and collaborative planner.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/signup" className="px-4 py-2 bg-black text-white rounded">Get Started</Link>
          <Link href="/login" className="px-4 py-2 border rounded">Log in</Link>
          <Link href="/dashboard" className="px-4 py-2 border rounded">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
