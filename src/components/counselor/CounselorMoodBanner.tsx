import { db } from "@/lib/db";
import { MOOD_EMOJI } from "@/types";
import { Card } from "@/components/ui/Card";

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
      <Card className="bg-amber-50 border-amber-100 text-center py-3">
        <p className="text-sm text-amber-700">
          {MOOD_EMOJI[todayMood.mood]} 辅导员今天也忙飞了，大家温柔对待
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-blue-50 border-blue-100 text-center py-3">
      <p className="text-sm text-blue-600">
        {MOOD_EMOJI[todayMood.mood]} 辅导员今天也有点累，互相理解
      </p>
    </Card>
  );
}
