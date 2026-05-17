"use client";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { VirtualCoffee } from "@/components/class/VirtualCoffee";
import type { SyncPeer } from "@/lib/sync";

export function SyncPeers({ peers, currentUserId }: { peers: SyncPeer[]; currentUserId: string }) {
  const [flowered, setFlowered] = useState<Set<string>>(new Set());
  const [coffeePeer, setCoffeePeer] = useState<SyncPeer | null>(null);
  const { toast } = useToast();

  if (peers.length === 0) return null;

  async function sendFlower(peerId: string, peerName: string) {
    try {
      await fetch("/api/whisper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: peerId, content: "🌸 送你一朵花，我们这周心情很像" }),
      });
      setFlowered(prev => new Set(prev).add(peerId));
      toast(`已送花给 ${peerName}`, "success");
    } catch {
      toast("送花失败", "error");
    }
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-[11px] text-warm-300 uppercase tracking-widest">本月同频人</span>
        <div className="h-px flex-1 bg-warm-200/50" />
      </div>
      <div className="bg-mint-50/70 rounded-2xl px-4 py-4 space-y-3">
        <p className="text-xs text-warm-400">
          本月有 <span className="text-mint-600 font-medium">{peers.length}</span> 位同学和你在同一天选了相似的心情
        </p>
        <div className="space-y-2">
          {peers.map((peer) => (
            <div key={peer.id} className="flex items-center gap-3">
              <Avatar src={peer.avatar} name={peer.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-warm-700 truncate">{peer.name}</p>
                <p className="text-[10px] text-warm-400">{peer.sameDays} 天同样「{peer.sameMood}」</p>
              </div>
              {flowered.has(peer.id) ? (
                <span className="text-xs text-mint-500">已送花 🌸</span>
              ) : (
                <div className="flex gap-1">
                  <button onClick={() => sendFlower(peer.id, peer.name)} className="text-xs px-2 py-1 rounded-full bg-white text-coral-400 hover:bg-coral-50 transition-colors touch-target" aria-label={`送花给${peer.name}`}>
                    🌸
                  </button>
                  <button onClick={() => setCoffeePeer(peer)} className="text-xs px-2 py-1 rounded-full bg-white text-amber-500 hover:bg-amber-50 transition-colors touch-target" aria-label={`和${peer.name}喝虚拟咖啡`}>
                    ☕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {coffeePeer && (
        <VirtualCoffee
          peerId={coffeePeer.id}
          peerName={coffeePeer.name}
          peerAvatar={coffeePeer.avatar}
          myId={currentUserId}
          onClose={() => setCoffeePeer(null)}
        />
      )}
    </section>
  );
}
