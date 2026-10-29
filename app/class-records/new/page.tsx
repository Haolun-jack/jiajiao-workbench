import ClassRecordForm from "@/components/class-record-form";

export default async function NewClassRecordPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <ClassRecordForm
      initialStudentId={sp.studentId ? Number(sp.studentId) : null}
    />
  );
}
