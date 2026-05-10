import { StudentSignal } from "@/types";
import { Card } from "@/components/ui/Card";

const SIGNAL_LABELS: Record<string, string> = {
  long_silence: "长期沉默",
  pressure_rising: "压力上升",
  social_disconnect: "社交断联",
};

export function SignalList({ signals }: { signals: StudentSignal[] }) {
  if (signals.length === 0) {
    return (
      <Card className="text-center py-6">
        <p className="text-sm text-gray-400">目前没有需要关注的信号</p>
      </Card>
    );
  }
  return (
    <div className="space-y-2">
      {signals.map((s, i) => (
        <Card key={i} padding="sm" className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-gray-700">{s.userName}</p>
            <p className="text-xs text-gray-400">{s.detail}</p>
          </div>
          <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
            {SIGNAL_LABELS[s.signalType] || s.signalType}
          </span>
        </Card>
      ))}
    </div>
  );
}
