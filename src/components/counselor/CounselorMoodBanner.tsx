import { db } from "@/lib/db";
import { MOOD_EMOJI, MoodType } from "@/types";

export async function CounselorMoodBanner({ classId }: { classId: string }) {
  const classData = await db.class.findUnique({
    where: { id: classId },
    include: { counselor: true },
  });
  if (!classData?.counselorId) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayMood = await db.moodEntry.findFirst({
    where: {
      userId: classData.counselorId,
      date: { gte: today },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!todayMood || todayMood.mood === "SUNNY" || todayMood.mood === "GROWING") return null;

  if (todayMood.mood === "STORMY") {
    return (
      <div className="bg-peach-50 border border-peach-200 rounded-4xl px-5 py-3 text-center animate-pop-spring">
        <p className="text-sm text-peach-600 font-medium">
          {MOOD_EMOJI[todayMood.mood as MoodType]} 辅导员今天也忙飞了，大家温柔对待
        </p>
      </div>
    );
  }

  return (
    <div className="bg-mint-50 border border-mint-200 rounded-4xl px-5 py-3 text-center animate-pop-spring">
      <p className="text-sm text-mint-600 font-medium">
        {MOOD_EMOJI[todayMood.mood as MoodType]} 辅导员今天也有点累，互相理解
      </p>
    </div>
  );
}
