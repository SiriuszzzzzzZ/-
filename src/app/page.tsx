import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (user?.role === "COUNSELOR") redirect("/dashboard");
  if (user?.classId) redirect(`/class/${user.classId}`);
  redirect("/setup");
}
