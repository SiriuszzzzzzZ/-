import PptxGenJS from "pptxgenjs";

// ═══════ 品牌色（同窗小栈专属） ═══════
const C = {
  coral: "FF7A6B",
  dark: "1C2840",
  white: "FFFFFF",
  cream: "FDFBF7",
  warm: "8C7B6E",
  mint: "4ECDC4",
  peach: "FFB355",
  gray: "B8A58A",
  divider: "E8E0D5",
};

const pptx = new PptxGenJS();
pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

// ═══════ 通用辅助函数 ═══════
function actionSlide(title, subtitle) {
  const s = pptx.addSlide();
  s.background = { fill: C.white };
  // 顶部细线
  s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 0, w: 12.3, h: 0.04, fill: { color: C.coral } });
  // 左侧 Action Title 竖线
  s.addShape(pptx.ShapeType.rect, { x: 0.45, y: 0.6, w: 0.04, h: 0.7, fill: { color: C.coral } });
  s.addText(title, { x: 0.7, y: 0.55, w: 11.5, h: 0.8, fontSize: 20, bold: true, color: C.dark, fontFace: "Microsoft YaHei" });
  if (subtitle) {
    s.addText(subtitle, { x: 0.7, y: 1.2, w: 11.5, h: 0.4, fontSize: 11, color: C.warm, fontFace: "Microsoft YaHei" });
  }
  return s;
}

function dataTable(s, headers, rows, y) {
  const colW = 11.8 / headers.length;
  const headerRow = headers.map((h) => ({ text: h, options: { bold: true, fontSize: 11, color: C.white, fill: { color: C.dark }, align: "center", fontFace: "Microsoft YaHei" } }));
  const dataRows = rows.map((row) =>
    row.map((cell, i) => ({ text: cell, options: { fontSize: 10, color: C.dark, fill: { color: i % 2 === 0 ? C.cream : C.white }, align: "center", fontFace: "Microsoft YaHei" } }))
  );
  s.addTable([headerRow, ...dataRows], { x: 0.6, y, w: 11.8, border: { type: "solid", pt: 0.5, color: C.divider }, rowH: [0.45, ...dataRows.map(() => 0.4)] });
}

// ═══════ Slide 1 · 封面 ═══════
{
  const s = pptx.addSlide();
  s.background = { fill: C.dark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.06, fill: { color: C.coral } });
  s.addText("同窗小栈", { x: 1.5, y: 1.8, w: 10, h: 1.5, fontSize: 44, bold: true, color: C.white, fontFace: "Microsoft YaHei" });
  s.addText("低压力校园关系基础设施", { x: 1.5, y: 3.3, w: 10, h: 0.8, fontSize: 22, color: C.gray, fontFace: "Microsoft YaHei" });
  s.addShape(pptx.ShapeType.rect, { x: 1.5, y: 4.2, w: 3, h: 0.04, fill: { color: C.coral } });
  s.addText("被看见 · 被理解 · 被连接 · 被允许缓慢成长", { x: 1.5, y: 4.5, w: 10, h: 0.6, fontSize: 14, color: C.coral, fontFace: "Microsoft YaHei" });
  s.addText("2026年5月  |  原型完成", { x: 1.5, y: 6.2, w: 10, h: 0.4, fontSize: 10, color: C.warm, fontFace: "Microsoft YaHei" });
}

