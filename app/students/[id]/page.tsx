import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, SectionHeader } from "@/components/ui";
import { IconBack, IconBook, IconCalendar, IconChart, IconAlert } from "@/components/icons";
import { formatDate, formatDateTime } from "@/lib/format";
import {
  attendanceLabels,
  attendanceTone,
  levelLabels,
  levelTone,
  mistakeStatusLabels,
  mistakeStatusTone,
  planStatusLabels,
  planStatusTone,
} from "@/lib/labels";
import DeleteButton from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function StudentDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.student.findUnique({
    where: { id: Number(id) },
    include: {
      lessonPlans: { orderBy: { updatedAt: "desc" } },
      classRecords: { orderBy: { classDate: "desc" } },
      mistakes: {
        orderBy: { createdAt: "desc" },
        include: { errorTypes: { include: { errorType: true } } },
      },
      evaluations: {
        orderBy: { createdAt: "desc" },
        include: {
          items: {
            include: { indicator: { include: { dimension: true } } },
          },
        },
      },
    },
  });

  if (!student) notFound();

  const latestEvaluation = student.evaluations[0];
  const newMistakesSinceEval = latestEvaluation
    ? student.mistakes.filter(
        (m) => new Date(m.createdAt) > new Date(latestEvaluation.createdAt),
      ).length
    : student.mistakes.length;

  return (
    <>
      <Link href="/students" className="back-link">
        <IconBack size={15} />
        返回学生列表
      </Link>

      <div className="card" style={{ marginBottom: 18 }}>
        <div className="profile">
          <div className="avatar">{student.name.slice(0, 1)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="profile-name">{student.name}</div>
            <div className="profile-meta">
              {[student.grade, student.school, student.phone].filter(Boolean).join(" · ") ||
                "暂无更多信息"}
            </div>
            <div className="profile-grid">
              <span>
                <strong>科目</strong>
                {student.subject}
              </span>
              <span>
                <strong>学习目标</strong>
                {student.goal ?? "—"}
              </span>
              <span>
                <strong>备注</strong>
                {student.note ?? "—"}
              </span>
            </div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flex: "none", flexWrap: "wrap" }}>
            <Link href={`/lesson-plans/new?studentId=${student.id}`} className="btn">
              写教案
            </Link>
            <Link href={`/class-records/new?studentId=${student.id}`} className="btn btn-primary">
              记一节课
            </Link>
            <Link href={`/mistakes/new?studentId=${student.id}`} className="btn">
              录入错题
            </Link>
            <Link href={`/evaluations/new?studentId=${student.id}`} className="btn">
              生成诊断
            </Link>
            <DeleteButton
              endpoint={`/api/students/${student.id}`}
              label="删除学生"
              confirmText={`确定删除学生「${student.name}」吗？该学生的上课记录、错题和诊断报告也会一并删除，且无法恢复。`}
              redirectTo="/students"
            />
          </div>
        </div>
        <div className="stat-strip">
          <div className="stat-cell">
            <div className="stat-num">{student.lessonPlans.length}</div>
            <div className="stat-label">教案</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{student.classRecords.length}</div>
            <div className="stat-label">上课记录</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{student.mistakes.length}</div>
            <div className="stat-label">错题</div>
          </div>
          <div className="stat-cell">
            <div className="stat-num">{student.evaluations.length}</div>
            <div className="stat-label">诊断报告</div>
          </div>
        </div>
      </div>

      <div className="grid-2 section-block">
        <section className="card">
          <SectionHeader title="上课记录" link="/class-records" linkText="全部记录" />
          {student.classRecords.length === 0 ? (
            <EmptyState icon={<IconCalendar />} title="还没有上课记录" />
          ) : (
            <div className="list">
              {student.classRecords.map((r) => (
                <div className="list-item" key={r.id}>
                  <div className="list-main">
                    <div className="list-title">
                      {formatDate(r.classDate)}
                      <span
                        className={`badge badge-${attendanceTone(r.attendance)}`}
                        style={{ marginLeft: 8 }}
                      >
                        {attendanceLabels[r.attendance] ?? r.attendance}
                      </span>
                    </div>
                    <div className="list-sub">{r.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <SectionHeader title="错题记录" link="/mistakes" linkText="全部错题" />
          {student.mistakes.length === 0 ? (
            <EmptyState icon={<IconAlert />} title="还没有错题记录" />
          ) : (
            <div className="list">
              {student.mistakes.map((m) => (
                <div className="list-item" key={m.id}>
                  <div className="list-main">
                    <div className="list-title">{m.knowledgePoint}</div>
                    <div className="list-sub">{m.question}</div>
                    <div style={{ marginTop: 6, display: "flex", gap: 5, flexWrap: "wrap" }}>
                      {m.errorTypes.map((et) => (
                        <Badge key={et.id} tone="gray">
                          {et.errorType.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="list-side">
                    <span className={`badge badge-${mistakeStatusTone(m.status)}`}>
                      {mistakeStatusLabels[m.status] ?? m.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid-2 section-block">
        <section className="card">
          <SectionHeader title="教案" link="/lesson-plans" linkText="全部教案" />
          {student.lessonPlans.length === 0 ? (
            <EmptyState icon={<IconBook />} title="还没有教案" />
          ) : (
            <div className="list">
              {student.lessonPlans.map((p) => (
                <div className="list-item" key={p.id}>
                  <div className="list-main">
                    <div className="list-title">{p.title}</div>
                    <div className="list-sub">
                      {p.classNo ? `第 ${p.classNo} 次课` : "未标记课次"}
                    </div>
                  </div>
                  <div className="list-side">
                    <span className={`badge badge-${planStatusTone(p.status)}`}>
                      {planStatusLabels[p.status] ?? p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <SectionHeader title="学习诊断" link="/evaluations" linkText="全部报告" />
          {latestEvaluation && newMistakesSinceEval > 0 ? (
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--line)",
                background: "#fff7e6",
                fontSize: 12.5,
                color: "#b45309",
                lineHeight: 1.7,
              }}
            >
              自上次诊断以来新增 {newMistakesSinceEval} 道错题，评价可能已变化。
              <Link
                href={`/evaluations/new?studentId=${student.id}`}
                style={{ fontWeight: 600 }}
              >
                重新生成诊断 →
              </Link>
            </div>
          ) : null}
          {!latestEvaluation ? (
            <EmptyState
              icon={<IconChart />}
              title="还没有诊断报告"
              description="错题联动诊断将在第七阶段自动生成。"
            />
          ) : (
            <div style={{ padding: 18 }}>
              <div className="list-title">
                {formatDate(latestEvaluation.periodStart)} 至{" "}
                {formatDate(latestEvaluation.periodEnd)}
              </div>
              <div className="list-sub" style={{ marginBottom: 12 }}>
                {latestEvaluation.summary ?? "暂无概述"}
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {latestEvaluation.items.map((item) => (
                  <Badge key={item.id} tone={levelTone(item.level)}>
                    {item.indicator.dimension.name} · {item.indicator.name}：
                    {levelLabels[item.level] ?? item.level}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
