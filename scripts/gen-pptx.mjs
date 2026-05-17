import PptxGenJS from "pptxgenjs";

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "WIDE", width: "13.333", height: "7.5" });
pptx.layout = "WIDE";

const COLOR_CORAL = "FF7A6B";
const COLOR_MINT = "4ECDC4";
const COLOR_DARK = "1C2840";
const COLOR_WARM = "B8A58A";
const COLOR_WHITE = "F7F1E8";

// Slide 1: Cover
const s1 = pptx.addSlide();
s1.background = { fill: COLOR_DARK };
s1.addText("同窗小栈", { x: 1, y: 2, w: 11, h: 1.5, fontSize: 48, color: "FFFFFF", bold: true, align: "center", fontFace: "Microsoft YaHei" });
s1.addText("低压力校园关系基础设施", { x: 1, y: 3.5, w: 11, h: 0.8, fontSize: 20, color: COLOR_WARM, align: "center", fontFace: "Microsoft YaHei" });
s1.addText("被看见 · 被理解 · 被连接 · 被允许缓慢成长", { x: 1, y: 4.5, w: 11, h: 0.6, fontSize: 16, color: COLOR_CORAL, align: "center", fontFace: "Microsoft YaHei" });

// Slide 2: Problem
const s2 = pptx.addSlide();
s2.addText("背景与问题", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s2.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
s2.addText([
  { text: "辅导员困境\n", options: { bold: true, fontSize: 16, color: COLOR_CORAL } },
  { text: "• 人均管理300-500名学生\n• 被要求密切关注每位学生心理状态\n• 工具只有微信群和Excel", options: { fontSize: 14 } },
], { x: 1, y: 1.4, w: 5, h: 2.5, valign: "top" });
s2.addText([
  { text: "学生困境\n", options: { bold: true, fontSize: 16, color: COLOR_CORAL } },
  { text: "• 58%有想说的话不知道对谁说\n• 47%从未主动找过辅导员\n• 60%+ 求助信号2周内未被察觉", options: { fontSize: 14 } },
], { x: 7, y: 1.4, w: 5, h: 2.5, valign: "top" });
s2.addText("核心矛盾：辅导员被要求关注每一位学生，但现有工具让这个目标在数学上就不可能实现。", { x: 1, y: 4.5, w: 11, h: 0.6, fontSize: 14, italic: true, color: COLOR_WARM });

// Slide 3: Solution
const s3 = pptx.addSlide();
s3.addText("解决方案：同窗小栈", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s3.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
s3.addText("以「班级星空」为隐喻的校园关系基础设施。不是管理工具——是学生愿意每天来坐坐的温暖空间。", { x: 1, y: 1.3, w: 11, h: 0.5, fontSize: 14 });
const s3items = [
  { text: "不设排行榜", desc: "成长不是竞争" },
  { text: "不做即时通讯", desc: "降低社交压力" },
  { text: "辅导员隐身", desc: "学生自由时不可见" },
  { text: "匿名优先", desc: "降低表达门槛" },
  { text: "不被评价", desc: "只呈现事实不给分数" },
  { text: "温暖但不幼稚", desc: "给成年人的柔软空间" },
];
s3items.forEach((item, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  s3.addShape(pptx.ShapeType.roundRect, { x: 1 + col * 3.8, y: 2.2 + row * 2.4, w: 3.5, h: 2, fill: { color: "FFFFFF" }, shadow: { type: "outer", blur: 8, offset: 2 } });
  s3.addText(item.text, { x: 1.2 + col * 3.8, y: 2.4 + row * 2.4, w: 3.2, h: 0.6, fontSize: 16, bold: true, color: COLOR_DARK });
  s3.addText(item.desc, { x: 1.2 + col * 3.8, y: 3.0 + row * 2.4, w: 3.2, h: 0.5, fontSize: 12, color: COLOR_WARM });
});

// Slide 4: Core features
const s4 = pptx.addSlide();
s4.addText("核心功能", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s4.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
const features = [
  { icon: "🌌", name: "班级星空", desc: "Canvas动画\n心情打卡\n双视角" },
  { icon: "🌲", name: "匿名树洞", desc: "AI匹配\n匿名回应\n词云" },
  { icon: "⭐", name: "星光养成", desc: "7阶段成长\n3条路径\n撒花庆祝" },
  { icon: "🤖", name: "AI洞察", desc: "个人分析\n智能匹配\n辅导员预测" },
  { icon: "☕", name: "同频人", desc: "心情匹配\n送花\n虚拟咖啡" },
  { icon: "🏅", name: "徽章系统", desc: "5种×4级\n自动颁发" },
  { icon: "📊", name: "专业面板", desc: "危机预警\n学生档案\n动态流" },
  { icon: "💬", name: "年级广场", desc: "跨班话题\n好意展板\n标签筛选" },
];
features.forEach((f, i) => {
  const col = i % 4;
  const row = Math.floor(i / 4);
  s4.addShape(pptx.ShapeType.roundRect, { x: 0.5 + col * 3.1, y: 1.3 + row * 3, w: 2.8, h: 2.7, fill: { color: "FFFFFF" }, shadow: { type: "outer", blur: 6, offset: 1 } });
  s4.addText(f.icon, { x: 0.5 + col * 3.1, y: 1.4 + row * 3, w: 2.8, h: 0.8, fontSize: 28, align: "center" });
  s4.addText(f.name, { x: 0.5 + col * 3.1, y: 2.2 + row * 3, w: 2.8, h: 0.5, fontSize: 14, bold: true, align: "center", color: COLOR_DARK });
  s4.addText(f.desc, { x: 0.5 + col * 3.1, y: 2.7 + row * 3, w: 2.8, h: 1, fontSize: 11, align: "center", color: COLOR_WARM });
});

// Slide 5: Product scores
const s5 = pptx.addSlide();
s5.addText("产品指标", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s5.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
const scores = [
  { label: "设计质量\n(Nielsen启发式)", val: "40/40" },
  { label: "被看见", val: "85/100" },
  { label: "被理解", val: "84/100" },
  { label: "被连接", val: "86/100" },
  { label: "被允许\n缓慢成长", val: "90/100" },
  { label: "综合产品", val: "90/100" },
];
scores.forEach((s, i) => {
  s5.addShape(pptx.ShapeType.roundRect, { x: 0.5 + i * 2.1, y: 1.4, w: 1.9, h: 2.8, fill: { color: i === 0 ? COLOR_DARK : i === 5 ? COLOR_CORAL : "FFFFFF" }, shadow: { type: "outer", blur: 6 } });
  s5.addText(s.label, { x: 0.5 + i * 2.1, y: 1.6, w: 1.9, h: 1.2, fontSize: 12, align: "center", color: (i === 0 || i === 5) ? "FFFFFF" : COLOR_DARK });
  s5.addText(s.val, { x: 0.5 + i * 2.1, y: 2.8, w: 1.9, h: 1, fontSize: 28, bold: true, align: "center", color: (i === 0 || i === 5) ? COLOR_MINT : COLOR_CORAL });
});
s5.addText("5轮设计审查 · 2轮安全审计 · 零CRITICAL漏洞 · 5/5 E2E全绿", { x: 0.5, y: 4.6, w: 12, h: 0.5, fontSize: 12, align: "center", color: COLOR_WARM });

// Slide 6: Tech + AI costs
const s6 = pptx.addSlide();
s6.addText("技术架构与成本", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s6.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
s6.addText([
  { text: "技术栈\n", options: { bold: true, fontSize: 16, color: COLOR_CORAL } },
  { text: "Next.js 14 + TypeScript + TailwindCSS\nPrisma 5 + SQLite/PostgreSQL\nNextAuth.js (JWT)\nDeepSeek API (国内直连)\nCanvas API + CSS Animations\nVitest + Playwright", options: { fontSize: 13 } },
], { x: 1, y: 1.4, w: 5.5, h: 4, valign: "top" });
s6.addText([
  { text: "AI 成本估算\n", options: { bold: true, fontSize: 16, color: COLOR_CORAL } },
  { text: "DeepSeek: ~1元/百万token\n\n个人洞察: ~0.5元/月/班\n树洞匹配: ~0.3元/月/班\n辅导员预测: ~0.2元/月/班\n\n一个班级月AI成本: < 5元", options: { fontSize: 13 } },
], { x: 7, y: 1.4, w: 5.5, h: 4, valign: "top" });

// Slide 7: Market
const s7 = pptx.addSlide();
s7.addText("市场与竞争", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s7.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
const marketData = [
  ["中国高校", "3,012所"],
  ["在校大学生", "3,000万+"],
  ["辅导员", "50万+"],
  ["高校信息化预算", "200-500万/校/年"],
];
marketData.forEach((m, i) => {
  s7.addShape(pptx.ShapeType.roundRect, { x: 1 + i * 3, y: 1.4, w: 2.7, h: 1.8, fill: { color: COLOR_DARK } });
  s7.addText(m[0], { x: 1 + i * 3, y: 1.6, w: 2.7, h: 0.6, fontSize: 12, color: COLOR_WARM, align: "center" });
  s7.addText(m[1], { x: 1 + i * 3, y: 2.2, w: 2.7, h: 0.8, fontSize: 22, bold: true, color: COLOR_MINT, align: "center" });
});
s7.addText("竞争定位：开创「校园关系基础设施」新品类，不与任何现有管理平台直接竞争", { x: 1, y: 3.6, w: 11, h: 0.5, fontSize: 14, italic: true, color: COLOR_WARM });
s7.addText("商业模式：按班级SaaS订阅 → 宏观情绪趋势数据服务 → 开放API平台", { x: 1, y: 4.2, w: 11, h: 0.5, fontSize: 14 });

// Slide 8: Status
const s8 = pptx.addSlide();
s8.addText("当前进度与下一步", { x: 0.5, y: 0.3, w: 12, h: 0.7, fontSize: 28, bold: true, color: COLOR_DARK });
s8.addShape(pptx.ShapeType.rect, { x: 0.5, y: 1.0, w: 1.5, h: 0.05, fill: COLOR_CORAL });
s8.addText("✅ 原型完成 | 30+功能可交互 | 一条命令启动 | 安全审计零漏洞", { x: 1, y: 1.4, w: 11, h: 0.5, fontSize: 16, bold: true, color: COLOR_MINT });
s8.addText([
  { text: "下一步\n", options: { bold: true, fontSize: 16 } },
  { text: "P0 真实用户测试：1-2个班级试用2周\nP1 生产部署：Vercel + Supabase上线\nP1 AI模型微调：基于真实数据优化\nP2 移动端适配：PWA或微信小程序", options: { fontSize: 14 } },
], { x: 1, y: 2.2, w: 5.5, h: 3 });
s8.addText([
  { text: "需要的资源\n", options: { bold: true, fontSize: 16 } },
  { text: "1名全栈工程师（代码基础扎实）\n1名高校关系负责人\n资金：服务器+AI API+第三方服务", options: { fontSize: 14 } },
], { x: 7, y: 2.2, w: 5.5, h: 3 });

// Slide 9: End
const s9 = pptx.addSlide();
s9.background = { fill: COLOR_DARK };
s9.addText("谢谢", { x: 1, y: 2, w: 11, h: 1.5, fontSize: 48, color: "FFFFFF", bold: true, align: "center" });
s9.addText("同窗小栈不是工具，是一个学生每天愿意来坐坐的地方。", { x: 1, y: 3.8, w: 11, h: 0.8, fontSize: 18, italic: true, color: COLOR_CORAL, align: "center" });

pptx.writeFile({ fileName: "C:/Users/86136/Desktop/CC/辅导员网页/counselor-platform/同窗小栈演示文稿.pptx" }).then(() => console.log("PPTX created"));
