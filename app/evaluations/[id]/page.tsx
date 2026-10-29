import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconBack, IconChart } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { levelLabels, levelTone, type Tone } from "@/lib/labels";

export const dynamic = "force-dynamic";

const severityWeight: Record<string, number> = {
  severe: 3,
  medium: 2,
  light: 1,
  none: 0,
};

export default async function EvaluationDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const evaluation = await prisma.evaluation.findUnique({
    where: { id: Number(id) },
    include: {
      student: { select: { id: true, name: true, grade: true } },
      items: {
        include: { indicator: { include: { dimension: true } } },
      },
    },
  });
  if (!evaluation) notFound();

  const items = evaluation.items.sort(
    (a, b) =>
      a.indicator.dimension.sort - b.indicator.dimension.sort ||
      a.indicator.sort - b.indicator.sort,
  );

  const grouped = new Map<
    number,
    { id: number; name: string; items: typeof items }
  >();
  for (const item of items) {
    const dim = item.indicator.dimension;
    if (!grouped.has(dim.id)) {
      grouped.set(dim.id, { id: dim.id, name: dim.name, items: [] });
    }
    grouped.get(dim.id)!.items.push(item);
  }

  const problems = items
    .filter((i) => i.level === "medium" || i.level === "severe")
    .sort(
      (a, b) =>
        severityWeight[b.level] - severityWeight[a.level] ||
        b.mistakeCount - a.mistakeCount,
    )
    .slice(0, 5);

  return (
    <>
      <Link href="/evaluations" className="back-link">
        <IconBack size={15} />
        返回诊断列表
      </Link>

      <PageHeader
        kicker={`规则版本 ${evaluation.ruleVersion}`}
        title={`${evaluation.student.name} · 学习诊断`}
        description={`${evaluation.student.grade} · ${formatDate(evaluation.periodStart)} 至 ${formatDate(evaluation.periodEnd)}`}
      />

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 8 }}>
          综合概述
        </div>
        <p style={{ margin: 0, lineHeight: 1.8, fontSize: 14 }}>
          {evaluation.summary ?? "暂无概述"}
        </p>
      </div>

      <div className="grid-2 section-block">
        <section className="card">
          <div className="section-head">
            <div className="section-title">五维度能力画像</div>
          </div>
          <div className="list">
            {Array.from(grouped.values()).map((dim) => (
              <div className="list-item" key={dim.id} style={{ display: "block" }}>
                <div className="list-title" style={{ marginBottom: 8 }}>
                  {dim.name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {dim.items.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span style={{ fontSize: 13 }}>{item.indicator.name}</span>
                      <span style={{ flex: "none" }}>
                        <Badge tone={levelTone(item.level) as Tone}>
                          {levelLabels[item.level] ?? item.level}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="section-head">
            <div className="section-title">核心问题与干预</div>
          </div>
          {problems.length === 0 ? (
            <EmptyState
              icon={<IconChart />}
              title="本周期没有中重度问题"
              description="继续保持当前的学习节奏。"
            />
          ) : (
            <div className="list">
              {problems.map((item) => (
                <div className="list-item" key={item.id} style={{ display: "block" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div className="list-title">
                      {item.indicator.dimension.name} · {item.indicator.name}
                    </div>
                    <Badge tone={levelTone(item.level) as Tone}>
                      {levelLabels[item.level] ?? item.level}
                    </Badge>
                  </div>
                  <div className="list-sub" style={{ marginTop: 6 }}>
                    {item.note}
                  </div>
                  {item.indicator.intervention ? (
                    <div
                      className="list-sub"
                      style={{ marginTop: 6, color: "#4b5563" }}
                    >
                      干预建议：{item.indicator.intervention}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
