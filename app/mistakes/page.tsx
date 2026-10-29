import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconAlert, IconPlus } from "@/components/icons";
import { formatDate } from "@/lib/format";
import {
  difficultyLabels,
  mistakeStatusLabels,
  mistakeStatusTone,
} from "@/lib/labels";
import DeleteButton from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const mistakes = await prisma.mistake.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      errorTypes: { include: { errorType: true } },
      indicators: { include: { indicator: { include: { dimension: true } } } },
    },
  });

  return (
    <>
      <PageHeader
        kicker="错题记录"
        title="错题记录"
        description="录入错题、打上错误类型和知识点标签，系统会自动匹配评价维度。"
        actions={
          <Link href="/mistakes/new" className="btn btn-primary">
            <IconPlus size={16} />
            录入错题
          </Link>
        }
      />
      <div className="card">
        {mistakes.length === 0 ? (
          <EmptyState
            icon={<IconAlert />}
            title="还没有错题记录"
            description="错题是学情诊断的锚点，点右上角「录入错题」开始记录。"
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>学生</th>
                  <th>知识点</th>
                  <th>难度</th>
                  <th>错误类型</th>
                  <th>匹配维度</th>
                  <th>状态</th>
                  <th>录入日期</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {mistakes.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <Link href={`/students/${m.student.id}`} className="cell-title">
                        {m.student.name}
                      </Link>
                    </td>
                    <td>{m.knowledgePoint}</td>
                    <td>
                      <Badge tone="gray">{difficultyLabels[m.difficulty] ?? m.difficulty}</Badge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 240 }}>
                        {m.errorTypes.map((et) => (
                          <Badge key={et.id} tone="gray">
                            {et.errorType.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", maxWidth: 240 }}>
                        {m.indicators.map((mi) => (
                          <Badge key={mi.id} tone="blue">
                            {mi.indicator.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td>
                      <Badge tone={mistakeStatusTone(m.status)}>
                        {mistakeStatusLabels[m.status] ?? m.status}
                      </Badge>
                    </td>
                    <td className="muted">{formatDate(m.createdAt)}</td>
                    <td>
                      <DeleteButton
                        endpoint={`/api/mistakes/${m.id}`}
                        label="删除"
                        confirmText="确定删除这道错题吗？删除后无法恢复。"
                      />
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
