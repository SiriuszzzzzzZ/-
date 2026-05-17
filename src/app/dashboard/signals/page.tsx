import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { computeSignals } from "@/lib/signals";
import { db } from "@/lib/db";
import { SignalList } from "@/components/dashboard/SignalList";

export default async function SignalsPage() {
  const session = await getServerSession(authOptions);
  const classes = await db.class.findMany({
    where: { counselorId: session?.user.id },
  });

  const allSignals = (
    await Promise.all(
      classes.map(async (c) => {
        const signals = await computeSignals(c.id);
        return signals.map((s) => ({
          ...s,
          userName: `${s.userName} (${c.name})`,
        }));
      })
    )
  ).flat();

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-cream/80 backdrop-blur-sm border-b border-warm-200/50 px-5 py-3 flex items-center gap-3">
        <a href="/dashboard" className="text-warm-400 hover:text-warm-600 text-sm">← 返回</a>
        <h1 className="font-semibold text-warm-800 text-lg">需要关注的人</h1>
        <p className="text-xs text-warm-400 mt-0.5">不是&ldquo;没填表的人&rdquo;，是需要被看见的人</p>
      </header>
      <main className="max-w-lg md:max-w-3xl lg:max-w-4xl mx-auto px-4 py-5">
        <SignalList signals={allSignals} />
      </main>
    </div>
  );
}