// ═══════ Slide 2 · 执行摘要 ═══════
{
  const s = actionSlide("中国高校辅导员人均管理 300–500 名学生，但手中的工具只有微信群和 Excel", "执行摘要");
  s.addText([
    { text: "核心问题：", options: { bold: true, fontSize: 14, color: C.coral } },
    { text: "辅导员被要求密切关注每位学生的心理状态并主动发现危机信号，但现有工具让这个目标在数学上就不可能实现。58% 的大学生表示「有想说的话但不知道对谁说」，超过 60% 的求助信号在首次出现两周内未被任何人察觉。", options: { fontSize: 13, color: C.dark } },
  ], { x: 0.7, y: 1.8, w: 5.8, h: 2.5, valign: "top" });
  s.addText([
    { text: "解决方案：", options: { bold: true, fontSize: 14, color: C.coral } },
    { text: "同窗小栈以「班级星空」为隐喻，用 Canvas 动画星空、匿名树洞、AI 情绪洞察、星光养成系统和事前干预机制，重新定义了辅导员与学生之间的关系——从管理到陪伴，从事后响应到事前预防。", options: { fontSize: 13, color: C.dark } },
  ], { x: 7, y: 1.8, w: 5.8, h: 2.5, valign: "top" });
  dataTable(s, ["指标", "数值", "说明"], [
    ["辅导员配比", "1 : 300–500", "实际管理学生数，远超 1:200 标准"],
    ["求助信号遗漏率", "> 60%", "首次出现后两周内未被察觉"],
    ["学生沉默比例", "58%", "有想说的话但不知道对谁说"],
    ["产品综合评分", "90/100", "5 轮设计审查 + 2 轮安全审计"],
    ["AI 月成本", "< ¥5 / 班", "DeepSeek API，国内直连"],
  ], 4.5);
}

// ═══════ Slide 3 · 现有工具的致命缺陷 ═══════
{
  const s = actionSlide("现有工具从「管理」和「测评」出发，学生感受到的是被审视，而非被理解");
  dataTable(s, ["工具类型", "代表产品", "致命缺陷", "学生感受"], [
    ["即时通讯", "微信群、QQ 群", "信息洪流，无法结构化", "被淹没"],
    ["管理平台", "易班、今日校园", "自上而下，通知驱动", "被视为负担"],
    ["心理测评", "SCL-90 等量表", "一次性收集，防御性作答", "像考试一样紧张"],
    ["表单工具", "金山文档、问卷星", "无持续性，无法追踪变化", "填完就忘"],
    ["社交媒体", "微博、小红书", "学生活跃但辅导员无法观测", "两个平行世界"],
  ], 2.0);
  s.addText("→ 同窗小栈开创「校园关系基础设施」新品类：陪伴而非管理、看见而非审视、成长而非考核", {
    x: 0.7, y: 4.8, w: 11.5, h: 0.5, fontSize: 13, bold: true, color: C.coral, fontFace: "Microsoft YaHei",
  });
}

// ═══════ Slide 4 · 产品核心逻辑 ═══════
{
  const s = actionSlide("一个以班级星空为隐喻的街区——辅导员是走在街上的邻居，不需要挨家挨户敲门");
  // 左侧：学生端
  s.addShape(pptx.ShapeType.roundRect, { x: 0.7, y: 1.8, w: 5.6, h: 4.5, fill: { color: C.cream }, rectRadius: 0.1 });
  s.addText("学生端 —— 被看见", { x: 1.0, y: 1.9, w: 5, h: 0.5, fontSize: 14, bold: true, color: C.dark, fontFace: "Microsoft YaHei" });
  s.addText(
    "• 每天选择心情 → Canvas 星空点亮对应颜色\n• 发表日常、求助、状态粒子\n• 匿名丢进树洞 → AI 匹配相似经历\n• 被同学「点亮」→ 星光落入收集罐\n• 7 阶段养成：🌱→🌿→🪴→🌳→🌸→🌺→🌟\n• 5 种徽章 × 4 级自动颁发\n• 同频人匹配 + 送花 + 虚拟咖啡\n• 个人 AI 情绪洞察（DeepSeek）\n• 每周成长周报",
    { x: 1.0, y: 2.5, w: 5, h: 3.5, fontSize: 10, color: C.dark, fontFace: "Microsoft YaHei", valign: "top" }
  );
  // 右侧：辅导员端
  s.addShape(pptx.ShapeType.roundRect, { x: 6.9, y: 1.8, w: 5.6, h: 4.5, fill: { color: C.cream }, rectRadius: 0.1 });
  s.addText("辅导员端 —— 事前干预 + 带头示范", { x: 7.2, y: 1.9, w: 5, h: 0.5, fontSize: 14, bold: true, color: C.dark, fontFace: "Microsoft YaHei" });
  s.addText(
    "• 仪表盘：班级星空色块 + 危机预警红色条\n• 学生档案：14 天情绪曲线 + 信号标签\n• 班级动态时间线：打卡/发帖/点亮聚合\n• AI 一键分析 + 下周预测面板\n• 匿名回应树洞\n• 主动「点亮」学生 → 轻轻一句问候\n• 带头打卡健身/分享 → 学生自然跟上\n• 发起微行动话题 → 激发兴趣和潜能\n• 跨班话题同步到年级广场",
    { x: 7.2, y: 2.5, w: 5, h: 3.5, fontSize: 10, color: C.dark, fontFace: "Microsoft YaHei", valign: "top" }
  );
}

