import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  const counselorPw = await bcrypt.hash("123456", 10);
  const counselor = await db.user.create({
    data: {
      email: "counselor@university.edu.cn",
      name: "张老师",
      password: counselorPw,
      role: "COUNSELOR",
    },
  });

  const class1 = await db.class.create({
    data: { name: "计算机科学2024级1班", counselorId: counselor.id },
  });

  const studentPw = await bcrypt.hash("123456", 10);
  const studentNames = ["张三", "李四", "王五", "赵六", "孙七", "周八", "吴九", "郑十"];
  await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      db.user.create({
        data: {
          email: `student${i + 1}@university.edu.cn`,
          name: i < studentNames.length ? studentNames[i] : `同学${i + 1}`,
          password: studentPw,
          role: "STUDENT",
          classId: class1.id,
        },
      })
    )
  );

  await db.topic.createMany({
    data: [
      { classId: class1.id, title: "新学期，你想成为怎样的人？", tags: ["新学期", "意向"], createdBy: counselor.id },
      { classId: class1.id, title: "今晚操场散步20分钟", tags: ["微行动", "放松"], createdBy: counselor.id, isMicroAction: true },
      { classId: class1.id, title: "这周拍一张校园里的绿色", tags: ["微行动", "摄影"], createdBy: counselor.id, isMicroAction: true },
      { classId: class1.id, title: "给未来自己写一句话", tags: ["微行动", "成长"], createdBy: counselor.id, isMicroAction: true },
    ],
  });

  console.log("Seed completed: 1 counselor, 50 students, 4 topics");
}

main().catch(console.error).finally(() => db.$disconnect());
