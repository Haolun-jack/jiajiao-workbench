import { prisma } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const lessonPlan = await prisma.lessonPlan.findUnique({
      where: { id: Number(id) },
      include: { student: { select: { id: true, name: true } } },
    });
    return lessonPlan ? ok(lessonPlan) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const lessonPlan = await prisma.lessonPlan.update({
      where: { id: Number(id) },
      data: {
        title: body?.title ? String(body.title).trim() : undefined,
        content: body?.content !== undefined ? String(body.content) : undefined,
        studentId: body?.studentId !== undefined ? Number(body.studentId) || null : undefined,
        classNo: body?.classNo !== undefined ? Number(body.classNo) || null : undefined,
        sourceType: body?.sourceType ? String(body.sourceType) : undefined,
        sourceFileName: body?.sourceFileName !== undefined ? String(body.sourceFileName) || null : undefined,
        sourceText: body?.sourceText !== undefined ? String(body.sourceText) || null : undefined,
        status: body?.status ? String(body.status) : undefined,
      },
    });
    return ok(lessonPlan);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.lessonPlan.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
