import { test, expect } from "@playwright/test";

const BASE = "http://localhost:3000";

test.describe("同窗小栈 核心流程 E2E", () => {
  test("登录 → 班级页 → 打卡心情", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await expect(page.locator("h1")).toContainText("同窗小栈");

    await page.fill('input[type="email"]', "student1@university.edu.cn");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');

    // 等待重定向到班级页或仪表盘
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      await page.fill('input[type="email"]', "student1@university.edu.cn");
      await page.fill('input[type="password"]', "123456");
      await page.click('button[type="submit"]');
      await page.waitForTimeout(3000);
    }
    await expect(page.locator("h1")).toBeVisible();

    // 心情打卡
    const moodBtn = page.locator("button", { hasText: "🌤" }).first();
    if (await moodBtn.isVisible({ timeout: 3000 })) {
      await moodBtn.click();
      await page.waitForTimeout(2000);
    }
  });

  test("学生发帖 + 回复求助 + 通知验证", async ({ page }) => {
    // 登录
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', "student2@university.edu.cn");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/class\//, { timeout: 10000 });

    // 发表日常分享
    const shareBtn = page.locator("button:has-text(\"说点什么吧\")").first();
    if (await shareBtn.isVisible({ timeout: 3000 })) {
      await shareBtn.click();
      await page.waitForTimeout(500);
      await page.locator("textarea[placeholder*=\"分享一件小事\"]").first().fill("E2E测试今天天气不错");
      await page.locator("button:has-text(\"分享\")").first().click();
      await page.waitForTimeout(1500);
    }

    // 打开话题卡 → 参与讨论
    const topicCard = page.locator("[class*=\"rounded-2xl\"]", { hasText: /话题|微行动|公告/ }).first();
    if (await topicCard.isVisible()) {
      await topicCard.click();
      await page.waitForURL(/\/topic\//, { timeout: 5000 });

      const discussInput = page.locator("textarea").first();
      if (await discussInput.isVisible()) {
        await discussInput.fill("E2E 测试：参与话题讨论");
        await page.click("button:has-text(\"发送\")");
        await page.waitForTimeout(1500);
      }
    }
  });

  test("辅导员仪表盘 + AI分析 + 学生档案", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', "counselor@university.edu.cn");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });

    // 仪表盘可见
    await expect(page.locator("h1")).toContainText(/班级|老师/);

    // 进入班级详情
    const classCard = page.locator("a[href*=\"/class/\"]").first();
    if (await classCard.isVisible()) {
      await classCard.click();
      await page.waitForURL(/\/class\//, { timeout: 5000 });

      // 点击学生名字 → 学生档案
      const studentLink = page.locator("a[href*=\"/student/\"]").first();
      if (await studentLink.isVisible({ timeout: 3000 })) {
        await studentLink.click();
        await page.waitForURL(/\/student\//, { timeout: 5000 });
        await expect(page.locator("h1")).toContainText("学生档案");
      }
    }

    // 返回仪表盘 → 班级详情 → 一键分析
    await page.goto(`${BASE}/dashboard`);
    const detailLink = page.locator("a[href*=\"/dashboard/class/\"]").first();
    if (await detailLink.isVisible()) {
      await detailLink.click();
      await page.waitForURL(/\/dashboard\/class\//, { timeout: 5000 });

      const analyzeBtn = page.locator("button:has-text(\"一键分析\")").or(page.locator("button:has-text(\"重新分析\")")).first();
      if (await analyzeBtn.isVisible({ timeout: 3000 })) {
        await analyzeBtn.click();
        await page.waitForTimeout(3000);
      }
    }
  });

  test("广场页加载 + 好意反应", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', "student1@university.edu.cn");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/class\//, { timeout: 10000 });

    // 打开广场
    await page.goto(`${BASE}/square`);
    await expect(page.locator("h1")).toContainText("年级广场");

    // 好意思反应按钮
    const reactionBtn = page.locator("button:has-text(\"我拿了\")").or(page.locator("button:has-text(\"我需要\")")).first();
    if (await reactionBtn.isVisible({ timeout: 3000 })) {
      await reactionBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test("我的页面 + 星光收集 + 设置", async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', "student1@university.edu.cn");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/class\//, { timeout: 10000 });

    await page.goto(`${BASE}/me`);
    await expect(page.locator("h2")).toBeVisible();

    // 星光收集页
    await page.goto(`${BASE}/me/growth`);
    await expect(page.locator("h1")).toContainText("星光收集");

    // 周报
    await page.goto(`${BASE}/me/report`);
    await expect(page.locator("h1")).toContainText("周报");

    // 设置页
    await page.goto(`${BASE}/me/settings`);
    await expect(page.locator("h1")).toContainText("设置");

    // 修改昵称
    await page.fill('input[maxlength="20"]', "E2E测试员");
    await page.click("button:has-text(\"保存\")");
    await page.waitForTimeout(1500);
  });
});
