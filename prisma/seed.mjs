import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dimensions = [
  { code: "knowledge", name: "知识掌握度", description: "基础层，判断学生基础是否扎实", sort: 1 },
  { code: "problem_solving", name: "解题能力", description: "方法层，判断方法会不会用", sort: 2 },
  { code: "habits", name: "答题习惯与规范", description: "非知识失分", sort: 3 },
  { code: "thinking", name: "物理思维", description: "深层能力", sort: 4 },
  { code: "exam", name: "应试状态", description: "考场发挥", sort: 5 },
];

const indicators = [
  {
    dimension: "knowledge",
    name: "概念辨析能力",
    judgementCriteria: "相似概念混淆，如位移与路程、平均速度与平均速率、平衡力与相互作用力等；概念理解存在偏差",
    lightStandard: "同类概念题错误率低于20%，偶尔混淆边缘概念",
    mediumStandard: "错误率20%至50%，核心概念理解有偏差",
    severeStandard: "错误率高于50%，多个核心概念完全混淆，本质理解错误",
    intervention: "回归教材拆解概念；用正误判断题、对比表强化辨析；配套基础概念专项训练",
  },
  {
    dimension: "knowledge",
    name: "公式应用能力",
    judgementCriteria: "公式记错、混用、错用适用范围，如静摩擦套滑动摩擦公式、变加速运动套用匀变速公式",
    lightStandard: "偶尔记错公式形式，不涉及适用范围错误",
    mediumStandard: "频繁套错公式，忽略公式适用前提",
    severeStandard: "公式体系混乱，完全不会根据已知量选择公式",
    intervention: "梳理公式推导链；强化知三求二选型训练；标注每道题的公式选用理由",
  },
  {
    dimension: "knowledge",
    name: "模型识别能力",
    judgementCriteria: "看不出题目对应模型，如追及、活结死结、卫星变轨、类平抛等，找不到切入方法",
    lightStandard: "冷门模型识别困难，常规模型可正常识别",
    mediumStandard: "经典模型识别慢，需提示才能对应",
    severeStandard: "完全无模型意识，所有题目临场试错",
    intervention: "按模型分类刷题；总结每类模型的题干标志、固定解法与易错陷阱",
  },
  {
    dimension: "knowledge",
    name: "实验知识掌握",
    judgementCriteria: "实验步骤、器材、数据处理、误差分析答错",
    lightStandard: "细节步骤记错，核心计算正确",
    mediumStandard: "数据处理方法错误，实验原理理解较浅",
    severeStandard: "实验原理完全不通，创新迁移题无从下手",
    intervention: "重讲实验原理；强化操作流程与数据处理；补充误差分析与创新拓展题",
  },
  {
    dimension: "problem_solving",
    name: "审题信息提取",
    judgementCriteria: "漏看恰好、刚好、不计、光滑等关键词；看错单位、正负、研究对象",
    lightStandard: "偶尔漏看单个条件",
    mediumStandard: "频繁漏看关键条件，凭印象答题",
    severeStandard: "读题抓不住核心，完全误解题意",
    intervention: "强制圈画关键词训练；题干标注已知量、未知量、临界词",
  },
  {
    dimension: "problem_solving",
    name: "物理过程拆解",
    judgementCriteria: "多过程运动、多物体受力分段或分离错误；找不到前后衔接量",
    lightStandard: "复杂过程分段有偏差，主体正确",
    mediumStandard: "多过程拆分混乱，漏掉中间状态",
    severeStandard: "完全不会拆解复杂题，只能做单过程题",
    intervention: "大题强制分段书写；每段标注受力与运动性质；训练找衔接物理量",
  },
  {
    dimension: "problem_solving",
    name: "解题方法选型",
    judgementCriteria: "方法选用低效，如可用动能定理却硬用牛顿定律；不会用图像法、整体法等快捷方法",
    lightStandard: "偶尔选复杂方法，最终能做对",
    mediumStandard: "方法选型频繁出错，导致计算量大增而做错",
    severeStandard: "只会一种解法，不会灵活切换",
    intervention: "总结一题多解；对比不同方法适用场景；训练最优路径意识",
  },
  {
    dimension: "problem_solving",
    name: "数理结合能力",
    judgementCriteria: "几何关系找错、矢量符号混乱、三角函数或二次方程用错、纯计算错误",
    lightStandard: "偶尔算错数，几何关系大体正确",
    mediumStandard: "矢量正负频繁出错，几何关系常找错",
    severeStandard: "数学工具严重不足，无法支撑物理计算",
    intervention: "强化矢量符号规范；专项补几何与三角函数；强制验算步骤",
  },
  {
    dimension: "habits",
    name: "步骤书写规范",
    judgementCriteria: "跳步、不写原始公式、无文字说明、单位或有效数字错误",
    lightStandard: "少量跳步，偶丢步骤分",
    mediumStandard: "大量跳步，公式直接代数字，频繁丢分",
    severeStandard: "无解题过程，只写答案，完全无步骤意识",
    intervention: "强制公式、代值、结果三步书写；按步骤批改扣分",
  },
  {
    dimension: "habits",
    name: "作图辅助意识",
    judgementCriteria: "运动题不画v-t图、受力题不画受力图、光路不画法线、天体不画轨道图",
    lightStandard: "简单题不画，复杂题会画但不标准",
    mediumStandard: "多数题不画图，靠空想导致分析错误",
    severeStandard: "完全没有作图习惯，所有题凭感觉判断",
    intervention: "硬性要求受力、运动、光路、轨道题必须画图；无图的题先补图再讲",
  },
  {
    dimension: "habits",
    name: "低级失误频率",
    judgementCriteria: "符号写反、选非题选成正确项、誊抄答案出错、题干看反",
    lightStandard: "偶发，占错题比例低于20%",
    mediumStandard: "频发，占错题比例20%至50%",
    severeStandard: "占错题比例高于50%，成为主要失分原因",
    intervention: "建立检查清单；限时训练后强制自查；错题本专门记录低级失误",
  },
  {
    dimension: "thinking",
    name: "临界分析能力",
    judgementCriteria: "找不到恰好不相撞、刚好通过最高点、刚好发生全反射等临界条件，列不出临界方程",
    lightStandard: "明显临界能找到，隐含临界需提示",
    mediumStandard: "临界条件频繁遗漏，不会列临界方程",
    severeStandard: "完全无临界意识，所有题按常规状态硬套",
    intervention: "总结常见临界状态清单；专项训练临界词与临界方程对应关系",
  },
  {
    dimension: "thinking",
    name: "思维定势程度",
    judgementCriteria: "默认摩擦力都是阻力、杆的弹力一定沿杆、正压力一定等于重力；用旧题思路套新题",
    lightStandard: "简单情境不受影响，新颖情境偶尔被套",
    mediumStandard: "频繁用旧经验套新题，忽略条件变化",
    severeStandard: "完全靠经验答题，不会具体问题具体分析",
    intervention: "设置变式题组对比训练；要求每题先写条件再写结论",
  },
  {
    dimension: "thinking",
    name: "系统思维能力",
    judgementCriteria: "多物体系统不会用整体法，只会隔离硬算；多过程问题找不到前后衔接的物理量",
    lightStandard: "简单系统会用整体法，复杂系统切换不灵活",
    mediumStandard: "整体与隔离选用混乱，解题绕路",
    severeStandard: "解题视角局限在单个物体、单个过程，看不到整体关联",
    intervention: "强化整体法与隔离法选用训练；专项训练多过程衔接量分析",
  },
  {
    dimension: "exam",
    name: "难度分层应对",
    judgementCriteria: "基础题频繁粗心错，中档题思路卡壳，难题直接空着不写",
    lightStandard: "基础题稳定，中档题偶尔卡壳，难题能写部分步骤",
    mediumStandard: "基础题轻敌失分，中档题频繁卡壳，难题放弃",
    severeStandard: "畏难情绪重，答题节奏严重失衡",
    intervention: "分层限时训练；要求难题先写相关公式拿步骤分；调整答题节奏",
  },
  {
    dimension: "exam",
    name: "错题复盘能力",
    judgementCriteria: "同一模型、同一陷阱的题反复出错，错过的点下次还错",
    lightStandard: "同类错题偶尔再错，经提醒能纠正",
    mediumStandard: "同类错题频繁再错，错题本只抄不总结",
    severeStandard: "完全无错题复盘习惯，错误反复出现",
    intervention: "建立错题复盘闭环；要求错题写明错误原因、正确思路、同类题链接",
  },
  {
    dimension: "exam",
    name: "时间分配策略",
    judgementCriteria: "前面简单题花太久，后面会做的大题没时间写；死磕一道难题",
    lightStandard: "基本能完成，个别题目时间分配不合理",
    mediumStandard: "频繁出现会做的题没时间写",
    severeStandard: "应试策略差，考场节奏完全失控",
    intervention: "整套卷限时训练；制定先易后难答题顺序；模拟考场时间分配",
  },
];

