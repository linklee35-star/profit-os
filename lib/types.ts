// ============================================================================
// 全局类型定义 —— 所有模块的输入/输出契约都集中在这里
// 页面组件只消费这些类型，不直接编写任何计算公式
// ============================================================================

/** 系统模式：快速估算 / 真实利润 */
export type Mode = "quick" | "real";

/** 国家代码（新增国家只需扩展联合类型 + 国家配置文件） */
export type CountryCode = "TH" | "VN";

/** 汇率来源 */
export type RateSource = "auto" | "custom";

/** 汇率 API 供应商 */
export type RateProvider = "erapi" | "frankfurter";

/** 广告成本计算模式 */
export type AdMode = "cpa" | "spend";

/** 进口关税品类 */
export type DutyCategory = "general" | "fashion" | "bags" | "electronics" | "custom";

/** 目标定价模式：按净利润 / 按利润率 */
export type TargetPricingMode = "profit" | "margin";

/** 利润健康度分级 */
export type HealthLevel = "danger" | "warning" | "healthy" | "excellent";

/**
 * 利润计算的统一输入对象。
 * 所有输入模块最终都只负责往这个对象里填字段，
 * profit-engine 是其唯一消费者。新增成本项 = 给这里加字段即可。
 */
export interface ProfitInput {
  // —— 商品成本（人民币 RMB）——
  purchaseCost: number; // 采购成本
  domesticShipping: number; // 国内运费
  packagingCost: number; // 包装成本
  intlShipping: number; // 国际物流（由 weightGrams × shippingRatePerKg + shippingHandling 推导，或手动覆盖）
  otherCost: number; // 其它成本

  // —— 真实物流（按重量 × 货代单价，RMB）——
  weightGrams: number; // 商品重量（克）
  shippingRatePerKg: number; // 国际物流单价（RMB/kg，货代报价，如跨境小包专线）
  shippingHandling: number; // 国际物流固定操作费（RMB/单）
  logisticsMode: "weight" | "manual"; // 物流计算模式：按重量推导 / 手动填写国际物流

  // —— 汇率 ——
  rate: number; // CNY → 目标币种（如 THB）

  // —— 销售 ——
  price: number; // 商品售价（目标币种）

  // —— 品类模板 ——
  category: string; // 品类模板 ID（"default" 或具体品类）

  // —— 平台费用 ——
  commissionRate: number; // 佣金 %
  transactionRate: number; // 交易费 %
  growthRate: number; // 增长费 %
  infrastructureFee: number; // 基础设施费（固定，目标币种）

  // —— 达人合作 ——
  influencerCommissionRate: number; // 达人佣金 %
  influencerFixedFeeRMB: number; // 达人坑位费（RMB）
  influencerSampleFeeRMB: number; // 达人送样费（RMB）
  influencerSampleShippingRMB: number; // 达人样品物流费（RMB）

  // —— 广告 ——
  adMode: AdMode;
  cpa: number; // 直接 CPA（目标币种）
  adSpend: number; // 广告总消耗（目标币种）
  adOrders: number; // 订单数
  adCreativeCost: number; // 广告素材成本（目标币种，按订单分摊）
  adAgencyFee: number; // 广告代理服务费（目标币种，按订单分摊）
  adProductionCost: number; // 广告创意制作成本（目标币种，按订单分摊）
  adAmortizeOrders: number; // 广告高级成本分摊订单数

  // —— 物流风险 ——
  returnRate: number; // 退货率 %
  rejectRate: number; // 拒收率 %
  lostRate: number; // 丢件率 %
  compRate: number; // 物流赔付率 %

  // —— 税务 ——
  vatRate: number; // VAT %
  vatIncluded: boolean; // 售价是否已含税（价内税，不重复扣减）
  importDutyRate: number; // 进口关税 %
  customsFee: number; // 清关费用（固定，目标币种）
  taxServiceFee: number; // 税务服务费（固定，目标币种）

