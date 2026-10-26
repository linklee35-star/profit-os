# TikTok Shop SEA Profit OS

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0.html)
[![CI](https://github.com/linklee35-star/profit-os/actions/workflows/ci.yml/badge.svg)](https://github.com/linklee35-star/profit-os/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-vitest-green.svg)](./tests)

东南亚跨境电商利润分析系统 —— 帮助 TikTok Shop 卖家精确计算**真实利润、利润率、保本售价、保本 CPA、保本 ROAS**，并提供定价、广告、达人合作与成本管理决策工具。

> 不只是计算器，而是跨境电商运营决策系统。
> 第一阶段支持 **TikTok Shop 泰国站（THB）+ 越南站（VND）+ 马来西亚站（MYR）**，架构上已按 `模型 × 平台 × 国家 × 数据` 四层解耦——新增平台、新增市场、以及外贸报价模型（B2B），均无需改动核心引擎。

🌐 **在线 Demo（PWA，可安装）**：https://linklee35-star.github.io/profit-os

> 🚀 **想用自己的实例？** Fork 本仓库 → **Settings → Pages → Source 选 `GitHub Actions`** → 1 分钟后你的专属地址上线（`https://<你的用户名>.github.io/profit-os`）。
> 数据全在浏览器本地（LocalStorage），不经过任何服务器，部署零成本。

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
| 部署 | GitHub Pages（纯静态导出 + PWA） |

---

## 🏗 架构：四层解耦

```
模型层 Model      电商利润模型 ｜ 外贸报价模型（规划中：FOB/CIF/出口退税/关税）
平台层 Platform   TikTok Shop ｜ Shopee / Lazada（规划中）
国家层 Country    币种 / VAT / 汇率 / 关税框架（与平台无关）
数据层 FeeData    平台 × 国家 的具体费率，全部带来源 + 生效日期
```

| 扩展方向 | 动作 | 引擎改动 |
|---|---|---|
| 新国家 | `lib/countries/<country>.ts` 注册 | 无 |
| 新平台 | `lib/platforms/<platform>.ts`（schema） | 无 |
| 新费率数据 | `lib/fees/<platform>-<country>.ts`（带来源+日期） | 无 |
| 新计算模型 | 模型层新增（外贸报价等） | 引擎内新增模型，存量模型不动 |

---

## 📁 目录结构

```
app/
  layout.tsx              根布局（主题 + 外壳）
  page.tsx               利润分析 Dashboard
  sku-library/            SKU 成本库
  batch-test/            批量测品
  settings/              设置（汇率 / 国家 / 数据管理）
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
  countries/             国家层配置（新增国家只加文件）
  platforms/             平台层 schema（新增平台只加文件）
  fees/                  数据层费率（平台 × 国家，带来源 + 生效日期）
  schema.ts              默认输入 + 国家/平台默认值应用
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

# 2. 启动开发服务器（注意 basePath 子路径）
npm run dev
# 打开 http://localhost:3000/profit-os

# 3. 生产构建（静态导出 → out/）
npm run build
npm run start

# 4. 运行引擎单元测试
npm test
```

> 汇率自动获取需要可访问外网（er-api / Frankfurter）。离线时系统自动回退至上次成功值或国家默认汇率，计算不受影响。

---

## ☁️ 部署到 GitHub Pages

本项目为**纯静态导出**（`output: "export"`，零服务端依赖），通过 GitHub Actions 自动部署：

1. Fork 或 Clone 本仓库
2. 仓库 **Settings → Pages → Source** 选择 **GitHub Actions**
3. 推送即自动构建部署，地址：`https://<你的用户名>.github.io/profit-os/`
4. 打开后浏览器可直接**安装为 PWA**（地址栏安装图标 / 移动端"添加到主屏幕"）

汇率通过 er-api / Frankfurter 双源在**浏览器直连**获取（两者均开放 CORS），带 10 分钟本地缓存与离线兜底，无需任何服务端与密钥。

> 本地开发时因 `basePath` 配置，地址为 http://localhost:3000/**profit-os**/

---

## 🌏 扩展指南（零重构核心引擎）

**新增国家**：`lib/countries/<country>.ts` 导出 `CountryConfig`（币种、VAT、默认汇率）→ 在 `lib/countries/index.ts` 注册。

**新增平台**：`lib/platforms/<platform>.ts` 定义费目 schema 与输入映射 → 在 `lib/platforms/index.ts` 注册。

**新增费率数据**：`lib/fees/<platform>-<country>.ts` 导出 `PlatformCountryFees` → 在 `lib/fees/index.ts` 注册。

以上三类扩展，`profit-engine` / `fee-engine` / `pricing-engine` **完全不用改动**。

### 📐 费率数据规范（社区 PR 硬性要求）

费率是这个产品的生命线。每一份数据必须：

1. **带来源**：官方公告链接或可追溯的第三方汇总（写进 `source`）
2. **带生效日期**：YYYY-MM-DD（写进 `effectiveFrom`）
3. **变更留痕**：调价时旧值写入 `notes`，不静默覆盖
4. **区分类目**：如 TikTok 的 Mall / 非 Mall / 电子类目费率不同，默认采用非 Mall 通用类目并在 `notes` 说明

---

## 🗺 路线图

- [x] **多市场第一步**：泰国（TH）+ 越南（VN）+ 马来西亚（MY）—— 费率数据带来源与生效日期
- [ ] **多平台**：Shopee / Lazada / 阿里国际站
- [ ] **多市场**：菲律宾 / 印尼 / 新加坡
- [ ] **外贸报价模型（B2B）**：FOB / CIF 报价、出口退税（按 HS 编码退税率）、进口关税、拼柜/整柜、锁汇
- [ ] 费率数据自动更新与变更通知
- [ ] 多设备同步 / 团队协作（账号体系）

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
- GitHub Actions CI（每次推送自动跑类型检查 + 单测）
- 重库（xlsx / jspdf / html-to-image / recharts）全部动态加载，保障首屏性能
- 所有数据本地持久化，刷新自动恢复

---

## 🤝 贡献

欢迎 Issue 和 PR！尤其是：

- **费率数据修正/新增**（请遵守上方数据规范——这是对产品最大的贡献）
- 新国家 / 新平台的配置
- Bug 修复与体验优化

## 📄 License

[AGPL-3.0](./LICENSE) —— 你可以自由使用、修改和分发本软件；基于它提供网络服务时，必须以相同许可证开源你的修改。
