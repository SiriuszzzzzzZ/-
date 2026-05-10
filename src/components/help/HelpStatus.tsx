export function HelpStatus({ type }: { type: "SKILL" | "EMOTION" }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      <span>已发出</span>
      {type === "EMOTION" && <span className="text-xs">· 辅导员会在今天内看到</span>}
    </div>
  );
}
