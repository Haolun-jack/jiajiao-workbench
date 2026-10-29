import { prisma } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

function toIdList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter((n) => Number.isInteger(n) && n > 0);
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const mistake = await prisma.mistake.findUnique({
      where: { id: Number(id) },
      include: {
        student: { select: { id: true, name: true } },
        errorTypes: { include: { errorType: true } },
        indicators: { include: { indicator: { include: { dimension: true } } } },
      },
    });
    return mistake ? ok(mistake) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    const errorTypeIds = toIdList(body?.errorTypeIds);
    const indicatorIds = toIdList(body?.indicatorIds);

    const mistake = await prisma.mistake.update({
      where: { id: Number(id) },
      data: {
        studentId: body?.studentId ? Number(body.studentId) : undefined,
        classRecordId: body?.classRecordId !== undefined ? Number(body.classRecordId) || null : undefined,
        subject: body?.subject ? String(body.subject).trim() : undefined,
        knowledgePoint: body?.knowledgePoint ? String(body.knowledgePoint).trim() : undefined,
        category: body?.category !== undefined ? String(body.category).trim() || null : undefined,
        source: body?.source ? String(body.source) : undefined,
        difficulty: body?.difficulty ? String(body.difficulty) : undefined,
        question: body?.question !== undefined ? String(body.question) : undefined,
        questionImagePath: body?.questionImagePath !== undefined ? String(body.questionImagePath) || null : undefined,
        studentAnswer: body?.studentAnswer !== undefined ? String(body.studentAnswer) || null : undefined,
        process: body?.process !== undefined ? String(body.process) || null : undefined,
        wrongAnswer: body?.wrongAnswer !== undefined ? String(body.wrongAnswer) || null : undefined,
        correctAnswer: body?.correctAnswer !== undefined ? String(body.correctAnswer) || null : undefined,
        status: body?.status ? String(body.status) : undefined,
        ...(Array.isArray(body?.errorTypeIds)
          ? {
              errorTypes: {
                deleteMany: {},
                create: errorTypeIds.map((errorTypeId) => ({ errorTypeId })),
              },
            }
          : {}),
        ...(Array.isArray(body?.indicatorIds)
          ? {
              indicators: {
                deleteMany: {},
                create: indicatorIds.map((indicatorId) => ({ indicatorId })),
              },
            }
          : {}),
      },
      include: {
        errorTypes: { include: { errorType: true } },
        indicators: { include: { indicator: true } },
      },
    });
    return ok(mistake);
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.mistake.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
