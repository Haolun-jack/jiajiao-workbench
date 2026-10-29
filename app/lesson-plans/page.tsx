import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconArrowRight, IconBook, IconPlus } from "@/components/icons";
import { formatDateTime } from "@/lib/format";
import { planSourceLabels, planStatusLabels, planStatusTone } from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function LessonPlansPage() {
  const lessonPlans = await prisma.lessonPlan.findMany({
    orderBy: { updatedAt: "desc" },
    include: { student: { select: { id: true, name: true } } },
  });

  return (
    <>
      <PageHeader
        kicker="教案"
        title="教案"
        description="上传或粘贴上课材料生成教案，并关联到学生和课次。"
        actions={
          <Link href="/lesson-plans/new" className="btn btn-primary">
            <IconPlus size={16} />
            写教案
          </Link>
        }
      />
      <div className="card">
        {lessonPlans.length === 0 ? (
          <EmptyState
            icon={<IconBook />}
            title="还没有教案"
            description="点右上角「写教案」，上传或粘贴材料生成第一份教案。"
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>标题</th>
                  <th>学生</th>
                  <th>课次</th>
                  <th>来源</th>
                  <th>状态</th>
                  <th>最近更新</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lessonPlans.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-title">{p.title}</td>
                    <td>
                      {p.student ? (
                        <Link href={`/students/${p.student.id}`}>{p.student.name}</Link>
                      ) : (
                        <span className="muted">未关联</span>
                      )}
                    </td>
                    <td>{p.classNo ? `第 ${p.classNo} 次` : <span className="muted">—</span>}</td>
                    <td>
                      <Badge tone="gray">{planSourceLabels[p.sourceType] ?? p.sourceType}</Badge>
                    </td>
                    <td>
                      <Badge tone={planStatusTone(p.status)}>
                        {planStatusLabels[p.status] ?? p.status}
                      </Badge>
                    </td>
                    <td className="muted">{formatDateTime(p.updatedAt)}</td>
                    <td>
                      <Link href={`/lesson-plans/${p.id}`} className="btn btn-ghost">
                        查看
                        <IconArrowRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
