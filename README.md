# TikTok Shop SEA Profit OS

东南亚跨境电商利润分析系统 —— 帮助 TikTok Shop 卖家精确计算**真实利润、利润率、保本售价、保本 CPA、保本 ROAS**，并提供定价、广告、达人合作与成本管理决策工具。

> 不只是计算器，而是跨境电商运营决策系统。
> 第一阶段支持 **TikTok Shop 泰国站（THB）**，国家配置化，未来新增站点零重构。

---

## ✨ 功能一览

- **两种模式**：快速估算（核心成本）/ 真实利润（全部成本，高级项默认 0）
- **12 个成本模块**：商品成本、销售、平台费用、达人合作、广告、物流风险、税务、收款、仓储、团队成本（全部实时联动）
- **利润模拟器**：拖动售价 / CPA / 达人佣金 / 退货率 / 拒收率，结果即时刷新
- **Dashboard**：核心指标卡（动画）、成本结构环图、售价拆解图、利润模拟曲线、利润健康度分级
- **SKU 成本库**：增删改查 / 搜索 / 复制 / 一键应用到分析（LocalStorage 持久化）
- **批量测品**：上传 Excel → 自动利润 / 利润率 / ROI 排行榜 → 导出 Excel
- **汇率系统**：自动（er-api / Frankfurter 双源 + 缓存 + 离线兜底）/ 手动覆盖
- **导出**：结果面板导出 **PNG / PDF**，批测结果导出 **Excel**
- **数据持久化**：自动保存、刷新恢复、配置导入 / 导出
- **体验**：深色 / 浅色主题、响应式（移动端 + PC 端）、数字滚动动画

---

## 🧱 技术栈

| 层 | 技术 |
|---|---|
| 框架 | Next.js 14（App Router）+ React 18 + TypeScript（strict） |
| 样式 | Tailwind CSS + shadcn/ui + Lucide 图标 |
| 状态 | Zustand（persist → LocalStorage） |
| 表单校验 | React Hook Form + Zod |
| 图表 | Recharts（动态懒加载） |
| 精度 | decimal.js（避免浮点误差） |
| 导出 | xlsx / jspdf / html-to-image（均动态 import） |
| 存储 | LocalStorage |
| 部署 | Vercel |

---

## 📁 目录结构

```
app/
  layout.tsx              根布局（主题 + 外壳）
  page.tsx               利润分析 Dashboard
  sku-library/            SKU 成本库
  batch-test/            批量测品
  settings/              设置（汇率 / 国家 / 数据管理）
  api/exchange-rate/     汇率代理（双源兜底）
components/
  ui/                    shadcn 基础组件
  AppShell.tsx           侧边栏 + 顶栏（模式 / 国家 / 主题 / 汇率）
  modules/               12 个输入模块 + 共享字段组件
  dashboard/             指标卡 / 图表 / 模拟器 / 导出条
  sku/                   SKU 表单（RHF + Zod）
lib/
  profit-engine.ts       ★ 唯一对外计算入口
  fee-engine.ts          各项成本计算
  pricing-engine.ts      保本点 / 利润率 / ROI / 健康度
  calculations.ts        定点运算工具（decimal.js）
  exchange-rate.ts       汇率客户端
  countries/             国家配置（新增国家只加文件）
  schema.ts              默认输入 + 国家默认值应用
  batch.ts               批量测品计算
  exporters.ts           Excel / PDF / PNG 导出
  storage.ts / format.ts / sample.ts / types.ts / utils.ts
store/                   Zustand：输入 / 设置 / SKU
hooks/                   useProfit / useCountUp
tests/                   Vitest 引擎单测
```

---

## 🚀 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
# 打开 http://localhost:3000

# 3. 生产构建
npm run build
npm run start

# 4. 运行引擎单元测试
npm test
```

> 汇率自动获取需要可访问外网（er-api / Frankfurter）。离线时系统自动回退至上次成功值或国家默认汇率，计算不受影响。

---

## ☁️ 部署到 Vercel

### 方式一：Git 导入（推荐）
1. 将本项目推送到 GitHub / GitLab
2. 在 Vercel 中 **New Project → Import** 该仓库
3. Framework 选择 **Next.js**（自动识别），无需额外配置
4. 点击 **Deploy**

### 方式二：CLI
```bash
npm i -g vercel
vercel login
vercel            # 按提示部署
vercel --prod    # 生产环境
```

部署后默认即为生产构建；汇率功能通过自带 API Route（`/api/exchange-rate`）在服务端获取，无需配置密钥。

---

## 🌏 扩展新国家（零重构核心引擎）

只需两步：

1. 新建 `lib/countries/<country>.ts`，导出 `CountryConfig`（佣金、交易费、增长费、VAT、默认汇率等）
2. 在 `lib/countries/index.ts` 的 `registry` 中 `import` 并注册

`profit-engine` / `fee-engine` / `pricing-engine` **完全不用改动**。顶栏即可切换国家，平台费用与 VAT 自动套用该国默认值。

---

## 🧮 计算引擎说明（核心公式）

所有公式集中在 `lib/` 下，**页面组件不写任何计算公式**。

```
商品总成本(RMB) = 采购 + 国内运费 + 包装 + 国际物流 + 其它
商品总成本(THB) = 商品总成本(RMB) × 汇率
平台费用        = 售价 ×(佣金 + 交易费 + 增长费) + 基础设施费
达人佣金        = 售价 × 达人佣金率
广告成本        = CPA ｜ 广告总消耗 ÷ 订单数
物流损耗        = 售价 ×(退货 + 拒收 + 丢件 + 赔付)率
VAT 成本        = 售价 × VAT 率
收款成本        = 售价 ×(提现 + 平台 + 汇损)率
净利润          = 售价 − 商品 − 平台 − 达人 − 广告 − 物流 − 税务 − 收款 − 仓储 − 团队
利润率          = 净利润 ÷ 售价 × 100
ROI             = 净利润 ÷ 总成本 × 100
保本 CPA        = 售价 − 除广告外的全部成本
保本 ROAS       = 售价 ÷ 保本 CPA
保本售价        = 固定成本 ÷ (1 − 总费率)
```

金额全程使用 `decimal.js` 定点运算，规避 JS 浮点漂移。

---

## 📊 示例数据

- SKU 成本库：预置 4 个宠物用品示例（可在「SKU 成本库 → 载入示例」重置）
- 批量测品：预置 6 行示例（打开「批量测品」页即见）
- Dashboard 默认填充一套泰国站合理参数，开箱即用

---

## ✅ 质量保障

- TypeScript `strict` 模式
- 计算引擎 Vitest 单测（`tests/profit-engine.test.ts`，覆盖基础 / 亏损 / 健康度 / 分摊 / 汇率换算等场景）
- 重库（xlsx / jspdf / html-to-image / recharts）全部动态加载，保障首屏性能
- 所有数据本地持久化，刷新自动恢复
