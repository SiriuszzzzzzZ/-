"use client";
import { useState } from "react";

interface Deed {
  id: string; content: string | null; user: { id: string; name: string; avatar: string | null };
}

export function GoodDeedItem({ deed, currentUserId }: { deed: Deed; currentUserId: string }) {
  const [reaction, setReaction] = useState<string | null>(null);

  async function react(emoji: string) {
    setReaction(emoji);
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentId: deed.id, content: emoji, type: "GOOD_DEED", classId: "" }),
    });
    setTimeout(() => setReaction(null), 2000);
  }

  return (
    <div className="bg-mint-50 rounded-2xl px-4 py-3 space-y-2 animate-float-up">
      <div className="flex items-center gap-3">
        <span className="text-lg">🎁</span>
        <div className="flex-1">
          <p className="text-sm text-warm-600">{deed.content}</p>
          <p className="text-xs text-warm-400 mt-0.5">{deed.user.name} · 先到先得</p>
        </div>
      </div>
      <div className="flex gap-2">
        {["🙋 我拿了", "🤝 我需要", "❤️ 谢谢你"].map((item) => (
          <button
            key={item}
            onClick={() => react(item)}
            className={`text-[10px] px-2.5 py-1 rounded-full transition-all touch-target ${
              reaction === item ? "bg-mint-400 text-white scale-105" : "bg-white text-warm-500 hover:bg-mint-100"
            }`}
          >
            {reaction === item ? "✓" : item}
          </button>
        ))}
      </div>
    </div>
  );
}
