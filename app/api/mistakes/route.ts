import { prisma } from "@/lib/db";
import { badRequest, created, ok, serverError } from "@/lib/api";

function toIdList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.map(Number).filter((n) => Number.isInteger(n) && n > 0);
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const status = url.searchParams.get("status");
    const mistakes = await prisma.mistake.findMany({
      where: {
        ...(studentId ? { studentId: Number(studentId) } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: { select: { id: true, name: true } },
        errorTypes: { include: { errorType: true } },
        indicators: { include: { indicator: { include: { dimension: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(mistakes);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const studentId = Number(body?.studentId);
    const knowledgePoint = String(body?.knowledgePoint ?? "").trim();
    const question = String(body?.question ?? "").trim();
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return badRequest("studentId 为必填项");
    }
    if (!knowledgePoint || !question) {
      return badRequest("知识点和题干为必填项");
    }

    const errorTypeIds = toIdList(body?.errorTypeIds);
    const indicatorIds = toIdList(body?.indicatorIds);

    const mistake = await prisma.mistake.create({
      data: {
        studentId,
        knowledgePoint,
        question,
        classRecordId: body?.classRecordId ? Number(body.classRecordId) : null,
        subject: body?.subject ? String(body.subject).trim() : "物理",
        category: body?.category ? String(body.category).trim() : null,
        source: body?.source ? String(body.source) : "homework",
        difficulty: body?.difficulty ? String(body.difficulty) : "medium",
        questionImagePath: body?.questionImagePath ? String(body.questionImagePath) : null,
        studentAnswer: body?.studentAnswer ? String(body.studentAnswer) : null,
        process: body?.process ? String(body.process) : null,
        wrongAnswer: body?.wrongAnswer ? String(body.wrongAnswer) : null,
        correctAnswer: body?.correctAnswer ? String(body.correctAnswer) : null,
        status: body?.status ? String(body.status) : "unmastered",
        errorTypes: {
          create: errorTypeIds.map((errorTypeId) => ({ errorTypeId })),
        },
        indicators: {
          create: indicatorIds.map((indicatorId) => ({ indicatorId })),
        },
      },
      include: {
        errorTypes: { include: { errorType: true } },
        indicators: { include: { indicator: true } },
      },
    });
    return created(mistake);
  } catch (error) {
    return serverError(error);
  }
}
