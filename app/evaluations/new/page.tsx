import EvaluationGenerateForm from "@/components/evaluation-generate-form";

export default async function NewEvaluationPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <EvaluationGenerateForm
      initialStudentId={sp.studentId ? Number(sp.studentId) : null}
    />
  );
}
