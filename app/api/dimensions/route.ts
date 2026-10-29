import { prisma } from "@/lib/db";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const dimensions = await prisma.evaluationDimension.findMany({
      orderBy: { sort: "asc" },
      include: {
        indicators: {
          orderBy: { sort: "asc" },
        },
      },
    });
    return ok(dimensions);
  } catch (error) {
    return serverError(error);
  }
}
