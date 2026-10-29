import LessonPlanForm from "@/components/lesson-plan-form";

export default async function NewLessonPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <LessonPlanForm
      initialStudentId={sp.studentId ? Number(sp.studentId) : null}
    />
  );
}
