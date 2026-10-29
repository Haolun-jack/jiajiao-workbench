export type Level = "none" | "light" | "medium" | "severe";

export type EvaluationItemResult = {
  indicatorId: number;
  level: Level;
  mistakeCount: number;
  totalMistakes: number;
  note: string;
};

export const RULE_VERSION = 1;

// 显式的分级规则：按「命中错题数 / 周期错题总数」计算错误率。
// 50% 及以上为重度，20% 至 50% 为中度，0 至 20% 为轻度，0 为未发现。
export function evaluateLevel(matchedCount: number, totalMistakes: number): Level {
  if (matchedCount === 0) return "none";
  const rate = totalMistakes > 0 ? matchedCount / totalMistakes : 0;
  if (rate >= 0.5) return "severe";
  if (rate >= 0.2) return "medium";
  return "light";
}

export function buildEvaluationItems(
  indicators: { id: number }[],
  counts: Map<number, number>,
  totalMistakes: number,
): EvaluationItemResult[] {
  return indicators.map((indicator) => {
    const matched = counts.get(indicator.id) ?? 0;
    const level = evaluateLevel(matched, totalMistakes);
    const rate = totalMistakes > 0 ? Math.round((matched / totalMistakes) * 100) : 0;
    return {
      indicatorId: indicator.id,
      level,
      mistakeCount: matched,
      totalMistakes,
      note:
        matched === 0
          ? "本周期无相关错题"
          : `命中 ${matched} 道错题，错误率 ${rate}%`,
    };
  });
}
