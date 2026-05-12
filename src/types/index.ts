export type MoodType = "SUNNY" | "RAINY" | "STORMY" | "GROWING";

export const MOOD_LABELS: Record<MoodType, string> = {
  SUNNY: "\u{1F324} 还行",
  RAINY: "\u{1F327} 有点累",
  STORMY: "\u{1F32A} 快炸了",
  GROWING: "\u{1F331} 状态不错",
};

export const MOOD_EMOJI: Record<MoodType, string> = {
  SUNNY: "\u{1F324}",
  RAINY: "\u{1F327}",
  STORMY: "\u{1F32A}",
  GROWING: "\u{1F331}",
};

export const PARTICLE_OPTIONS = [
  { id: "passing", label: "刚刚路过这儿", emoji: "🚶" },
  { id: "library", label: "在图书馆摸鱼", emoji: "📚" },
  { id: "late_night", label: "深夜还没睡", emoji: "🌙" },
  { id: "after_class", label: "刚下课放空", emoji: "🎒" },
  { id: "free", label: "今天有点闲", emoji: "🍃" },
] as const;

export type ParticleType = (typeof PARTICLE_OPTIONS)[number]["id"];

export type PostWithUser = {
  id: string;
  type: string;
  content: string | null;
  anonymous: boolean;
  treehole: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  user: { id: string; name: string; avatar: string | null };
  _count: { replies: number };
};

export type MoodTrend = {
  date: string;
  SUNNY: number;
  RAINY: number;
  STORMY: number;
  GROWING: number;
  total: number;
};

export type StudentSignal = {
  userId: string;
  userName: string;
  signalType: "long_silence" | "pressure_rising" | "social_disconnect";
  detail: string;
};
