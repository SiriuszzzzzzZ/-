import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClassNav } from "./ClassNav";

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
    <div className="min-h-screen bg-cream">
      {/* Warm header */}
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center justify-between sticky top-0 z-10">
        <h1 className="font-semibold text-warm-800 text-lg">
          {classData?.name || "班级"}
        </h1>
        {!isCounselor ? (
          <span className="text-xs text-mint-500 bg-mint-50 px-3 py-1 rounded-full font-medium">
            自由区 · 辅导员隐身中
          </span>
        ) : (
          <span className="text-xs text-coral-500 bg-coral-50 px-3 py-1 rounded-full font-medium">
            辅导员视角
          </span>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-5 pb-24">{children}</main>

      {/* Warm bottom nav */}
      <ClassNav classId={params.classId} />
    </div>
  );
}
