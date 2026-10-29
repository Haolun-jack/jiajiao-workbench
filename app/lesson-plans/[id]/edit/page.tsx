import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import LessonPlanForm from "@/components/lesson-plan-form";

export const dynamic = "force-dynamic";

export default async function EditLessonPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.lessonPlan.findUnique({ where: { id: Number(id) } });
  if (!plan) notFound();

  return (
    <LessonPlanForm
      plan={{
        id: plan.id,
        title: plan.title,
        studentId: plan.studentId,
        classNo: plan.classNo,
        sourceType: plan.sourceType,
        sourceFileName: plan.sourceFileName,
        sourceText: plan.sourceText,
        content: plan.content,
        status: plan.status,
      }}
    />
  );
}
