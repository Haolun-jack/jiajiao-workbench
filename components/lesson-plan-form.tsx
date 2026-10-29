"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Badge } from "@/components/ui";
import { IconBack, IconSpark } from "@/components/icons";

type StudentOption = { id: number; name: string };

export type LessonPlanFormProps = {
  initialStudentId?: number | null;
  plan?: {
    id: number;
    title: string;
    studentId: number | null;
    classNo: number | null;
    sourceType: string;
    sourceFileName: string | null;
    sourceText: string | null;
    content: string;
    status: string;
  };
};

export default function LessonPlanForm({ initialStudentId, plan }: LessonPlanFormProps) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [title, setTitle] = useState(plan?.title ?? "");
  const [studentId, setStudentId] = useState<string>(
    plan?.studentId ? String(plan.studentId) : initialStudentId ? String(initialStudentId) : "",
  );
  const [classNo, setClassNo] = useState(plan?.classNo ? String(plan.classNo) : "");
  const [sourceType, setSourceType] = useState(plan?.sourceType ?? "paste");
  const [sourceText, setSourceText] = useState(plan?.sourceText ?? "");
  const [sourceFileName, setSourceFileName] = useState(plan?.sourceFileName ?? "");
  const [content, setContent] = useState(plan?.content ?? "");
  const [status, setStatus] = useState(plan?.status ?? "draft");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    fetch("/api/students", { cache: "no-store" })
      .then((r) => r.json())
      .then((list: StudentOption[]) => setStudents(list))
      .catch(() => setStudents([]));
  }, []);

  const studentName = useMemo(
    () => students.find((s) => String(s.id) === studentId)?.name ?? "",
    [students, studentId],
  );

  async function generate() {
    setBusy(true);
    setError("");
    setHint("");
    try {
      let material = sourceType === "paste" ? sourceText : "";
      let fileName = sourceFileName;

      if (sourceType === "upload" && file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "文件上传失败");
        }
        const uploaded = await res.json();
        fileName = uploaded.name;
        setSourceFileName(uploaded.name);
        if (uploaded.text) {
          material = uploaded.text;
          setSourceText(uploaded.text);
        } else {
          throw new Error("该格式暂不支持自动读取正文，请改用「粘贴材料」并手动粘贴内容。");
        }
      }

      if (!material.trim()) {
        throw new Error("请先粘贴上课材料，或上传可识别的文本 / Word 文件。");
      }

      const res = await fetch("/api/lesson-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subject: "物理",
          studentName,
          classNo: classNo ? Number(classNo) : undefined,
          sourceText: material,
        }),
      });
      if (!res.ok) throw new Error("生成失败，请重试");
      const data = await res.json();
      setContent(data.content);
      if (!sourceFileName) setSourceFileName(fileName);
      setHint("已按模板生成初稿，你可以直接在下方修改。");
    } catch (e) {
      setError(e instanceof Error ? e.message : "生成失败");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!title.trim() || !content.trim()) {
      setError("标题和教案正文为必填项");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const payload = {
        title,
        content,
        studentId: studentId ? Number(studentId) : null,
        classNo: classNo ? Number(classNo) : null,
        sourceType,
        sourceFileName: sourceFileName || null,
        sourceText: sourceText || null,
        status,
      };
      const res = await fetch(plan ? `/api/lesson-plans/${plan.id}` : "/api/lesson-plans", {
        method: plan ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "保存失败");
      }
      const saved = await res.json();
      router.push(`/lesson-plans/${saved.id}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        kicker={plan ? "编辑教案" : "新建教案"}
        title={plan ? "编辑教案" : "写教案"}
        description="上传或粘贴上课材料，生成教案初稿，再编辑保存。"
        actions={
          <Badge tone={plan ? "blue" : "green"}>{plan ? "编辑中" : "新建"}</Badge>
        }
      />

      <div className="panel">
        <div className="form-grid">
          <div className="field">
            <label>教案标题 *</label>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="如：牛顿第二定律专题复习"
            />
          </div>
          <div className="field">
            <label>关联学生</label>
            <select className="select" value={studentId} onChange={(e) => setStudentId(e.target.value)}>
              <option value="">暂不关联</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
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
            <label>材料来源</label>
            <select className="select" value={sourceType} onChange={(e) => setSourceType(e.target.value)}>
              <option value="paste">粘贴材料</option>
              <option value="upload">上传文件</option>
              <option value="blank">空白新建</option>
            </select>
          </div>

          {sourceType === "paste" ? (
            <div className="field field-full">
              <label>上课材料（讲义、试卷或知识点）</label>
              <textarea
                className="textarea"
                style={{ minHeight: 140 }}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="把讲义、试卷题目或知识点粘贴到这里"
              />
            </div>
          ) : null}

          {sourceType === "upload" ? (
            <div className="field field-full">
              <label>上传文件（支持文本与 Word 文档）</label>
              <input
                className="input"
                type="file"
                accept=".txt,.md,.docx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <div className="muted" style={{ fontSize: 12 }}>
                已选：{file?.name ?? sourceFileName ?? "未选择"}
              </div>
            </div>
          ) : null}

          <div className="field field-full">
            <label>教案正文 *</label>
            <textarea
              className="textarea"
              style={{ minHeight: 280, fontFamily: "inherit" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="点击下方「生成教案初稿」，或直接在这里书写教案。"
            />
          </div>

          <div className="field">
            <label>状态</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="draft">草稿</option>
              <option value="final">定稿</option>
            </select>
          </div>
        </div>

        {hint ? <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>{hint}</div> : null}
        {error ? <div className="error-text" style={{ marginTop: 12 }}>{error}</div> : null}

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button
            type="button"
            className="btn"
            onClick={() => router.push(plan ? `/lesson-plans/${plan.id}` : "/lesson-plans")}
          >
            <IconBack size={15} />
            返回
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            {sourceType !== "blank" ? (
              <button type="button" className="btn" onClick={generate} disabled={busy}>
                <IconSpark size={16} />
                {busy ? "生成中…" : "生成教案初稿"}
              </button>
            ) : null}
            <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
              {busy ? "保存中…" : plan ? "保存修改" : "保存教案"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
