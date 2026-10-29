import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader, SectionHeader, EmptyState } from "@/components/ui";
import {
  IconAlert,
  IconBook,
  IconCalendar,
  IconSpark,
  IconUsers,
} from "@/components/icons";
import { formatDate, todayLabel } from "@/lib/format";
import {
  attendanceLabels,
  attendanceTone,
  mistakeStatusLabels,
  mistakeStatusTone,
} from "@/lib/labels";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [studentCount, planCount, recordCount, mistakeCount, recentRecords, pendingMistakes] =
    await Promise.all([
      prisma.student.count(),
      prisma.lessonPlan.count(),
      prisma.classRecord.count(),
      prisma.mistake.count(),
      prisma.classRecord.findMany({
        take: 5,
        orderBy: { classDate: "desc" },
        include: { student: { select: { name: true } } },
      }),
      prisma.mistake.findMany({
        where: { status: { not: "mastered" } },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: { student: { select: { name: true } } },
      }),
    ]);

  return (
    <>
      <PageHeader
        kicker={todayLabel()}
        title="工作台"
        description="今天的课、学生和错题，都汇总在这里。"
      />

      <div className="kpi-grid">
        <Link href="/students" className="kpi">
          <span className="kpi-icon tone-blue">
            <IconUsers />
          </span>
          <span>
            <div className="kpi-value">{studentCount}</div>
            <div className="kpi-label">学生档案</div>
          </span>
        </Link>
        <Link href="/lesson-plans" className="kpi">
          <span className="kpi-icon tone-violet">
            <IconBook />
          </span>
          <span>
            <div className="kpi-value">{planCount}</div>
            <div className="kpi-label">教案</div>
          </span>
        </Link>
        <Link href="/class-records" className="kpi">
          <span className="kpi-icon tone-green">
            <IconCalendar />
          </span>
          <span>
            <div className="kpi-value">{recordCount}</div>
            <div className="kpi-label">上课记录</div>
          </span>
        </Link>
        <Link href="/mistakes" className="kpi">
          <span className="kpi-icon tone-amber">
            <IconAlert />
          </span>
          <span>
            <div className="kpi-value">{mistakeCount}</div>
            <div className="kpi-label">错题记录</div>
          </span>
        </Link>
      </div>

      <div className="grid-2">
        <section className="card">
          <SectionHeader title="最近上课" link="/class-records" linkText="全部记录" />
          {recentRecords.length === 0 ? (
            <EmptyState
              icon={<IconCalendar />}
              title="还没有上课记录"
              description="上完课后记录一节课，学生的档案就会慢慢长出来。"
            />
          ) : (
            <div className="list">
              {recentRecords.map((r) => (
                <div className="list-item" key={r.id}>
                  <div className="list-main">
                    <div className="list-title">
                      {r.student.name}
                      <span
                        className={`badge badge-${attendanceTone(r.attendance)}`}
                        style={{ marginLeft: 8 }}
                      >
                        {attendanceLabels[r.attendance] ?? r.attendance}
                      </span>
                    </div>
                    <div className="list-sub">{r.content}</div>
                  </div>
                  <div className="list-side">{formatDate(r.classDate)}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card">
          <SectionHeader title="待关注错题" link="/mistakes" linkText="全部错题" />
          {pendingMistakes.length === 0 ? (
            <EmptyState
              icon={<IconSpark />}
              title="没有待处理错题"
              description="录入错题后，未掌握的题目会出现在这里。"
            />
          ) : (
            <div className="list">
              {pendingMistakes.map((m) => (
                <div className="list-item" key={m.id}>
                  <div className="list-main">
                    <div className="list-title">{m.student.name}</div>
                    <div className="list-sub">{m.knowledgePoint}</div>
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
    </>
  );
}
