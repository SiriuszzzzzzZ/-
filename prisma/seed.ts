import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

// ── 50个中文学生名字 ──
const STUDENT_NAMES = [
  "陈思远","林晓晴","王浩然","赵雨桐","刘星辰","杨一凡","黄若溪","周子涵",
  "吴梓豪","郑佳怡","钱俊杰","孙雨薇","李沐阳","张欣然","许志远","沈念安",
  "韩天佑","马晓萌","朱明哲","胡乐怡","何宇轩","吕诗雨","施博文","魏心怡",
  "蒋浩宇","沈梦瑶","冯俊熙","董雨萱","苏子航","卢雅婷","潘逸飞","蔡思琪",
  "余志豪","叶晓琳","肖一鸣","邓雨晴","唐子骞","顾思源","丁浩然","程若曦",
  "范星辰","陆晓萌","曹明远","田语嫣","彭博文","姚思雨","宋宇飞","薛佳怡",
  "于浩宸","方雨霏",
];

// ── 5 种人格 & 行为模板 ──
type Persona = "active" | "lurker" | "volatile" | "recovering" | "edge";
const PERSONA_DIST: Persona[] = [
  ...Array(12).fill("active"),
  ...Array(18).fill("lurker"),
  ...Array(6).fill("volatile"),
  ...Array(4).fill("recovering"),
  ...Array(10).fill("edge"),
];

const PARTICLE_LABELS = ["今天路过","在图书馆","深夜还醒着","刚下课","今天有点空"];
const HELP_SKILLS = [
  "谁会做PPT？求帮忙","有人知道高数怎么复习吗","谁在图书馆能帮我占个座","想问一下选课系统怎么用","求借一本数据结构",
];
const HELP_EMOTIONS = [
  "最近有点焦虑，感觉什么都做不完","今天有点想哭，不知道怎么了","好孤独，想找人说说话","压力好大，快撑不住了","觉得自己不够好",
];
const GOOD_DEEDS = [
  "多了一把伞，在B楼门口","做了太多饼干，放在楼下","下午去图书馆，还有一个空位","有本二手教材免费送",
  "多一张明晚讲座的票","今天买了太多水果，分给大家",
];
const TREEHOLE_POSTS = [
  "其实我一点也不喜欢这个专业","有时候觉得大学好孤独","不知道未来在哪","好想回家","为什么大家看起来都那么顺利",
  "考研真的好累但又不敢放弃",
];

const MOODS: string[] = ["SUNNY","RAINY","STORMY","GROWING"];

function randInt(min: number, max: number) { return Math.floor(Math.random()*(max-min+1))+min; }
function pick<T>(arr: T[]): T { return arr[randInt(0, arr.length-1)]; }
function dayOffset(daysAgo: number): Date {
  const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-daysAgo); return d;
}

