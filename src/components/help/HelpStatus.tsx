export function HelpStatus({ type }: { type: "SKILL" | "EMOTION" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-warm-400 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-mint-400" />
      <span>已发出</span>
      {type === "EMOTION" && <span className="text-xs text-warm-300">· 辅导员会在今天内看到</span>}
    </div>
  );
}