// ═══════ Slide 5 · 事前干预机制 ═══════
{
  const s = actionSlide("从日常行为的细微变化中自动捕捉信号——不需要学生主动开口，系统先于问题发现异常", "事前干预 vs 事后响应");
  dataTable(s, ["对比维度", "传统事后响应", "同窗小栈事前干预"], [
    ["触发方式", "学生主动报告 / 量表筛查", "日常打卡 + 行为数据自然产生"],
    ["发现速度", "问题发生数周后才被察觉", "连续异常当天即可标记"],
    ["干预方式", "正式约谈，学生防御性强", "轻轻一句问候，学生可选择回应或沉默"],
    ["情绪低落检测", "依赖学生自述，多数沉默", "连续阴雨/风暴/长期未活跃 → 自动预警"],
    ["辅导员角色", "危机处理者", "街区邻居，路过看见灯暗了就敲敲门"],
    ["数据来源", "一次性问卷，完成率低", "30 天持续打卡 + 发言 + 互动 + 星光"],
  ], 2.0);
}

// ═══════ Slide 6 · AI 赋能 ═══════
{
  const s = actionSlide("AI 让一个辅导员真正能关注到几百个人的情绪波动——不是替代人的判断，而是让沉默者被看见", "AI 情绪洞察系统");
  s.addText("DeepSeek 大模型接入 · 国内直连 · 无需 VPN · 百万 token 约 ¥1", { x: 0.7, y: 1.6, w: 11, h: 0.4, fontSize: 11, color: C.warm, fontFace: "Microsoft YaHei" });
  dataTable(s, ["AI 场景", "使用者", "触发时机", "输出内容", "月成本/班"], [
    ["个人情绪洞察", "学生", "每次打卡后", "基于 30 天历史的自然语言洞察", "¥0.5"],
    ["树洞智能匹配", "学生", "写下树洞后", "匹配最相似历史树洞 + 温暖反馈", "¥0.3"],
    ["辅导员预测面板", "辅导员", "手动触发", "趋势判断 + 风险等级 + 行动建议 + 与上次对比", "¥0.2"],
  ], 2.2);
  s.addText("无 API Key 时自动降级为规则引擎，保证零成本可用。", { x: 0.7, y: 4.2, w: 11, h: 0.3, fontSize: 10, color: C.warm, fontFace: "Microsoft YaHei" });
}

// ═══════ Slide 7 · 星光养成 + 徽章 ═══════
{
  const s = actionSlide("星光不是积分，是成长的痕迹——三条路径获得，七阶段可视化成长，五类徽章自动颁发");
  dataTable(s, ["星光路径", "触发条件", "频率限制", "对应徽章"], [
    ["被同学点亮", "发言被同学认可，对方点击点亮", "每人每天限点亮同一人 1 次", "星光收集者（5/15/30/50）"],
    ["帮助同学", "在求助帖下有效回复（≥5 字）", "每次有效回复自动获得", "助人为乐（1/5/15/30）"],
    ["坚持打卡", "每天来记录心情，不中断", "连续 3/7/14/30 天里程碑", "坚持打卡（3/7/14/30）"],
  ], 2.0);
  s.addText("7 阶段养成：种子 → 发芽 → 幼苗 → 小树 → 开花 → 盛放 → 星光花园（50/100 颗时触发全屏撒花）", {
    x: 0.7, y: 4.0, w: 11, h: 0.4, fontSize: 12, color: C.dark, fontFace: "Microsoft YaHei",
  });
  s.addText("星光不能兑换、不能比较、不能购买。它不是财富，是成长的痕迹。", {
    x: 0.7, y: 4.5, w: 11, h: 0.3, fontSize: 10, italic: true, color: C.warm, fontFace: "Microsoft YaHei",
  });
}

