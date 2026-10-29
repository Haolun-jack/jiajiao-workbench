import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconBack, IconBook } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { planSourceLabels, planStatusLabels, planStatusTone } from "@/lib/labels";
import DeleteButton from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function LessonPlanDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await prisma.lessonPlan.findUnique({
    where: { id: Number(id) },
    include: { student: { select: { id: true, name: true } } },
  });

  if (!plan) notFound();

  return (
    <>
      <Link href="/lesson-plans" className="back-link">
        <IconBack size={15} />
        返回教案列表
      </Link>
      <PageHeader
        kicker={`${planSourceLabels[plan.sourceType] ?? plan.sourceType} · ${formatDateTime(plan.updatedAt)}`}
        title={plan.title}
        description={
          plan.student
            ? `关联学生：${plan.student.name}${plan.classNo ? ` · 第 ${plan.classNo} 次课` : ""}`
            : "未关联学生"
        }
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Badge tone={planStatusTone(plan.status)}>
              {planStatusLabels[plan.status] ?? plan.status}
            </Badge>
            <Link href={`/lesson-plans/${plan.id}/edit`} className="btn">
              编辑教案
            </Link>
            <DeleteButton
              endpoint={`/api/lesson-plans/${plan.id}`}
              label="删除教案"
              confirmText="确定删除这份教案吗？删除后无法恢复。"
              redirectTo="/lesson-plans"
            />
          </div>
        }
      />

      {plan.sourceText ? (
        <div className="panel">
          <div className="section-title" style={{ marginBottom: 12 }}>
            原始材料
          </div>
          <div style={{ whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8 }}>
            {plan.sourceText}
          </div>
        </div>
      ) : null}

      <div className="card">
        {plan.content.trim() ? (
          <div className="card-pad" style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.9 }}>
            {plan.content}
          </div>
        ) : (
          <EmptyState icon={<IconBook />} title="教案正文为空" />
        )}
      </div>
    </>
  );
}