const errorTypes = [
  { code: "concept", name: "概念错误", description: "概念理解偏差或相似概念混淆" },
  { code: "formula", name: "公式错误", description: "公式记错、混用或适用范围用错" },
  { code: "reading", name: "审题错误", description: "漏看关键词、看错条件或误解题意" },
  { code: "process", name: "过程拆解错误", description: "多过程或多物体拆分、衔接错误" },
  { code: "calculation", name: "计算错误", description: "纯计算、几何关系或矢量符号错误" },
  { code: "step", name: "步骤不规范", description: "跳步、缺原始公式或无文字说明" },
  { code: "critical", name: "临界遗漏", description: "找不到或漏掉临界条件" },
  { code: "time", name: "时间不足", description: "时间分配不当导致会做的题没写完" },
  { code: "model", name: "模型识别错误", description: "看不出题目对应模型" },
  { code: "experiment", name: "实验错误", description: "实验原理、步骤、器材或数据处理错误" },
  { code: "drawing", name: "作图缺失", description: "该画的受力图、运动图、光路图未画" },
  { code: "careless", name: "低级失误", description: "符号写反、看反选项、誊抄错误" },
  { code: "mindset", name: "思维定势", description: "用旧经验套新题，忽略条件变化" },
  { code: "system", name: "系统分析错误", description: "不会用整体法或多过程衔接" },
  { code: "review", name: "复盘不足", description: "同类错题反复出现，缺复盘总结" },
];