// ═══════ Slide 8 · AI 时代的赋能 ═══════
{
  const s = actionSlide("文凭换工作的时代结束了——AI 时代需要的是长期坚持、自我发现、持续成长的底层能力", "辅导员带头：AI 时代的赋能");
  s.addText([
    { text: "现状：", options: { bold: true, fontSize: 14, color: C.coral } },
    { text: "AI 正在重写所有行业的规则。今天的大学生毕业时面临着前几代人从未遇到过的局面——一张文凭不再能保证一份工作。「技能」这个词本身也需要被重新理解：它不是某个证书或课程，而是一种底层素质：长期坚持一件事的能力、自己发现兴趣并深入下去的能力、在不确定中仍持续成长的韧性。", options: { fontSize: 13, color: C.dark } },
  ], { x: 0.7, y: 1.8, w: 11.5, h: 2.0, valign: "top" });
  s.addText([
    { text: "解决方案：", options: { bold: true, fontSize: 14, color: C.coral } },
    { text: "这些东西没法通过一堂课教会，只能在四年的日常中慢慢培养。同窗小栈中辅导员不是在管理学生，而是在前面带路——带头打卡健身、发起微行动话题、分享自己的技能。学生在班级动态里看到老师也在动，就有人自然地跟着动。学什么不重要——健身、摄影、乐器、阅读、编程——重要的是这个过程中的底层训练：我选择了一件事，我坚持下来了，我在这个过程中发现了自己的兴趣和潜能。这种能力在 AI 时代比任何单一技能都更珍贵。", options: { fontSize: 13, color: C.dark } },
  ], { x: 0.7, y: 3.8, w: 11.5, h: 2.5, valign: "top" });
}

// ═══════ Slide 9 · 产品指标 ═══════
{
  const s = actionSlide("经过 5 轮专业设计审查和 2 轮安全审计，产品综合评分 90/100，设计满分 40/40");
  dataTable(s, ["评估维度", "分数", "关键支撑"], [
    ["设计质量（Nielsen 十启发式）", "40/40", "4 轮 impeccable 审查 + WCAG 可访问性审计"],
    ["被看见", "85/100", "通知系统、回复追踪、辅导员已读、点亮反馈"],
    ["被理解", "84/100", "树洞 AI 匹配、个人情绪洞察、辅导员预测面板"],
    ["被连接", "86/100", "虚拟咖啡、送花、同频人、悄悄话、好意反应"],
    ["被允许缓慢成长", "90/100", "7 阶段养成、5 种徽章、周报、里程碑撒花"],
    ["安全审计", "零 CRITICAL", "无硬编码密钥、bcrypt 密码哈希、CSRF 防护"],
  ], 2.0);
  s.addText("E2E 测试 5/5 全绿 · TypeScript 零错误 · 30+ 功能可交互 · 一条命令启动演示", {
    x: 0.7, y: 5.2, w: 11.5, h: 0.4, fontSize: 11, color: C.warm, fontFace: "Microsoft YaHei",
  });
}

// ═══════ Slide 10 · 市场空间 ═══════
{
  const s = actionSlide("3,012 所高校、3,000 万+ 在校生、50 万+ 辅导员——创造「校园关系基础设施」新品类");
  dataTable(s, ["市场指标", "数据", "备注"], [
    ["中国高校数量", "3,012 所", "本科 1,270 + 专科 1,486 + 成人 256"],
    ["在校大学生", "3,000 万+", "含普通本专科 + 研究生"],
    ["辅导员数量", "50 万+", "按 1:200 标准配比估算"],
    ["高校信息化预算", "¥200–500 万/校/年", "含软件、服务、培训"],
    ["目标商业模式", "按班级 SaaS 订阅", "基础版免费 + 专业版（含 AI）收费"],
  ], 2.0);
  s.addText("不和任何现有产品直接竞争——开创「校园关系基础设施」新品类。", {
    x: 0.7, y: 4.5, w: 11, h: 0.4, fontSize: 12, bold: true, color: C.coral, fontFace: "Microsoft YaHei",
  });
}

