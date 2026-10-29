import { prisma } from "@/lib/db";
import { badRequest, created, notFound, ok, serverError } from "@/lib/api";
import {
  buildEvaluationItems,
  RULE_VERSION,
  type Level,
} from "@/lib/evaluation-engine";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const studentId = url.searchParams.get("studentId");
    const evaluations = await prisma.evaluation.findMany({
      where: studentId ? { studentId: Number(studentId) } : undefined,
      include: {
        student: { select: { id: true, name: true } },
        items: {
          include: {
            indicator: { include: { dimension: true } },
          },
          orderBy: { id: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok(evaluations);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const studentId = Number(body?.studentId);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return badRequest("请选择学生");
    }

    const student = await prisma.student.findUnique({ where: { id: studentId } });
    if (!student) return notFound("学生不存在");

    const now = new Date();
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodStart = body?.periodStart
      ? new Date(String(body.periodStart))
      : defaultStart;
    const periodEnd = body?.periodEnd ? new Date(String(body.periodEnd)) : now;
    if (
      Number.isNaN(periodStart.getTime()) ||
      Number.isNaN(periodEnd.getTime())
    ) {
      return badRequest("诊断周期日期无效");
    }
    if (periodStart > periodEnd) {
      return badRequest("开始日期不能晚于结束日期");
    }

    const mistakes = await prisma.mistake.findMany({
      where: {
        studentId,
        createdAt: { gte: periodStart, lte: periodEnd },
      },
      include: { indicators: { select: { indicatorId: true } } },
    });
    const totalMistakes = mistakes.length;

    const indicators = await prisma.evaluationIndicator.findMany({
      include: { dimension: true },
      orderBy: { id: "asc" },
    });

    const counts = new Map<number, number>();
    for (const mistake of mistakes) {
      for (const link of mistake.indicators) {
        counts.set(link.indicatorId, (counts.get(link.indicatorId) ?? 0) + 1);
      }
    }

    const items = buildEvaluationItems(indicators, counts, totalMistakes);
    const nameById = new Map(indicators.map((i) => [i.id, i.name]));
    const levelWeight: Record<Level, number> = {
      severe: 3,
      medium: 2,
      light: 1,
      none: 0,
    };
    const levelLabel: Record<Level, string> = {
      severe: "重度",
      medium: "中度",
      light: "轻度",
      none: "未发现",
    };
    const top = items
      .filter((i) => i.level !== "none")
      .sort((a, b) => levelWeight[b.level] - levelWeight[a.level])
      .slice(0, 5);

    const summary =
      top.length === 0
        ? `本周期共 ${totalMistakes} 道错题，暂未形成明显薄弱项。`
        : `本周期共 ${totalMistakes} 道错题，主要薄弱项：${top
            .map(
              (item, index) =>
                `${index + 1}. ${nameById.get(item.indicatorId)}（${levelLabel[item.level]}）`,
            )
            .join("；")}。`;

    const itemData = items.map((item) => ({
      indicatorId: item.indicatorId,
      level: item.level,
      mistakeCount: item.mistakeCount,
      totalMistakes: item.totalMistakes,
      note: item.note,
    }));

    const existing = await prisma.evaluation.findFirst({
      where: { studentId, periodStart, periodEnd },
    });

    const evaluation = await prisma.$transaction(async (tx) => {
      if (existing) {
        await tx.evaluationItem.deleteMany({ where: { evaluationId: existing.id } });
        return tx.evaluation.update({
          where: { id: existing.id },
          data: {
            summary,
            ruleVersion: RULE_VERSION,
            items: { create: itemData },
          },
          include: {
            student: { select: { id: true, name: true } },
            items: {
              include: { indicator: { include: { dimension: true } } },
              orderBy: { id: "asc" },
            },
          },
        });
      }
      return tx.evaluation.create({
        data: {
          studentId,
          periodStart,
          periodEnd,
          summary,
          ruleVersion: RULE_VERSION,
          items: { create: itemData },
        },
        include: {
          student: { select: { id: true, name: true } },
          items: {
            include: { indicator: { include: { dimension: true } } },
            orderBy: { id: "asc" },
          },
        },
      });
    });
    return created(evaluation);
  } catch (error) {
    return serverError(error);
  }
}
