import { db } from "./db";

export async function userBelongsToClass(userId: string, classId: string): Promise<boolean> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return false;
  if (user.role === "COUNSELOR") {
    const cls = await db.class.findUnique({ where: { id: classId } });
    return cls?.counselorId === userId;
  }
  return user.classId === classId;
}

export async function requireClassAccess(userId: string, classId: string): Promise<void> {
  const hasAccess = await userBelongsToClass(userId, classId);
  if (!hasAccess) throw new Error("FORBIDDEN: 无权访问该班级");
}
