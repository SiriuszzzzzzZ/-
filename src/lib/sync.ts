import { db } from "./db";

const MOOD_LABELS: Record<string, string> = {
  SUNNY: "晴朗",
  RAINY: "阴雨",
  STORMY: "风暴",
  GROWING: "生长",
};

export interface SyncPeer {
  id: string;
  name: string;
  avatar: string | null;
  sameMood: string;
  sameDays: number;
}

export async function getMonthlySyncPeers(userId: string, classId: string): Promise<SyncPeer[]> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const myMoods = await db.moodEntry.findMany({
    where: { userId, classId, date: { gte: monthStart } },
    select: { mood: true, date: true },
    orderBy: { date: "desc" },
  });

  if (myMoods.length < 2) return [];

  const myMoodMap = new Map<string, string>();
  for (const m of myMoods) {
    const day = m.date.toISOString().slice(0, 10);
    myMoodMap.set(day, m.mood);
  }

  const classmates = await db.user.findMany({
    where: { classId, id: { not: userId }, role: "STUDENT" },
    select: { id: true, name: true, avatar: true },
  });

  const classmateIds = classmates.map((c) => c.id);

  const allMoods = await db.moodEntry.findMany({
    where: { userId: { in: classmateIds }, classId, date: { gte: monthStart } },
    select: { userId: true, mood: true, date: true },
  });

  const peerMap = new Map<string, { moods: Map<string, string>; name: string; avatar: string | null }>();
  for (const c of classmates) {
    peerMap.set(c.id, { moods: new Map(), name: c.name, avatar: c.avatar });
  }
  for (const m of allMoods) {
    const peer = peerMap.get(m.userId);
    if (peer) {
      const day = m.date.toISOString().slice(0, 10);
      peer.moods.set(day, m.mood);
    }
  }

  const results: SyncPeer[] = [];

  for (const [peerId, peer] of Array.from(peerMap.entries())) {
    const moodCounts = new Map<string, number>();
    for (const [day, myMood] of Array.from(myMoodMap.entries())) {
      const peerMood = peer.moods.get(day);
      if (peerMood === myMood) {
        moodCounts.set(myMood, (moodCounts.get(myMood) || 0) + 1);
      }
    }

    let bestMood = "";
    let bestCount = 0;
    for (const [mood, count] of Array.from(moodCounts.entries())) {
      if (count > bestCount) {
        bestCount = count;
        bestMood = mood;
      }
    }

    if (bestCount >= 3) {
      results.push({
        id: peerId,
        name: peer.name,
        avatar: peer.avatar,
        sameMood: MOOD_LABELS[bestMood] || bestMood,
        sameDays: bestCount,
      });
    }
  }

  results.sort((a, b) => b.sameDays - a.sameDays);
  return results.slice(0, 5);
}
