import MistakeForm from "@/components/mistake-form";

export default async function NewMistakePage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <MistakeForm
      initialStudentId={sp.studentId ? Number(sp.studentId) : null}
    />
  );
}
