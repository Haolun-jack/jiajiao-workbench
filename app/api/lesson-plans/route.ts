import { prisma } from "@/lib/db";
import { badRequest, created, ok, serverError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const lessonPlans = await prisma.lessonPlan.findMany({
      where: studentId ? { studentId: Number(studentId) } : undefined,
      include: { student: { select: { id: true, name: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return ok(lessonPlans);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const title = String(body?.title ?? "").trim();
    const content = String(body?.content ?? "");
    if (!title || !content) {
      return badRequest("标题和教案内容为必填项");
    }
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        title,
        content,
        studentId: body?.studentId ? Number(body.studentId) : null,
        classNo: body?.classNo ? Number(body.classNo) : null,
        sourceType: body?.sourceType ? String(body.sourceType) : "blank",
        sourceFileName: body?.sourceFileName ? String(body.sourceFileName) : null,
        sourceText: body?.sourceText ? String(body.sourceText) : null,
        status: body?.status ? String(body.status) : "draft",
      },
    });
    return created(lessonPlan);
  } catch (error) {
    return serverError(error);
  }
}
