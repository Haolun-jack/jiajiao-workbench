import { generateLessonPlanDraft } from "@/lib/lesson-plan-generator";
import { ok, serverError } from "@/lib/api";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const content = generateLessonPlanDraft({
      title: body?.title ? String(body.title) : undefined,
      subject: body?.subject ? String(body.subject) : undefined,
      studentName: body?.studentName ? String(body.studentName) : undefined,
      classNo: body?.classNo ? Number(body.classNo) : undefined,
      sourceText: body?.sourceText ? String(body.sourceText) : undefined,
    });
    return ok({ content });
  } catch (error) {
    return serverError(error);
  }
}
