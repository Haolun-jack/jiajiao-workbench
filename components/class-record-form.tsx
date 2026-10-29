"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui";
import { IconBack } from "@/components/icons";

type StudentOption = { id: number; name: string };

function localToday(): string {
  const d = new Date();
  const iso = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
  return iso.slice(0, 10);
}

export default function ClassRecordForm({
  initialStudentId,
}: {
  initialStudentId?: number | null;
}) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState(
    initialStudentId ? String(initialStudentId) : "",
  );
  const [classDate, setClassDate] = useState(localToday());
  const [classNo, setClassNo] = useState("");
  const [duration, setDuration] = useState("");
  const [attendance, setAttendance] = useState("present");
  const [content, setContent] = useState("");
  const [homework, setHomework] = useState("");
  const [performance, setPerformance] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/students", { cache: "no-store" })
      .then((r) => r.json())
      .then((list: StudentOption[]) => {
        setStudents(list);
        if (!initialStudentId && list.length > 0) {
          setStudentId((cur) => (cur ? cur : String(list[0].id)));
        }
      })
      .catch(() => setStudents([]));
  }, [initialStudentId]);

  async function save() {
    if (!studentId || !classDate || !content.trim()) {
      setError("学生、上课日期和上课内容为必填项");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/class-records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: Number(studentId),
        classDate: new Date(`${classDate}T19:00:00`).toISOString(),
        classNo: classNo ? Number(classNo) : null,
        duration: duration ? Number(duration) : null,
        attendance,
        content,
        homework: homework || null,
        performance: performance || null,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "保存失败，请重试");
      setBusy(false);
      return;
    }
    const saved = await res.json();
    router.push(`/students/${saved.studentId}`);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        kicker="上课记录"
        title="记一节课"
        description="上完课后记录内容、作业和课堂表现，学生的档案会同步更新。"
      />

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>学生 *</label>
            <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">请选择学生</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>上课日期 *</label>
            <input
              className="input"
              type="date"
              value={classDate}
              onChange={(e) => setClassDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label>课次</label>
            <input
              className="input"
              type="number"
              min={1}
              value={classNo}
              onChange={(e) => setClassNo(e.target.value)}
              placeholder="如：3"
            />
          </div>
          <div className="field">
            <label>时长（分钟）</label>
            <input
              className="input"
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="如：90"
            />
          </div>
          <div className="field">
            <label>出勤</label>
            <select className="select" value={attendance} onChange={(e) => setAttendance(e.target.value)}>
              <option value="present">出勤</option>
              <option value="late">迟到</option>
              <option value="absent">缺勤</option>
            </select>
          </div>
          <div className="field field-full">
            <label>上课内容 *</label>
            <textarea
              className="textarea"
              style={{ minHeight: 120 }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="这节课讲了什么、学生掌握情况如何"
            />
          </div>
          <div className="field">
            <label>布置作业</label>
            <textarea
              className="textarea"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="课后练习、错题整理等"
            />
          </div>
          <div className="field">
            <label>课堂表现</label>
            <textarea
              className="textarea"
              value={performance}
              onChange={(e) => setPerformance(e.target.value)}
              placeholder="专注度、互动、解题状态等"
            />
          </div>
        </div>

        {error ? <div className="error-text" style={{ marginTop: 12 }}>{error}</div> : null}

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn" onClick={() => router.back()}>
            <IconBack size={15} />
            返回
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? "保存中…" : "保存记录"}
          </button>
        </div>
      </div>
    </>
  );
}
