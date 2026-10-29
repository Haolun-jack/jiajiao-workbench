// 显式的「错误类型 → 二级评价指标」匹配规则。
// 录入错题时，系统先按这里给出建议，老师可手动增删，结果可追溯。
const errorTypeToIndicators: Record<string, string[]> = {
  concept: ["概念辨析能力", "模型识别能力"],
  formula: ["公式应用能力"],
  reading: ["审题信息提取"],
  process: ["物理过程拆解"],
  calculation: ["数理结合能力", "低级失误频率"],
  step: ["步骤书写规范"],
  critical: ["临界分析能力"],
  time: ["时间分配策略", "难度分层应对"],
  model: ["模型识别能力"],
  experiment: ["实验知识掌握"],
  drawing: ["作图辅助意识"],
  careless: ["低级失误频率"],
  mindset: ["思维定势程度"],
  system: ["系统思维能力"],
  review: ["错题复盘能力"],
};

export function matchErrorTypesToIndicators(code: string): string[] {
  return errorTypeToIndicators[code] ?? [];
}
