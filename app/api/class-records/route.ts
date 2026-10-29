import { prisma } from "@/lib/db";
import { badRequest, created, ok, serverError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const classRecords = await prisma.classRecord.findMany({
      where: studentId ? { studentId: Number(studentId) } : undefined,
      include: { student: { select: { id: true, name: true } } },
      orderBy: { classDate: "desc" },
    });
    return ok(classRecords);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const studentId = Number(body?.studentId);
    const classDate = body?.classDate ? new Date(String(body.classDate)) : null;
    const content = String(body?.content ?? "").trim();
    if (!Number.isInteger(studentId) || !classDate || Number.isNaN(classDate.getTime())) {
      return badRequest("studentId 和有效的 classDate 为必填项");
    }
    if (!content) {
      return badRequest("上课内容为必填项");
    }
    const classRecord = await prisma.classRecord.create({
      data: {
        studentId,
        classDate,
        content,
        lessonPlanId: body?.lessonPlanId ? Number(body.lessonPlanId) : null,
        classNo: body?.classNo ? Number(body.classNo) : null,
        duration: body?.duration ? Number(body.duration) : null,
        attendance: body?.attendance ? String(body.attendance) : "present",
        homework: body?.homework ? String(body.homework) : null,
        performance: body?.performance ? String(body.performance) : null,
      },
    });
    return created(classRecord);
  } catch (error) {
    return serverError(error);
  }
}
