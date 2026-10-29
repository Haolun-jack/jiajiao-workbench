export type Tone = "blue" | "green" | "amber" | "red" | "gray" | "violet";

export const attendanceLabels: Record<string, string> = {
  present: "出勤",
  late: "迟到",
  absent: "缺勤",
};

export function attendanceTone(v: string): Tone {
  if (v === "present") return "green";
  if (v === "late") return "amber";
  if (v === "absent") return "red";
  return "gray";
}

export const planStatusLabels: Record<string, string> = {
  draft: "草稿",
  final: "定稿",
};

export function planStatusTone(v: string): Tone {
  return v === "final" ? "green" : "gray";
}

export const planSourceLabels: Record<string, string> = {
  upload: "文件上传",
  paste: "粘贴材料",
  blank: "空白新建",
};

export const mistakeStatusLabels: Record<string, string> = {
  unmastered: "未掌握",
  reviewing: "复习中",
  mastered: "已掌握",
};

export function mistakeStatusTone(v: string): Tone {
  if (v === "mastered") return "green";
  if (v === "reviewing") return "amber";
  return "red";
}

export const mistakeSourceLabels: Record<string, string> = {
  homework: "作业",
  exam: "考试",
  class: "课堂",
};

export const difficultyLabels: Record<string, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const levelLabels: Record<string, string> = {
  none: "未发现",
  light: "轻度",
  medium: "中度",
  severe: "重度",
};

export function levelTone(v: string): Tone {
  if (v === "severe") return "red";
  if (v === "medium") return "amber";
  if (v === "light") return "blue";
  return "gray";
}
