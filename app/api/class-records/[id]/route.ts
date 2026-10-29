import { prisma } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const classRecord = await prisma.classRecord.findUnique({
      where: { id: Number(id) },
      include: { student: { select: { id: true, name: true } } },
    });
    return classRecord ? ok(classRecord) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const classRecord = await prisma.classRecord.update({
      where: { id: Number(id) },
      data: {
        studentId: body?.studentId ? Number(body.studentId) : undefined,
        lessonPlanId: body?.lessonPlanId !== undefined ? Number(body.lessonPlanId) || null : undefined,
        classDate: body?.classDate ? new Date(String(body.classDate)) : undefined,
        classNo: body?.classNo !== undefined ? Number(body.classNo) || null : undefined,
        duration: body?.duration !== undefined ? Number(body.duration) || null : undefined,
        attendance: body?.attendance ? String(body.attendance) : undefined,
        content: body?.content !== undefined ? String(body.content) : undefined,
        homework: body?.homework !== undefined ? String(body.homework) || null : undefined,
        performance: body?.performance !== undefined ? String(body.performance) || null : undefined,
      },
    });
    return ok(classRecord);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.classRecord.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
