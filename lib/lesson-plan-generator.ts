type GenerateInput = {
  title?: string;
  subject?: string;
  studentName?: string;
  classNo?: number;
  sourceText?: string;
};

// 这是一张显式的「关键词 → 教学重点」规则表，生成结果完全可解释。
// 命中多个时按顺序取第一个；没有命中时使用通用物理表述。
const keywordRules: { keywords: string[]; focus: string; difficulty: string }[] = [
  {
    keywords: ["受力分析", "牛顿第二定律", "牛顿运动定律", "摩擦力", "平衡条件"],
    focus: "受力分析与牛顿运动定律",
    difficulty: "受力分析顺序、牛顿第二定律的矢量性与临界问题",
  },
  {
    keywords: ["动能定理", "机械能守恒", "功", "功率", "能量守恒"],
    focus: "功与能、动能定理的应用",
    difficulty: "动能定理中功的正负与多过程能量转化",
  },
  {
    keywords: ["动量", "碰撞", "动量守恒", "冲量"],
    focus: "动量定理与动量守恒",
    difficulty: "碰撞模型的动量与能量综合",
  },
  {
    keywords: ["电场", "电势", "电势能", "电容器", "库仑"],
    focus: "电场性质与带电粒子运动",
    difficulty: "电势能变化与带电粒子在电场中的偏转",
  },
  {
    keywords: ["磁场", "安培力", "洛伦兹力", "电磁感应", "楞次"],
    focus: "磁场与电磁感应",
    difficulty: "带电粒子在磁场中的圆周运动、电磁感应综合",
  },
  {
    keywords: ["电路", "欧姆定律", "闭合电路", "电功率", "电阻"],
    focus: "电路分析与闭合电路欧姆定律",
    difficulty: "动态电路分析与电功率极值",
  },
  {
    keywords: ["实验", "器材", "误差"],
    focus: "物理实验原理与误差分析",
    difficulty: "实验数据处理与误差来源分析",
  },
];

export function generateLessonPlanDraft(input: GenerateInput): string {
  const subject = input.subject?.trim() || "物理";
  const studentName = input.studentName?.trim() || "";
  const classNo = input.classNo ?? null;
  const material = (input.sourceText ?? "").trim();

  const matched =
    keywordRules.find((rule) =>
      rule.keywords.some((kw) => material.includes(kw)),
    ) ?? null;

  const focus = matched?.focus ?? "本章核心概念与典型题型";
  const difficulty = matched?.difficulty ?? "概念辨析与综合情境的应用";

  const title =
    input.title?.trim() ||
    (classNo ? `第 ${classNo} 次课教案` : "物理课教案");

  return [
    `课题：${title}`,
    `授课科目：${subject}`,
    classNo ? `课次：第 ${classNo} 次课` : "",
    studentName ? `学生：${studentName}` : "",
    "",
    "一、教学目标",
    `1. 知识目标：掌握「${focus}」的核心概念与规律。`,
    "2. 能力目标：能够运用所学规律解决典型情境问题，规范书写步骤。",
    "3. 素养目标：养成建模、受力分析、过程拆解的解题习惯。",
    "",
    "二、教学重难点",
    `重点：${focus}`,
    `难点：${difficulty}`,
    "",
    "三、教学过程",
    "1. 复习导入（5 分钟）：回顾上节课知识，从学生近期错题切入。",
    "2. 新知讲解（25 分钟）：围绕下面材料展开。",
    "",
    "【上课材料】",
    material || "（未提供材料，请补充讲义、试卷或知识点说明）",
    "",
    "3. 例题精讲（15 分钟）：精选 2~3 道典型例题，先让学生尝试，再讲解思路。",
    "4. 课堂小结（5 分钟）：梳理核心公式、适用条件与解题步骤。",
    "5. 作业布置：课后练习 + 错题整理。",
    "",
    "四、例题（待补充）",
    "例题 1：",
    "例题 2：",
    "",
    "五、错题衔接",
    `建议关联学生近期错题中与「${focus}」相关的题目，课上针对性巩固。`,
  ]
    .filter((line) => line !== "")
    .join("\n");
}
