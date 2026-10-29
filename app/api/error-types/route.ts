import { prisma } from "@/lib/db";
import { ok, serverError } from "@/lib/api";

export async function GET() {
  try {
    const errorTypes = await prisma.errorType.findMany({
      orderBy: { code: "asc" },
    });
    return ok(errorTypes);
  } catch (error) {
    return serverError(error);
  }
}
