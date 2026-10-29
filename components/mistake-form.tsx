"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, Badge } from "@/components/ui";
import { IconBack } from "@/components/icons";

type StudentOption = { id: number; name: string };
type ErrorTypeOption = { id: number; code: string; name: string };
type IndicatorOption = { id: number; name: string };
type DimensionOption = {
  id: number;
  name: string;
  indicators: IndicatorOption[];
};

export default function MistakeForm({
  initialStudentId,
}: {
  initialStudentId?: number | null;
}) {
  const router = useRouter();
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [errorTypes, setErrorTypes] = useState<ErrorTypeOption[]>([]);
  const [dimensions, setDimensions] = useState<DimensionOption[]>([]);

  const [studentId, setStudentId] = useState(
    initialStudentId ? String(initialStudentId) : "",
  );
  const [knowledgePoint, setKnowledgePoint] = useState("");
  const [category, setCategory] = useState("");
  const [source, setSource] = useState("homework");
  const [difficulty, setDifficulty] = useState("medium");
  const [question, setQuestion] = useState("");
  const [studentAnswer, setStudentAnswer] = useState("");
  const [processText, setProcessText] = useState("");
  const [wrongAnswer, setWrongAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [status, setStatus] = useState("unmastered");
  const [file, setFile] = useState<File | null>(null);
  const [errorTypeIds, setErrorTypeIds] = useState<number[]>([]);
  const [indicatorIds, setIndicatorIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/students", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/error-types", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/dimensions", { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([studentList, typeList, dimList]) => {
        setStudents(studentList);
        setErrorTypes(typeList);
        setDimensions(dimList);
        if (!initialStudentId && studentList.length > 0) {
          setStudentId((cur) => (cur ? cur : String(studentList[0].id)));
        }
      })
      .catch(() => {});
  }, [initialStudentId]);

  const selectedErrorNames = useMemo(
    () =>
      errorTypes
        .filter((t) => errorTypeIds.includes(t.id))
        .map((t) => t.name),
    [errorTypes, errorTypeIds],
  );

  function toggleErrorType(id: number) {
    const adding = !errorTypeIds.includes(id);
    const next = adding
      ? [...errorTypeIds, id]
      : errorTypeIds.filter((x) => x !== id);
    setErrorTypeIds(next);
    setHint("");
    if (adding) {
      fetch(`/api/mistakes/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ errorTypeIds: next }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.indicators?.length) {
            const suggested = data.indicators.map(
              (i: IndicatorOption) => i.id,
            );
            setIndicatorIds((cur) =>
              Array.from(new Set([...cur, ...suggested])),
            );
            setHint(`已按规则自动匹配 ${suggested.length} 个评价指标，可手动调整。`);
          }
        })
        .catch(() => {});
    }
  }

  function toggleIndicator(id: number) {
    setIndicatorIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
  }

  async function save() {
    if (!studentId || !knowledgePoint.trim() || !question.trim()) {
      setError("学生、知识点和题干为必填项");
      return;
    }
    setBusy(true);
    setError("");
    try {
      let imagePath: string | null = null;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!uploadRes.ok) throw new Error("题目图片上传失败");
        const uploaded = await uploadRes.json();
        imagePath = uploaded.path;
      }

      const res = await fetch("/api/mistakes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: Number(studentId),
          knowledgePoint,
          category: category || null,
          source,
          difficulty,
          question,
          questionImagePath: imagePath,
          studentAnswer: studentAnswer || null,
          process: processText || null,
          wrongAnswer: wrongAnswer || null,
          correctAnswer: correctAnswer || null,
          status,
          errorTypeIds,
          indicatorIds,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "保存失败");
      }
      const saved = await res.json();
      router.push(`/students/${saved.studentId}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        kicker="错题记录"
        title="录入错题"
        description="录下题干、错误答案与正确解法，并打上错误类型，系统会按规则匹配评价维度。"
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
            <label>知识点 *</label>
            <input
              className="input"
              value={knowledgePoint}
              onChange={(e) => setKnowledgePoint(e.target.value)}
              placeholder="如：牛顿第二定律"
            />
          </div>
          <div className="field">
            <label>分类标签</label>
            <input
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="如：力学、电学、实验"
            />
          </div>
          <div className="field">
            <label>来源</label>
            <select className="select" value={source} onChange={(e) => setSource(e.target.value)}>
              <option value="homework">作业</option>
              <option value="exam">考试</option>
              <option value="class">课堂</option>
            </select>
          </div>
          <div className="field">
            <label>难度</label>
            <select className="select" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">简单</option>
              <option value="medium">中等</option>
              <option value="hard">困难</option>
            </select>
          </div>
          <div className="field">
            <label>掌握状态</label>
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="unmastered">未掌握</option>
              <option value="reviewing">复习中</option>
              <option value="mastered">已掌握</option>
            </select>
          </div>

          <div className="field field-full">
            <label>题干 *</label>
            <textarea
              className="textarea"
              style={{ minHeight: 100 }}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="把题目内容写在这里"
            />
          </div>

          <div className="field">
            <label>题目图片（可选）</label>
            <input
              className="input"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="field">
            <label>学生答案</label>
            <textarea
              className="textarea"
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
            />
          </div>
          <div className="field">
            <label>解题过程</label>
            <textarea
              className="textarea"
              value={processText}
              onChange={(e) => setProcessText(e.target.value)}
            />
          </div>
          <div className="field">
            <label>错误答案 / 错误原因</label>
            <textarea
              className="textarea"
              value={wrongAnswer}
              onChange={(e) => setWrongAnswer(e.target.value)}
            />
          </div>
          <div className="field">
            <label>正确解法</label>
            <textarea
              className="textarea"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
            />
          </div>

          <div className="field field-full">
            <label>错误类型</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {errorTypes.map((t) => (
                <label
                  key={t.id}
                  className={`badge ${
                    errorTypeIds.includes(t.id) ? "badge-amber" : "badge-gray"
                  }`}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={errorTypeIds.includes(t.id)}
                    onChange={() => toggleErrorType(t.id)}
                    style={{ marginRight: 4 }}
                  />
                  {t.name}
                </label>
              ))}
            </div>
          </div>

          <div className="field field-full">
            <label>匹配评价维度</label>
            {hint ? (
              <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
                {hint}
              </div>
            ) : null}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dimensions.map((dim) => (
                <div key={dim.id}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>
                    {dim.name}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {dim.indicators.map((ind) => (
                      <label
                        key={ind.id}
                        className={`badge ${
                          indicatorIds.includes(ind.id)
                            ? "badge-blue"
                            : "badge-gray"
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          checked={indicatorIds.includes(ind.id)}
                          onChange={() => toggleIndicator(ind.id)}
                          style={{ marginRight: 4 }}
                        />
                        {ind.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedErrorNames.length > 0 ? (
          <div className="muted" style={{ marginTop: 14, fontSize: 12 }}>
            已选错误类型：
            {selectedErrorNames.map((n) => (
              <Badge key={n} tone="amber" children={n} />
            ))}
          </div>
        ) : null}
        {error ? <div className="error-text" style={{ marginTop: 12 }}>{error}</div> : null}

        <div className="form-actions" style={{ justifyContent: "space-between" }}>
          <button type="button" className="btn" onClick={() => router.back()}>
            <IconBack size={15} />
            返回
          </button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={busy}>
            {busy ? "保存中…" : "保存错题"}
          </button>
        </div>
      </div>
    </>
  );
}
