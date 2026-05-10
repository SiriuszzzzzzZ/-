import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  const moments = await db.growthMoment.findMany({
    where: { toUserId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <h1 className="font-semibold text-gray-800">我的成长记录</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {moments.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-gray-400">还没有被点亮过</p>
            <p className="text-xs text-gray-300 mt-1">每一次被看见都值得等待</p>
          </Card>
        ) : (
          moments.map((m) => (
            <Card key={m.id} padding="sm">
              <p className="text-sm text-gray-700">{m.reason}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(m.createdAt).toLocaleDateString("zh-CN")}</p>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
