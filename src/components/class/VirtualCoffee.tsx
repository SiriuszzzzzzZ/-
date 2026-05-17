"use client";
import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";

interface Message {
  id: number;
  fromUserId: string;
  content: string;
  createdAt: string;
}

export function VirtualCoffee({
  peerId, peerName, peerAvatar, myId, onClose,
}: {
  peerId: string; peerName: string; peerAvatar: string | null; myId: string; onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [connecting, setConnecting] = useState(true);
  const { toast } = useToast();
  const pollRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start the coffee session
    fetch("/api/whisper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: peerId, content: "☕ 虚拟咖啡已开启 — 10分钟限时对话" }),
    }).then(() => setConnecting(false));

    // Poll for messages
    pollRef.current = setInterval(async () => {
      const res = await fetch("/api/whisper?dir=received");
      const data = await res.json();
      const sent = await fetch("/api/whisper?dir=sent");
      const sentData = await sent.json();
      const all = [
        ...data.whispers.map((w: { id: number; fromUserId: string; content: string; createdAt: string }) => ({ ...w })),
        ...sentData.whispers.filter((w: { toUserId: string }) => w.toUserId === peerId).map((w: { id: number; fromUserId: string; content: string; createdAt: string }) => ({ ...w })),
      ].filter((w) =>
        (w.fromUserId === peerId && !w.content.includes("虚拟咖啡已开启")) ||
        (w.fromUserId === myId && w.content.includes("☕"))
      );
      setMessages((prev) => {
        const existing = new Set(prev.map((p) => p.id));
        const fresh = all.filter((m: Message) => !existing.has(m.id));
        return [...prev, ...fresh].sort((a, b) => a.id - b.id);
      });
    }, 3000);

    // Countdown
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => {
      clearInterval(pollRef.current);
      clearInterval(timer);
    };
  }, [peerId, myId]);

  useEffect(() => {
    if (timeLeft <= 0) {
      clearInterval(pollRef.current);
      toast("虚拟咖啡时间到", "info");
      setTimeout(onClose, 3000);
    }
  }, [timeLeft]);

  async function send() {
    if (!text.trim() || text.length > 100) return;
    await fetch("/api/whisper", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toUserId: peerId, content: `☕ ${text.trim()}` }),
    });
    setText("");
  }

  return (
    <div className="fixed inset-0 bg-[#1C2840]/95 z-50 flex flex-col animate-float-up">
      <header className="px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <Avatar src={peerAvatar} name={peerName} size="sm" />
          <div>
            <p className="text-white text-sm font-medium">{peerName}</p>
            <p className="text-white/40 text-[10px]">虚拟咖啡 · 限时对话</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs font-mono ${timeLeft < 120 ? "text-coral-400" : "text-white/50"}`}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
          </span>
          <button onClick={onClose} className="text-white/50 hover:text-white text-sm">✕</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {connecting && (
          <p className="text-white/30 text-xs text-center py-8">正在准备咖啡...</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.fromUserId === myId ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
              m.fromUserId === myId ? "bg-coral-400/30 text-white/90" : "bg-white/10 text-white/80"
            }`}>
              <p className="text-sm">{m.content.replace("☕ ", "")}</p>
              <p className="text-[9px] text-white/30 mt-1">{new Date(m.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-white/10 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
          placeholder={`和 ${peerName} 聊聊...`}
          maxLength={100}
          disabled={timeLeft <= 0}
          className="flex-1 bg-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-coral-400/50 disabled:opacity-30"
        />
        <button onClick={send} disabled={!text.trim() || timeLeft <= 0}
          className="px-4 py-2.5 rounded-xl bg-coral-400 text-white text-sm font-medium hover:bg-coral-500 disabled:opacity-30 transition-colors">
          发送
        </button>
      </div>
    </div>
  );
}
