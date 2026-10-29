import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, EmptyState, PageHeader } from "@/components/ui";
import { IconCalendar, IconPlus } from "@/components/icons";
import { formatDate } from "@/lib/format";
import { attendanceLabels, attendanceTone } from "@/lib/labels";
import DeleteButton from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function ClassRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const sp = await searchParams;
  const filterStudentId = sp.studentId ? Number(sp.studentId) : null;
  const students = await prisma.student.findMany({ orderBy: { name: "asc" } });
  const records = await prisma.classRecord.findMany({
    where: filterStudentId ? { studentId: filterStudentId } : undefined,
    orderBy: { classDate: "desc" },
    include: { student: { select: { id: true, name: true } } },
  });

  return (
    <>
      <PageHeader
        kicker="上课记录"
        title="上课记录"
        description="按学生分开记录每节课，可按学生筛选查询历史记录。"
        actions={
          <Link href="/class-records/new" className="btn btn-primary">
            <IconPlus size={16} />
            记一节课
          </Link>
        }
      />
      <form className="toolbar" method="GET" action="/class-records">
        <div className="field" style={{ minWidth: 240 }}>
          <label>按学生筛选</label>
          <select className="select" name="studentId" defaultValue={filterStudentId ? String(filterStudentId) : ""}>
            <option value="">全部学生</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <button type="submit" className="btn">
            筛选
          </button>
          <Link href="/class-records" className="btn">
            清除
          </Link>
        </div>
      </form>
      <div className="card">
        {records.length === 0 ? (
          <EmptyState
            icon={<IconCalendar />}
            title="还没有上课记录"
            description="上完课后记一笔，学生的成长轨迹就有了依据。"
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>日期</th>
                  <th>学生</th>
                  <th>课次</th>
                  <th>出勤</th>
                  <th>上课内容</th>
                  <th>作业</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="cell-title">{formatDate(r.classDate)}</td>
                    <td>
                      <Link href={`/students/${r.student.id}`}>{r.student.name}</Link>
                    </td>
                    <td>{r.classNo ? `第 ${r.classNo} 次` : <span className="muted">—</span>}</td>
                    <td>
                      <Badge tone={attendanceTone(r.attendance)}>
                        {attendanceLabels[r.attendance] ?? r.attendance}
                      </Badge>
                    </td>
                    <td>{r.content}</td>
                    <td>{r.homework ?? <span className="muted">—</span>}</td>
                    <td>
                      <DeleteButton
                        endpoint={`/api/class-records/${r.id}`}
                        label="删除"
                        confirmText="确定删除这条上课记录吗？删除后无法恢复。"
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
