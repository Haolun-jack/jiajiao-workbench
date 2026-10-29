import { prisma } from "@/lib/db";
import { badRequest, notFound, ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id: Number(id) },
      include: {
        lessonPlans: { orderBy: { updatedAt: "desc" } },
        classRecords: { orderBy: { classDate: "desc" } },
        mistakes: { orderBy: { createdAt: "desc" } },
        evaluations: { orderBy: { createdAt: "desc" } },
      },
    });
    return student ? ok(student) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const student = await prisma.student.update({
      where: { id: Number(id) },
      data: {
        name: body?.name ? String(body.name).trim() : undefined,
        grade: body?.grade ? String(body.grade).trim() : undefined,
        school: body?.school !== undefined ? String(body.school).trim() || null : undefined,
        phone: body?.phone !== undefined ? String(body.phone).trim() || null : undefined,
        subject: body?.subject ? String(body.subject).trim() : undefined,
        goal: body?.goal !== undefined ? String(body.goal).trim() || null : undefined,
        note: body?.note !== undefined ? String(body.note).trim() || null : undefined,
      },
    });
    return ok(student);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
