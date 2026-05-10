"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function HelpForm({ classId, onSent }: { classId: string; onSent: () => void }) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ message: string; type: string; postId?: string } | null>(null);

  async function submit() {
    if (!content.trim()) return;
    setSending(true);
    const res = await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ classId, content }),
    });
    const data = await res.json();
    setResult(data);
    setSending(false);
    if (data.success) onSent();
  }

  if (result) {
    return (
      <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
        <p className="text-lg mb-1">{'📨'}</p>
        <p className="text-sm text-gray-600">{result.message}</p>
        <div className="flex justify-center gap-3 mt-4">
          <button onClick={() => setResult(null)} className="text-xs text-gray-400 hover:text-gray-600">换个方式说</button>
          <button onClick={async () => {
            if (result.postId) {
              await fetch("/api/help", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId: result.postId, action: "withdraw" }),
              });
            }
            setResult(null); setContent("");
          }} className="text-xs text-gray-400 hover:text-gray-600">先收回去</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="一句话求助：谁会做PPT？/ 今天有点想哭..."
        className="w-full rounded-xl border border-gray-200 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        maxLength={200}
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-400">{content.length}/200</span>
        <Button onClick={submit} disabled={sending || !content.trim()} size="sm">
          {sending ? "发送中..." : "发出求助"}
        </Button>
      </div>
    </div>
  );
}