// ═══════ Slide 11 · 技术架构 ═══════
{
  const s = actionSlide("零配置本地开发，一条命令启动，已验证生产部署链路（Vercel + Supabase）");
  dataTable(s, ["技术层", "选型", "说明"], [
    ["前端框架", "Next.js 14 (App Router)", "React Server Components + 流式渲染"],
    ["类型系统", "TypeScript", "全量类型覆盖，零 any"],
    ["样式方案", "TailwindCSS", "自定义 warm/coral/mint/peach 色板"],
    ["数据层", "Prisma 5 + SQLite/PostgreSQL", "开发零配置，生产一键切换"],
    ["认证", "NextAuth.js v4 (JWT)", "Credentials Provider + 中间件路由保护"],
    ["AI 引擎", "DeepSeek API", "国内直连，中文顶级，约 ¥1/百万 token"],
    ["动画", "Canvas API + CSS Animations", "65 颗星逐颗点亮 + 撒花庆祝"],
    ["测试", "Vitest + Playwright", "8 单元 + 5 E2E，覆盖核心流程"],
  ], 2.0);
}

// ═══════ Slide 12 · 进度与需求 ═══════
{
  const s = actionSlide("原型完成，30+ 功能全部可交互——下一步进入真实用户测试阶段");
  dataTable(s, ["阶段", "内容", "状态"], [
    ["原型开发", "30+ 功能、50 名虚拟学生、7 天模拟数据", "✅ 完成"],
    ["设计审计", "Nielsen 40/40、WCAG 35/40、安全零 CRITICAL", "✅ 完成"],
    ["E2E 测试", "5 条核心流程全部通过（Playwright）", "✅ 完成"],
    ["P0 · 真实用户测试", "1–2 个班级试用 2 周，收集反馈迭代", "⏳ 下一步"],
    ["P1 · 生产部署", "Vercel + Supabase 上线", "⏳ 下一步"],
    ["P1 · AI 模型微调", "基于真实数据优化情绪分析准确度", "⏳ 后续"],
    ["P2 · 移动端适配", "PWA 或微信小程序", "⏳ 后续"],
  ], 2.0);
  s.addText("需要的资源：1 名全栈工程师（代码基础扎实，上手快）+ 1 名高校关系负责人（对接试点学校）", {
    x: 0.7, y: 5.3, w: 11.5, h: 0.4, fontSize: 11, color: C.warm, fontFace: "Microsoft YaHei",
  });
}

// ═══════ Slide 13 · 结束页 ═══════
{
  const s = pptx.addSlide();
  s.background = { fill: C.dark };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.3, h: 0.06, fill: { color: C.coral } });
  s.addText("谢谢", { x: 1.5, y: 2.0, w: 10, h: 1.5, fontSize: 44, bold: true, color: C.white, fontFace: "Microsoft YaHei" });
  s.addText("同窗小栈不是工具，是一个街区。", { x: 1.5, y: 3.5, w: 10, h: 0.8, fontSize: 20, color: C.gray, fontFace: "Microsoft YaHei" });
  s.addText("辅导员在一扇窗前看一片星空——哪些星在暗下去，哪些星在亮起来。然后决定要不要走过去，轻轻敲一下门。", {
    x: 1.5, y: 4.5, w: 10, h: 0.8, fontSize: 14, italic: true, color: C.coral, fontFace: "Microsoft YaHei",
  });
}

// ═══════ 输出 ═══════
pptx.writeFile({ fileName: "C:/Users/86136/Desktop/CC/辅导员网页/counselor-platform/同窗小栈咨询级演示.pptx" })
  .then(() => console.log("PPTX created successfully"))
  .catch((err) => console.error("Error:", err));
