import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function ClassLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { classId: string };
}) {
  const session = await getServerSession(authOptions);
  const isCounselor = session?.user?.role === "COUNSELOR";
  const classData = await db.class.findUnique({ where: { id: params.classId } });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-semibold text-gray-800">{classData?.name || "班级"}</h1>
        {!isCounselor && (
          <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
            自由区 · 辅导员隐身中
          </span>
        )}
        {isCounselor && (
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            辅导员视角
          </span>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 flex justify-around max-w-lg mx-auto z-10">
        <Link href={`/class/${params.classId}`} className="flex flex-col items-center text-xs text-indigo-600">
          <span className="text-lg">🏠</span>班级
        </Link>
        <Link href={`/class/${params.classId}/treehole`} className="flex flex-col items-center text-xs text-gray-400">
          <span className="text-lg">🌲</span>树洞
        </Link>
        <Link href="/square" className="flex flex-col items-center text-xs text-gray-400">
          <span className="text-lg">🌊</span>广场
        </Link>
        <Link href="/me" className="flex flex-col items-center text-xs text-gray-400">
          <span className="text-lg">👤</span>我的
        </Link>
      </nav>
    </div>
  );
}
