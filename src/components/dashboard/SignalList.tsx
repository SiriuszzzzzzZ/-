import { StudentSignal } from "@/types";

const SIGNAL_LABELS: Record<string, string> = {
  long_silence: "长期沉默",
  pressure_rising: "压力上升",
  social_disconnect: "社交断联",
};

export function SignalList({ signals }: { signals: StudentSignal[] }) {
  if (signals.length === 0) {
    return (
      <div className="bg-white/60 rounded-3xl p-8 text-center shadow-soft">
        <div className="text-3xl mb-3">🌱</div>
        <p className="text-sm text-warm-400">目前没有需要关注的信号</p>
        <p className="text-xs text-warm-300 mt-1">这是好事</p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {signals.map((s, i) => (
        <div
          key={i}
          className="bg-white/60 rounded-2xl p-3.5 flex justify-between items-center shadow-soft animate-float-up"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <div>
            <p className="text-sm font-medium text-warm-800">{s.userName}</p>
            <p className="text-xs text-warm-400 mt-0.5">{s.detail}</p>
          </div>
          <span className="text-xs bg-peach-50 text-peach-600 px-2.5 py-1 rounded-full font-medium">
            {SIGNAL_LABELS[s.signalType] || s.signalType}
          </span>
        </div>
      ))}
    </div>
  );
}