async function main() {
  // ───── 1. 创建辅导员 + 班级 ─────
  const pw = await bcrypt.hash("123456", 10);
  const counselor = await db.user.create({
    data: { email:"counselor@university.edu.cn", name:"张老师", password:pw, role:"COUNSELOR" },
  });
  const cls = await db.class.create({
    data: { name:"计算机科学2024级1班", counselorId:counselor.id },
  });

  // ───── 2. 创建 50 个学生 ─────
  const students: { id:string; name:string; persona:Persona }[] = [];
  for (let i=0; i<50; i++) {
    const u = await db.user.create({
      data: {
        email:`student${i+1}@university.edu.cn`,
        name: STUDENT_NAMES[i],
        password: pw,
        role:"STUDENT",
        classId: cls.id,
        signature: pick(["保持热爱","慢慢来","今天也要开心","做自己","在努力了","勿忘初心",""]),
        avatar: null,
      },
    });
    students.push({ id:u.id, name:u.name, persona:PERSONA_DIST[i] });
  }

  // ───── 3. 过去 7 天数据 ─────
  for (let day=6; day>=0; day--) {
    const date = dayOffset(day);
    // 3a. 辅导员情绪（每天）
    await db.moodEntry.create({
      data: { userId:counselor.id, classId:cls.id, mood:pick(MOODS), date },
    });

    // 3b. 学生情绪（30-42 人/天，边缘型偶尔出现）
    const shuffled = [...students].sort(()=>Math.random()-0.5);
    const count = randInt(30, 42);
    for (let i=0; i<count; i++) {
      const s = shuffled[i];
      if (s.persona==="edge" && Math.random()>0.3) continue; // 边缘型 30% 概率出现
      let moodWeights: typeof MOODS;
      if (s.persona==="volatile") moodWeights = day<=3 ? ["RAINY","STORMY","SUNNY","GROWING"] : ["SUNNY","GROWING","RAINY","STORMY"];
      else if (s.persona==="recovering") moodWeights = day<=3 ? ["STORMY","RAINY","SUNNY","GROWING"] : ["GROWING","SUNNY","RAINY","STORMY"];
      else if (s.persona==="active") moodWeights = ["SUNNY","GROWING","RAINY","STORMY"];
      else moodWeights = [pick(MOODS),pick(MOODS),pick(MOODS),pick(MOODS)];
      await db.moodEntry.create({
        data: { userId:s.id, classId:cls.id, mood:moodWeights[0], date },
      });
    }
  }

  // ───── 4. 辅导员话题 + 微行动（部分同步到广场）─────
  await db.topic.createMany({
    data: [
      { classId:cls.id, title:"这学期你最想完成的一件事是什么？", tags:"新学期,目标", createdBy:counselor.id, createdAt:dayOffset(6), syncedToSquare: true },
      { classId:cls.id, title:"分享一下你最近单曲循环的歌", tags:"音乐,放松", createdBy:counselor.id, createdAt:dayOffset(4), syncedToSquare: true },
      { classId:cls.id, title:"如果你可以给自己放一天假，你会做什么？", tags:"想象,放松", createdBy:counselor.id, createdAt:dayOffset(2) },
      { classId:cls.id, title:'说一个你觉得「其实还不错」的小瞬间', tags:"感恩,温暖瞬间", createdBy:counselor.id, createdAt:dayOffset(0), syncedToSquare: true },
      { classId:cls.id, title:"考试前你最想听到的一句话是什么？", tags:"考研心情,温暖瞬间", createdBy:counselor.id, createdAt:dayOffset(6), syncedToSquare: true },
      { classId:cls.id, title:"有没有哪句话支撑你走过了低谷？", tags:"低谷,成长记录", createdBy:counselor.id, createdAt:dayOffset(5), syncedToSquare: true },
      { classId:cls.id, title:"这个月第一次独立完成的事", tags:"第一次,成长记录", createdBy:counselor.id, createdAt:dayOffset(3), syncedToSquare: true },
      { classId:cls.id, title:"今晚操场散步 20 分钟，偶遇即缘分", tags:"微行动,放松", createdBy:counselor.id, isMicroAction:true, createdAt:dayOffset(5) },
      { classId:cls.id, title:"这周用手机拍一张校园里的绿色", tags:"微行动,摄影", createdBy:counselor.id, isMicroAction:true, createdAt:dayOffset(3) },
      { classId:cls.id, title:"给期中的自己写一句加油的话", tags:"微行动,成长记录", createdBy:counselor.id, isMicroAction:true, createdAt:dayOffset(1) },
      { classId:cls.id, title:"明天带一本书到教室，看完前 10 页", tags:"微行动,第一次", createdBy:counselor.id, isMicroAction:true, createdAt:dayOffset(0), syncedToSquare: true },
      { classId:cls.id, title:"期末考安排通知", tags:"公告", createdBy:counselor.id, isNotice:true, createdAt:dayOffset(1), syncedToSquare: true },
    ],
  });

  // ───── 5. 求助 — 8 条（5 技能 + 3 情绪），部分有回应 ─────
  const activeStudents = students.filter(s=>s.persona==="active"||s.persona==="volatile");
  const helpPosts: { id:string; userId:string; createdAt:Date }[] = [];
  for (let i=0; i<5; i++) {
    const s = activeStudents[randInt(0, activeStudents.length-1)];
    const p = await db.post.create({
      data: { userId:s.id, classId:cls.id, type:"HELP_SKILL", content:HELP_SKILLS[i], createdAt:dayOffset(randInt(0,6)) },
    });
    helpPosts.push(p);
  }
  for (let i=0; i<3; i++) {
    const s = students.filter(x=>x.persona==="volatile")[i] ?? activeStudents[i];
    const p = await db.post.create({
      data: { userId:s.id, classId:cls.id, type:"HELP_EMOTION", content:HELP_EMOTIONS[i], anonymous:true, createdAt:dayOffset(randInt(0,3)) },
    });
    helpPosts.push(p);
  }
  // 回应
  const responders = activeStudents.slice(0, 6);
  for (const hp of helpPosts.slice(0, 5)) {
    const r = pick(responders);
    await db.post.create({
      data: {
        userId:r.id, classId:cls.id, type:"HELP_SKILL", parentId:hp.id,
        content: pick(["我可以帮你看看","跟我来吧","这个我会！私聊","我来","+1 同问"]),
        createdAt: new Date(hp.createdAt.getTime() + randInt(1,6)*3600000),
      },
    });
  }

  // ───── 6. 状态粒子 — 每天 3-8 条 ─────
  for (let day=6; day>=0; day--) {
    const count = randInt(3, 8);
    for (let i=0; i<count; i++) {
      const s = pick(activeStudents);
      const created = new Date(dayOffset(day).getTime() + randInt(8,23)*3600000);
      await db.post.create({
        data: { userId:s.id, classId:cls.id, type:"STATE_PARTICLE", content:pick(PARTICLE_LABELS), expiresAt:new Date(created.getTime()+86400000), createdAt:created },
      });
    }
  }

  // ───── 7. 多余的好意 — 5 条 ─────
  for (let i=0; i<5; i++) {
    const s = pick(activeStudents);
    await db.post.create({
      data: { userId:s.id, classId:cls.id, type:"GOOD_DEED", content:GOOD_DEEDS[i], createdAt:dayOffset(randInt(0,5)) },
    });
  }

  // ───── 8. 树洞碎碎念 — 6 条 ─────
  for (let i=0; i<6; i++) {
    const s = pick(students);
    await db.post.create({
      data: { userId:s.id, classId:cls.id, type:"HELP_EMOTION", content:TREEHOLE_POSTS[i], treehole:true, createdAt:dayOffset(randInt(0,6)) },
    });
  }

  // ───── 9. 隐形成长点亮 — 4 次 ─────
  for (let i=0; i<4; i++) {
    const from = pick(activeStudents);
    let to = pick(students.filter(x=>x.id!==from.id));
    // 优先点亮回暖型
    const recovering = students.filter(x=>x.persona==="recovering");
    if (recovering.length>0 && i<3) to = recovering[i];
    await db.growthMoment.create({
      data: {
        fromUserId:from.id, toUserId:to.id,
        reason: pick([
          "我注意到你最近变自信了","谢谢你那天帮我","你其实很会安慰人","最近看到你在努力，很触动",
        ]),
        createdAt: dayOffset(randInt(0,3)),
      },
    });
  }

  // ───── 10. 设置部分学生的最后活跃时间（制造"需关注"信号）─────
  const edgeStudents = students.filter(s=>s.persona==="edge");
  for (let i=0; i<4; i++) {
    await db.user.update({
      where:{id: edgeStudents[i].id},
      data:{ lastActiveAt: dayOffset(randInt(7,10)) },
    });
  }
  // 回暖型的学生：前半周情绪差，后半周好 —— 已经由 mood 逻辑覆盖

  console.log("Seed done: 1 counselor + 50 students + 7 days of real data");
  console.log(`Topics: 12 (7 synced to square) | Help: 8 | Particles: many | Good deeds: 5 | Treehole: 6 | Growth: 4`);
}

main().catch(console.error).finally(()=>db.$disconnect());
