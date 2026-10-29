# 家教工作台

作者：lunnofunny

高中物理家教工具：教案书写、学生档案、上课记录、错题记录，以及基于《高中物理错题学情诊断评价体系》的学情诊断。

当前进度：已全部完成并交付。功能覆盖教案、学生档案、上课记录、错题记录和基于《高中物理错题学情诊断评价体系》的学情诊断；支持双击启动、数据备份与恢复。

## 环境要求

- Node.js 22+（推荐使用与开发环境一致的 24）
- npm 11+

## 安装与初始化

```powershell
npm install
npm run db:generate
npm run db:push
npm run db:seed
```

说明：

- `db:generate` 根据 `prisma/schema.prisma` 生成数据库访问客户端。
- `db:push` 把表结构同步到本地 SQLite 数据库 `prisma/dev.db`。
- `db:seed` 写入评价体系：5 个一级维度、17 个二级指标、15 个错误类型。

如果删除了 `prisma/dev.db` 后再次执行 `db:push` 仍报 `Schema engine error`，可先手动创建空库再同步：

```powershell
node scripts/ensure-db.mjs
npm run db:push
```

## 启动

日常使用推荐直接双击项目目录里的 `启动家教工作台.bat`，它会自动完成依赖安装、数据库初始化、启动服务和打开浏览器。

手动启动：

```powershell
npm run dev
```

浏览器打开 <http://localhost:3000>，页面数据来自本机 SQLite；接口可通过 `/api` 访问。

停止服务：关闭启动脚本打开的那个黑色窗口即可。

## 页面

| 路径 | 说明 |
| --- | --- |
| `/` | 工作台概览：统计卡片、最近上课、待关注错题 |
| `/students` | 学生列表，支持搜索和新增学生 |
| `/students/[id]` | 学生详情：档案、上课记录、错题、教案、诊断 |
| `/lesson-plans` | 教案列表与详情查看 |
| `/lesson-plans/new` | 新建教案：上传/粘贴材料生成初稿并保存 |
| `/lesson-plans/[id]/edit` | 编辑已保存的教案 |
| `/class-records` | 上课记录列表 |
| `/class-records/new` | 记录一节课 |
| `/mistakes` | 错题列表（含错误类型与匹配维度） |
| `/mistakes/new` | 录入错题：错误类型自动匹配评价维度 |
| `/evaluations` | 学习诊断报告列表 |
| `/evaluations/new` | 选择学生和周期生成诊断报告 |
| `/evaluations/[id]` | 诊断报告详情：能力画像、问题清单、干预建议 |

## 接口清单

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/health` | 健康检查 |
| GET / POST | `/api/students` | 学生列表 / 新增学生 |
| GET / PUT / DELETE | `/api/students/[id]` | 学生详情 / 修改 / 删除 |
| GET / POST | `/api/lesson-plans` | 教案列表 / 新增教案 |
| GET / PUT / DELETE | `/api/lesson-plans/[id]` | 教案详情 / 修改 / 删除 |
| POST | `/api/lesson-plans/generate` | 按模板生成教案初稿 |
| POST | `/api/upload` | 上传材料文件（支持文本与 Word，自动提取正文） |
| GET / POST | `/api/class-records` | 上课记录列表 / 新增 |
| GET / PUT / DELETE | `/api/class-records/[id]` | 上课记录详情 / 修改 / 删除 |
| GET / POST | `/api/mistakes` | 错题列表 / 录入错题 |
| GET / PUT / DELETE | `/api/mistakes/[id]` | 错题详情 / 修改 / 删除 |
| POST | `/api/mistakes/match` | 按错误类型推荐匹配的评价指标 |
| GET | `/api/dimensions` | 五个评价维度及二级指标 |
| GET | `/api/error-types` | 错误类型字典 |
| GET | `/api/evaluations` | 诊断报告列表 |
| POST | `/api/evaluations` | 按周期自动生成诊断报告 |
| GET / DELETE | `/api/evaluations/[id]` | 诊断报告详情 / 删除 |

## 验证示例

```powershell
Invoke-RestMethod http://localhost:3000/api/health

$body = @{ name = "张三"; grade = "高二" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/students -ContentType "application/json" -Body $body
```

学生新增时姓名、年级必填；错题录入时 studentId、知识点、题干必填，可选传 `errorTypeIds` 和 `indicatorIds` 关联错误类型与评价指标。

## 评价规则说明

所有规则显式定义在代码里，可查看可修改，不做黑箱：

- 错误类型到评价指标的匹配规则在 `lib/mistake-matching.ts`。
- 分级规则在 `lib/evaluation-engine.ts`：按「命中错题数 ÷ 周期错题总数」计算错误率，50% 及以上为重度、20% 至 50% 为中度、0 至 20% 为轻度、0 为未发现；每条结论都记录命中的错题数。
- 每次生成的报告都会记录 `ruleVersion` 规则版本号，规则调整后旧报告不会被悄悄篡改。

## 诊断刷新说明

- 按「学生 + 开始日期 + 结束日期」定位报告：同周期再次生成会更新原报告，不产生重复记录。
- 学生详情页会对比「最新诊断时间」和「错题录入时间」，如果诊断后又新增了错题，会提示重新生成诊断。

## 备份与恢复

双击 `备份数据.bat`，会把数据库和上传文件打包到项目里的「备份」文件夹，按时间戳命名。

建议先关闭服务再备份。恢复时，把对应备份文件夹里的 `dev.db` 放回 `prisma\` 目录、`uploads` 放回项目根目录即可，覆盖前先保留一份现有数据。

## 删除说明

所有记录都支持在网页上删除，删除前会二次确认：

- 删除学生：会同时删除该学生的上课记录、错题和诊断报告。
- 删除教案：上课记录会保留，但不再关联这份教案。
- 删除上课记录、错题、诊断报告：只删除对应的这一条记录。

删除不可恢复，重要数据建议先双击 `备份数据.bat` 备份。

## 将来上云（可选）

目前数据都保存在本机。如果以后想在任何设备上使用，可以迁移到云端：

- 首选 Vercel 托管：把数据库从 SQLite 换成 Supabase 或 Neon 的 PostgreSQL，上传文件改用云存储，其余代码基本不用大改。
- 也可以租一台云服务器，安装 Node.js 后用生产模式 `npm run build && npm start` 运行，并配置域名和 HTTPS。

上云前建议先把本地数据备份下来，再逐步迁移。
