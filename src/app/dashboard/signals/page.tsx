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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-3">
        <h1 className="font-semibold text-gray-800">需要关注的人</h1>
      </header>
      <main className="max-w-lg mx-auto px-4 py-4">
        <SignalList signals={allSignals} />
      </main>
    </div>
  );
}
