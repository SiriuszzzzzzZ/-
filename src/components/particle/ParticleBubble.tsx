import { Avatar } from "@/components/ui";

interface ParticleData {
  content: string | null;
  user: { id: string; name: string; avatar: string | null } | null;
}

export function ParticleBubble({ particle }: { particle: ParticleData }) {
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/50 border border-warm-100 text-xs text-warm-500 animate-float-up">
      <Avatar src={particle.user?.avatar} name={particle.user?.name || "?"} size="sm" />
      <span>{particle.content}</span>
    </div>
  );
}
