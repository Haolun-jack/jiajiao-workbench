import { prisma } from "@/lib/db";
import { matchErrorTypesToIndicators } from "@/lib/mistake-matching";
import { badRequest, ok, serverError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const raw: unknown = body?.errorTypeIds;
    const ids: number[] = Array.isArray(raw)
      ? raw
          .map((x: unknown) => Number(x))
          .filter((n: number) => Number.isInteger(n) && n > 0)
      : [];
    if (ids.length === 0) {
      return ok({ indicators: [] });
    }

    const errorTypes = await prisma.errorType.findMany({ where: { id: { in: ids } } });
    const names = Array.from(
      new Set(errorTypes.flatMap((t) => matchErrorTypesToIndicators(t.code))),
    );
    const indicators = await prisma.evaluationIndicator.findMany({
      where: { name: { in: names } },
      include: { dimension: true },
      orderBy: { id: "asc" },
    });
    return ok({ indicators });
  } catch (error) {
    return serverError(error);
  }
}
