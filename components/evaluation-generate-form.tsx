"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PageHeader, Badge } from "@/components/ui";
import { IconBack, IconSpark } from "@/components/icons";

type StudentOption = { id: number; name: string };

function isoDate(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

export default function EvaluationGenerateForm({
  initialStudentId,
}: {
  initialStudentId?: number | null;
}) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [studentId, setStudentId] = useState(
    initialStudentId ? String(initialStudentId) : "",
  );
  const [periodStart, setPeriodStart] = useState(
    isoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)),
  );
  const [periodEnd, setPeriodEnd] = useState(isoDate(new Date()));
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

  async function generate() {
    if (!studentId || !periodStart || !periodEnd) {
      setError("请选择学生和诊断周期");
      return;
    }
    if (periodStart > periodEnd) {
      setError("开始日期不能晚于结束日期");
      return;
    }
    setBusy(true);
    setError("");
    const res = await fetch("/api/evaluations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: Number(studentId),
        periodStart: new Date(`${periodStart}T00:00:00`).toISOString(),
        periodEnd: new Date(`${periodEnd}T23:59:59`).toISOString(),
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "生成失败，请重试");
      setBusy(false);
      return;
    }
    const evaluation = await res.json();
    router.push(`/evaluations/${evaluation.id}`);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        kicker="学习诊断"
        title="生成诊断报告"
        description="按选定的错题周期，依据五维度评价体系自动生成能力画像与核心问题清单。"
        actions={<Badge tone="violet">规则版本 1</Badge>}
      />

      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
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
            <label>开始日期 *</label>
            <input
              className="input"
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label>结束日期 *</label>
            <input
              className="input"
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
            />
          </div>
        </div>

        {error ? <div className="error-text" style={{ marginTop: 12 }}>{error}</div> : null}

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn" onClick={() => router.back()}>
            <IconBack size={15} />
            返回
          </button>
          <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
            <IconSpark size={16} />
            {busy ? "生成中…" : "生成诊断报告"}
          </button>
        </div>
      </div>
    </>
  );
}
