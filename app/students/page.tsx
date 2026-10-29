"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState, Badge } from "@/components/ui";
import { IconArrowRight, IconPlus, IconSearch, IconUsers } from "@/components/icons";
import { formatDateTime } from "@/lib/format";

type Student = {
  id: number;
  name: string;
  grade: string;
  school: string | null;
  phone: string | null;
  subject: string;
  goal: string | null;
  note: string | null;
  updatedAt: string;
};

const emptyForm = {
  name: "",
  grade: "",
  school: "",
  phone: "",
  subject: "物理",
  goal: "",
  note: "",
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/students", { cache: "no-store" });
      if (res.ok) setStudents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return students;
    return students.filter((s) =>
      [s.name, s.school, s.phone, s.grade].filter(Boolean).join(" ").includes(q),
    );
  }, [students, query]);

  function setField(key: keyof typeof emptyForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "保存失败，请重试");
      setSubmitting(false);
      return;
    }
    setForm(emptyForm);
    setShowForm(false);
    setSubmitting(false);
    await load();
  }

  async function removeStudent(s: Student) {
    const ok = window.confirm(
      `确定删除学生「${s.name}」吗？该学生的上课记录、错题和诊断报告也会一并删除，且无法恢复。`,
    );
    if (!ok) return;
    const res = await fetch(`/api/students/${s.id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
    } else {
      const data = await res.json().catch(() => null);
      window.alert(data?.error ?? "删除失败，请重试");
    }
  }

  return (
    <>
      <PageHeader
        kicker="学生档案"
        title="学生"
        description="分开记录每个学生，上课、错题和诊断都围绕学生展开。"
        actions={
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            <IconPlus size={16} />
            {showForm ? "收起" : "新增学生"}
          </button>
        }
      />

      {showForm ? (
        <form className="panel" onSubmit={submit}>
          <div className="section-title" style={{ marginBottom: 16 }}>
            新增学生
          </div>
          <div className="form-grid">
            <div className="field">
              <label>姓名 *</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>年级 *</label>
              <input
                className="input"
                value={form.grade}
                onChange={(e) => setField("grade", e.target.value)}
                placeholder="如：高二"
                required
              />
            </div>
            <div className="field">
              <label>学校</label>
              <input
                className="input"
                value={form.school}
                onChange={(e) => setField("school", e.target.value)}
              />
            </div>
            <div className="field">
              <label>联系方式</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
              />
            </div>
            <div className="field">
              <label>科目</label>
              <input
                className="input"
                value={form.subject}
                onChange={(e) => setField("subject", e.target.value)}
              />
            </div>
            <div className="field field-full">
              <label>学习目标</label>
              <input
                className="input"
                value={form.goal}
                onChange={(e) => setField("goal", e.target.value)}
                placeholder="如：期中考试物理上 85 分"
              />
            </div>
            <div className="field field-full">
              <label>备注</label>
              <textarea
                className="textarea"
                value={form.note}
                onChange={(e) => setField("note", e.target.value)}
              />
            </div>
          </div>
          {error ? <div className="error-text" style={{ marginTop: 12 }}>{error}</div> : null}
          <div className="form-actions">
            <button type="button" className="btn" onClick={() => setShowForm(false)}>
              取消
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "保存中…" : "保存学生"}
            </button>
          </div>
        </form>
      ) : null}

      <div className="toolbar">
        <div className="search">
          <IconSearch size={16} />
          <input
            className="input"
            placeholder="搜索姓名、学校、电话或年级"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="muted" style={{ fontSize: 12 }}>
          共 {filtered.length} 名学生
        </div>
      </div>

      <div className="card">
        {loading ? (
          <EmptyState title="正在加载…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconUsers />}
            title={students.length === 0 ? "还没有学生" : "没有匹配的学生"}
            description="点右上角「新增学生」建立第一份档案。"
          />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>姓名</th>
                  <th>年级</th>
                  <th>学校</th>
                  <th>联系方式</th>
                  <th>科目</th>
                  <th>最近更新</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link href={`/students/${s.id}`} className="cell-title">
                        {s.name}
                      </Link>
                    </td>
                    <td>{s.grade}</td>
                    <td>{s.school ?? <span className="muted">—</span>}</td>
                    <td>{s.phone ?? <span className="muted">—</span>}</td>
                    <td>
                      <Badge tone="blue">{s.subject}</Badge>
                    </td>
                    <td className="muted">{formatDateTime(s.updatedAt)}</td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Link href={`/students/${s.id}`} className="btn btn-ghost">
                          查看
                          <IconArrowRight size={14} />
                        </Link>
                        <button
                          className="btn btn-ghost"
                          style={{ color: "#b91c1c" }}
                          onClick={() => removeStudent(s)}
                        >
                          删除
                        </button>
                      </div>
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
