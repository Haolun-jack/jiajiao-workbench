import { prisma } from "@/lib/db";
import { badRequest, created, ok, serverError } from "@/lib/api";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const students = await prisma.student.findMany({
      where: q
        ? {
            OR: [
              { name: { contains: q } },
              { school: { contains: q } },
              { phone: { contains: q } },
            ],
          }
        : undefined,
      orderBy: { updatedAt: "desc" },
    });
    return ok(students);
  } catch (error) {
    return serverError(error);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const name = String(body?.name ?? "").trim();
    const grade = String(body?.grade ?? "").trim();
    if (!name || !grade) {
      return badRequest("姓名和年级为必填项");
    }
    const student = await prisma.student.create({
      data: {
        name,
        grade,
        school: body?.school ? String(body.school).trim() : null,
        phone: body?.phone ? String(body.phone).trim() : null,
        subject: body?.subject ? String(body.subject).trim() : "物理",
        goal: body?.goal ? String(body.goal).trim() : null,
        note: body?.note ? String(body.note).trim() : null,
      },
    });
    return created(student);
  } catch (error) {
    return serverError(error);
  }
}
