import { prisma } from "@/lib/db";
import { notFound, ok, serverError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: Number(id) },
      include: {
        student: { select: { id: true, name: true } },
        items: {
          include: {
            indicator: { include: { dimension: true } },
          },
          orderBy: { id: "asc" },
        },
      },
    });
    return evaluation ? ok(evaluation) : notFound();
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    await prisma.evaluation.delete({ where: { id: Number(id) } });
    return ok({ deleted: true });
  } catch (error) {
    return serverError(error);
  }
}
