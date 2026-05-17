import { db } from "./db";

export const BADGE_DEFS = {
  HELPER: { name: "助人为乐", icon: "🤝", desc: "回应同学的求助", levels: [1, 5, 15, 30] },
  TOPIC_STAR: { name: "话题之星", icon: "💬", desc: "参与话题讨论", levels: [1, 5, 15, 30] },
  GROWTH_COLLECTOR: { name: "星光收集者", icon: "✨", desc: "被同学点亮", levels: [5, 15, 30, 50] },
  TREEHOLE_FRIEND: { name: "树洞之友", icon: "🌲", desc: "在树洞表达自己", levels: [1, 3, 8, 20] },
  STREAK_KEEPER: { name: "坚持打卡", icon: "🔥", desc: "连续打卡天数", levels: [3, 7, 14, 30] },
} as const;

export type BadgeType = keyof typeof BADGE_DEFS;

const LEVEL_LABELS = ["初级", "中级", "高级", "星辰"];

export function getBadgeLevel(type: BadgeType, count: number): { level: number; label: string; progress: number; nextAt: number } {
  const thresholds = BADGE_DEFS[type].levels;
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (count >= thresholds[i]) { level = i + 1; break; }
  }
  const nextAt = level < thresholds.length ? thresholds[level] : -1;
  const progress = level < thresholds.length ? count - (level > 0 ? thresholds[level - 1] : 0) : count;
  return { level, label: level > 0 ? LEVEL_LABELS[level - 1] : "未获得", progress, nextAt };
}

export async function checkAndAwardBadge(userId: string, type: BadgeType) {
  const def = BADGE_DEFS[type];

  // count relevant actions
  let count = 0;
  if (type === "HELPER") {
    count = await db.post.count({ where: { userId, type: "HELP_SKILL", parentId: { not: null } } });
  } else if (type === "TOPIC_STAR") {
    count = await db.post.count({ where: { userId, type: "TOPIC_POST" } });
  } else if (type === "GROWTH_COLLECTOR") {
    count = await db.growthMoment.count({ where: { toUserId: userId } });
  } else if (type === "TREEHOLE_FRIEND") {
    count = await db.post.count({ where: { userId, treehole: true } });
  } else if (type === "STREAK_KEEPER") {
    count = await getMoodStreak(userId);
  }

  const { level } = getBadgeLevel(type, count);

  await db.badge.upsert({
    where: { userId_type: { userId, type } },
    create: { userId, type, level, progress: count },
    update: { level, progress: count },
  });

  return { type, level, count };
}

async function getMoodStreak(userId: string): Promise<number> {
  const entries = await db.moodEntry.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
    take: 30,
  });

  if (entries.length === 0) return 0;

  let streak = 1;
  for (let i = 1; i < entries.length; i++) {
    const prev = new Date(entries[i - 1].date);
    const curr = new Date(entries[i].date);
    const diffMs = prev.getTime() - curr.getTime();
    const diffDays = Math.round(diffMs / 86400000);
    if (diffDays === 1) streak++;
    else break;
  }
  return streak;
}

export async function getUserBadges(userId: string) {
  return db.badge.findMany({ where: { userId }, orderBy: { level: "desc" } });
}