  // —— 收款 ——
  withdrawFeeRate: number; // 提现手续费 %
  platformFeeRate: number; // 收款平台手续费 %
  fxLossRate: number; // 汇率损耗 %

  // —— 仓储 ——
  storageFee: number; // 仓储费（固定，目标币种）
  localWarehouseHandling: number; // 本土仓操作费（固定）
  packagingLabor: number; // 包装人工费（固定）
  orderProcessingFee: number; // 订单处理费（固定）

  // —— 团队成本（按订单分摊）——
  csCost: number; // 客服成本
  opsCost: number; // 运营成本
  softwareCost: number; // 软件订阅成本
  officeCost: number; // 办公成本
  teamAmortizeOrders: number; // 团队成本分摊订单数

  // —— 进口关税（2026年1月1日起泰国取消1500铢免税额度）——
  dutyEnabled: boolean; // 是否启用关税计算
  dutyCategory: DutyCategory; // 关税品类
  dutyRate: number; // 进口关税税率 %（custom 品类时手动填写）

  // —— 目标定价（反向计算建议售价）——
  targetPricingMode: TargetPricingMode; // 按净利润 / 按利润率
  targetProfit: number; // 目标净利润（目标币种）
  targetMargin: number; // 目标利润率 %

  // —— 模块开关（关闭则该模块成本不计算、界面置灰）——
  logisticsEnabled?: boolean; // 物流风险
  adEnabled?: boolean; // 广告
  influencerEnabled?: boolean; // 达人合作
}

/**
 * 各项成本的拆解结果（全部以目标币种计量）。
 * 用于成本结构图、售价拆解图与指标卡。
 */
export interface CostBreakdown {
  productCost: number; // 商品成本（含汇率换算）
  platformFee: number; // 平台费用
  influencerFee: number; // 达人费用（佣金 + 固定费换算）
  adCost: number; // 广告费用
  logisticsLoss: number; // 物流风险损耗
  importDutyCost: number; // 进口关税（买家承担，展示用）
  taxCost: number; // 税务成本（VAT + 清关 + 税务服务）
  receivingCost: number; // 收款成本
  warehouseCost: number; // 仓储成本
  teamCost: number; // 团队成本
}

/** 利润计算结果 */
export interface ProfitResult {
  productCostRMB: number; // 商品总成本（RMB）
  productCost: number; // 商品总成本（目标币种）
  price: number; // 售价
  breakdown: CostBreakdown;
  totalCost: number; // 总成本（不含广告？见下）—— 实际为全部成本之和
  totalCostExclAd: number; // 除广告外的全部成本（用于保本 CPA）
  netProfit: number; // 单件净利润
  profitMargin: number; // 利润率 %
  roi: number; // ROI %
  breakEvenCPA: number; // 保本 CPA
  breakEvenROAS: number; // 保本 ROAS
  breakEvenPrice: number; // 保本售价
  health: HealthLevel; // 利润健康度
  suggestedPrice: number; // 目标利润/利润率建议售价
  buyerTotalCost: number; // 买家应付总额（售价+VAT+关税）
}

/** 国家配置文件结构（国家层 —— 与平台无关的参数） */
export interface CountryConfig {
  code: CountryCode;
  name: string; // 中文名
  enName: string; // 英文名
  flag: string; // emoji 旗帜
  currency: string; // ISO 币种代码，如 THB
  currencySymbol: string; // 符号，如 ฿
  /** 默认 CNY → 该币种汇率 */
  defaultRate: number;
  /** 示例售价（目标币种，用于新用户默认输入，如 TH 299 / VN 299000） */
  samplePrice?: number;
  /** VAT 默认值（%） */
  vat: number;
}

// ============================================================================
// 四层架构：模型层 Model × 平台层 Platform × 国家层 Country × 数据层 FeeData
//   - 模型层：电商利润 / 外贸报价（B2B，FOB/CIF/出口退税/关税）等计算模型
//   - 平台层：每种平台一套费目 schema（TikTok Shop / Shopee / Lazada…）
//   - 国家层：币种 / VAT / 汇率 / 关税框架（与平台无关）
//   - 数据层：平台 × 国家的具体费率，必须带来源 + 生效日期
// 新增市场 = 新增国家文件；新增平台 = 新增 schema + 各国数据；两者互不污染
// ============================================================================

