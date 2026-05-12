import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

async function main() {
  const pw = await bcrypt.hash("123456", 1);

  // Counselor
  const counselor = await db.user.upsert({
    where: { email: "counselor@university.edu.cn" },
    update: {},
    create: { email: "counselor@university.edu.cn", name: "张老师", password: pw, role: "COUNSELOR" },
  });

  // Class
  const cls = await db.class.upsert({
    where: { id: "class-01" },
    update: {},
    create: { id: "class-01", name: "计算机2024级1班", counselorId: counselor.id },
  });

  // 5 students
  const names = ["小明", "小红", "小刚", "小丽", "小宇"];
  const now = new Date();
  for (let i = 0; i < 5; i++) {
    const email = `student${i + 1}@university.edu.cn`;
    const s = await db.user.upsert({
      where: { email },
      update: { classId: cls.id },
      create: { email, name: names[i], password: pw, role: "STUDENT", classId: cls.id, avatar: null, signature: "" },
    });

    // 3 days of mood
    for (let d = 2; d >= 0; d--) {
      const date = new Date(now);
      date.setDate(date.getDate() - d);
      date.setHours(0, 0, 0, 0);
      await db.moodEntry.upsert({
        where: { userId_date: { userId: s.id, date } },
        update: {},
        create: { userId: s.id, classId: cls.id, mood: ["SUNNY", "GROWING", "RAINY", "SUNNY"][d % 4], date },
      }).catch(() => {});
    }
  }

  // A few particles
  await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student1@university.edu.cn" } }))!.id, classId: cls.id, type: "STATE_PARTICLE", content: "🚶 刚刚路过这儿", expiresAt: new Date(now.getTime() + 24 * 3600000) } });
  await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student2@university.edu.cn" } }))!.id, classId: cls.id, type: "STATE_PARTICLE", content: "📚 在图书馆摸鱼", expiresAt: new Date(now.getTime() + 24 * 3600000) } });

  // 2 topics synced to square
  await db.topic.create({ data: { classId: cls.id, title: "这学期你最想完成的一件事是什么？", tags: "新学期,目标", createdBy: counselor.id, syncedToSquare: true } });
  await db.topic.create({ data: { classId: cls.id, title: "分享一首你最近单曲循环的歌", tags: "音乐,放松", createdBy: counselor.id, syncedToSquare: true } });

  // 1 help post + reply
  const help = await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student3@university.edu.cn" } }))!.id, classId: cls.id, type: "HELP_SKILL", content: "谁会做概率论作业？求带 🙏" } });
  await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student1@university.edu.cn" } }))!.id, classId: cls.id, type: "HELP_SKILL", parentId: help.id, content: "我可以帮你看看" } });

  // 1 good deed
  await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student4@university.edu.cn" } }))!.id, classId: cls.id, type: "GOOD_DEED", content: "多了一把伞，谁要？" } });

  // 1 treehole
  await db.post.create({ data: { userId: (await db.user.findFirst({ where: { email: "student2@university.edu.cn" } }))!.id, classId: cls.id, type: "HELP_EMOTION", content: "最近压力好大", treehole: true, anonymous: true } });

  // 1 growth
  await db.growthMoment.create({ data: { fromUserId: (await db.user.findFirst({ where: { email: "student1@university.edu.cn" } }))!.id, toUserId: (await db.user.findFirst({ where: { email: "student3@university.edu.cn" } }))!.id, reason: "谢谢你那天帮我解了bug" } });

  console.log("✓ Production seed done: 1 counselor + 5 students + sample data");
}

main().catch(console.error).finally(() => db.$disconnect());
