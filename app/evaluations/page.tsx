import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconChart, IconPlus } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { levelLabels, levelTone } from "@/lib/labels";
import DeleteButton from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function EvaluationsPage() {
  const evaluations = await prisma.evaluation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      items: {
        include: { indicator: { include: { dimension: true } } },
      },
    },
  });

  return (
    <>
      <PageHeader
        kicker="学习诊断"
        title="学习诊断"
        description="按错题自动生成五维度能力画像和核心问题清单，规则显式可追溯。"
        actions={
          <Link href="/evaluations/new" className="btn btn-primary">
            <IconPlus size={16} />
            生成诊断
          </Link>
        }
      />
      {evaluations.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<IconChart />}
            title="还没有诊断报告"
            description="点右上角「生成诊断」，选择学生和周期，生成第一份诊断报告。"
          />
        </div>
      ) : (
        <div className="list" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {evaluations.map((ev) => (
            <div className="card card-pad" key={ev.id}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div className="cell-title" style={{ fontSize: 15 }}>
                    {ev.student.name}
                  </div>
                  <div className="list-sub">
                    {formatDate(ev.periodStart)} 至 {formatDate(ev.periodEnd)}
                  </div>
                  <div className="list-sub" style={{ marginTop: 6 }}>
                    {ev.summary ?? "暂无概述"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Link href={`/students/${ev.student.id}`} className="btn btn-ghost">
                    查看学生
                  </Link>
                  <DeleteButton
                    endpoint={`/api/evaluations/${ev.id}`}
                    label="删除"
                    confirmText="确定删除这份诊断报告吗？删除后无法恢复。"
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 14 }}>
                {ev.items.map((item) => (
                  <Badge key={item.id} tone={levelTone(item.level)}>
                    {item.indicator.dimension.name} · {item.indicator.name}：
                    {levelLabels[item.level] ?? item.level}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
