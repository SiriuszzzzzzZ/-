import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { CounselorMoodPicker } from "@/components/counselor/CounselorMoodPicker";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const classes = await db.class.findMany({
    where: { counselorId: session?.user.id },
    include: { _count: { select: { students: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <h1 className="font-semibold text-gray-800">辅导员仪表盘</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <CounselorMoodPicker />

        {classes.map((cls) => (
          <Link
            key={cls.id}
            href={`/dashboard/class/${cls.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-gray-800">{cls.name}</h3>
              <span className="text-xs text-gray-400">{cls._count.students} 名学生</span>
            </div>
          </Link>
        ))}

        <Link
          href="/dashboard/signals"
          className="block text-sm text-indigo-600 hover:text-indigo-800"
        >
          查看需要关注的人 →
        </Link>
      </main>
    </div>
  );
}
