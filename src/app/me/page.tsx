import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { getGrowthTrajectory } from "@/lib/growth";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { LowPresenceToggle } from "./LowPresenceToggle";

export default async function MePage() {
  const session = await getServerSession(authOptions);
  const user = await db.user.findUnique({ where: { id: session!.user.id } });
  if (!user) return null;
  const trajectory = await getGrowthTrajectory(user.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3"><h1 className="font-semibold text-gray-800">我的</h1></header>
      <main className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <Card className="text-center space-y-2">
          <Avatar src={user.avatar} name={user.name} size="lg" />
          <h2 className="font-medium text-gray-800">{user.name}</h2>
          {user.signature && <p className="text-sm text-gray-400">{user.signature}</p>}
          <p className="text-xs text-gray-300">过去30天活跃 {trajectory.activeDays} 天</p>
        </Card>

        <Link href="/me/growth" className="block">
          <Card className="flex justify-between items-center">
            <span className="text-sm text-gray-700">✨ 我的成长记录</span>
            <span className="text-xs text-gray-400">被点亮 {trajectory.growthReceived} 次 →</span>
          </Card>
        </Link>

        <LowPresenceToggle current={user.lowPresenceMode} />
      </main>
    </div>
  );
}