/** 计算模型层 —— 电商利润模型 / 外贸报价模型（路线图） */
export type ModelId = "ecommerce" | "foreign-trade";

/** 平台代码（新增平台只需扩展联合类型 + 平台 schema 文件） */
export type PlatformId = "tiktok-shop";

/** 平台费目定义（schema 驱动：UI 按此渲染表单，引擎按此计算） */
export interface PlatformFeeField {
  key: string;
  labelZh: string;
  labelEn?: string;
  /** percent = 百分比费率；fixed = 固定金额 */
  unit: "percent" | "fixed";
  /** price-based = 按售价百分比；per-order = 每单固定金额 */
  formula: "price-based" | "per-order";
  note?: string;
}

/** 平台 schema —— 每个平台一套费目结构 + 到模型输入字段的映射 */
export interface PlatformFeeSchema {
  id: PlatformId;
  name: string;
  /** 该平台属于哪个计算模型 */
  model: ModelId;
  feeFields: PlatformFeeField[];
  /** 平台费目值 → 模型输入字段（模型层契约，各平台自行实现） */
  mapToInput?: (values: Record<string, number>) => Partial<ProfitInput>;
}

/** 平台 × 国家 费率数据（数据层，必须带来源与生效日期，社区 PR 同规） */
export interface PlatformCountryFees {
  platform: PlatformId;
  country: CountryCode;
  /** 生效日期 YYYY-MM-DD */
  effectiveFrom: string;
  /** 数据来源（官方公告 / 第三方汇总，必须可追溯） */
  source: string;
  /** 费目值（key 对应 PlatformFeeSchema.feeFields[].key） */
  values: Record<string, number>;
  notes?: string;
}

/** SKU 成本库条目（含对比排行所需的轻量字段） */
export interface SkuItem {
  id: string;
  sku: string;
  name: string;
  purchaseCost: number;
  domesticShipping: number;
  packagingCost: number;
  intlShipping: number;
  otherCost: number;
  price: number; // 售价（目标币种）
  cpa: number; // CPA（目标币种）
  influencerCommissionRate: number; // 达人佣金 %
  note: string;
  createdAt: number;
}

/** 品类模板：选择后自动预填一组真实参考费率 */
export interface CategoryTemplate {
  id: string;
  name: string;
  desc: string;
  /** 应用到输入对象上的字段覆盖 */
  patch: Partial<ProfitInput>;
}

/** 批测 Excel 行 */
export interface BatchRow {
  sku: string;
  name: string;
  purchaseCost: number;
  logisticsCost: number; // 国际物流
  price: number;
  cpa: number;
  influencerCommissionRate: number;
}

/** 批测排名结果 */
export interface BatchResult extends BatchRow {
  productCostTHB: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

/** 汇率 API 返回结构 */
export interface RateResponse {
  source: RateProvider;
  from: string; // CNY
  to: string; // 目标币种
  rate: number;
  updatedAt: string; // ISO 时间
}

/** 泰国进口关税品类预设（2026年1月起，CIF价值×税率） */
export const DUTY_PRESETS: { id: DutyCategory; label: string; rate: number; desc: string }[] = [
  { id: "general", label: "通用商品", rate: 10, desc: "最低进口关税率" },
  { id: "electronics", label: "电器/电子产品", rate: 10, desc: "电子产品 10%" },
  { id: "bags", label: "包袋/配饰", rate: 20, desc: "箱包配饰 20%" },
  { id: "fashion", label: "时尚/服饰/鞋", rate: 30, desc: "时尚服饰鞋履最高 30%" },
  { id: "custom", label: "自定义", rate: 0, desc: "手动输入税率" },
];