async function main() {
  const dimensionByCode = {};
  for (const d of dimensions) {
    const row = await prisma.evaluationDimension.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description, sort: d.sort },
      create: d,
    });
    dimensionByCode[d.code] = row.id;
  }

  for (const i of indicators) {
    const data = {
      dimensionId: dimensionByCode[i.dimension],
      name: i.name,
      judgementCriteria: i.judgementCriteria,
      lightStandard: i.lightStandard,
      mediumStandard: i.mediumStandard,
      severeStandard: i.severeStandard,
      intervention: i.intervention,
    };
    const existing = await prisma.evaluationIndicator.findFirst({
      where: { name: i.name },
    });
    if (existing) {
      await prisma.evaluationIndicator.update({ where: { id: existing.id }, data });
    } else {
      await prisma.evaluationIndicator.create({ data });
    }
  }

  for (const t of errorTypes) {
    await prisma.errorType.upsert({
      where: { code: t.code },
      update: { name: t.name, description: t.description },
      create: t,
    });
  }

  const dimCount = await prisma.evaluationDimension.count();
  const indicatorCount = await prisma.evaluationIndicator.count();
  const errorTypeCount = await prisma.errorType.count();
  console.log(`已初始化评价体系：${dimCount} 个维度，${indicatorCount} 个指标，${errorTypeCount} 个错误类型`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
