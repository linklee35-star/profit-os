/**
 * Margin OS MCP Server
 *
 * 让 AI agent 直接调用利润计算引擎，无需人工在网页里手填数值。
 * 核心设计：agent 只需传「国家 + 平台 + 售价 + 少量成本」，
 * 费率 / 汇率 / 税 / 物流默认值全部由数据层自动补齐。
 *
 * 传输：stdio（零部署、零 Key、零模型成本）
 * 运行：npx tsx mcp/server.ts
 */

import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { calculateProfit, calculateProfitAtPrice } from "../lib/profit-engine";
import { applyCountryDefaults, DEFAULT_INPUT } from "../lib/schema";
import { getCountry } from "../lib/countries";
import { getPlatform } from "../lib/platforms";
import { getPlatformFees, getPlatformsForCountry, feeData } from "../lib/fees";
import type { CountryCode, PlatformId, ProfitInput } from "../lib/types";

const server = new McpServer({
  name: "margin-os",
  version: "1.0.0",
});

// ============================================================================
// 工具 1：列出可用市场（国家 × 平台）
// ============================================================================

server.registerTool(
  "list_markets",
  {
    description:
      "列出 Margin OS 支持的所有市场组合（国家 + 平台 + 币种 + 默认费率）。当用户没说清在哪个国家/平台卖货时，先调这个工具确认可选范围。",
    inputSchema: z.object({}),
  },
  async () => {
    const lines = feeData.map((f) => {
      const country = getCountry(f.country);
      const platform = getPlatform(f.platform);
      return [
        `${country.flag} ${country.name}(${f.country}) × ${platform.name}(${f.platform})`,
        `  币种 ${country.currency} (${country.currencySymbol}) · ${country.taxName ?? "VAT"} ${country.vat}%`,
        `  默认汇率 1 CNY = ${country.defaultRate} ${country.currency} · 示例售价 ${country.currencySymbol}${country.samplePrice ?? "—"}`,
        `  平台费 ${JSON.stringify(f.values)} · 费率生效 ${f.effectiveFrom}`,
      ].join("\n");
    });
    return {
      content: [
        {
          type: "text" as const,
          text: `Margin OS 支持 ${feeData.length} 个市场组合：\n\n${lines.join("\n\n")}\n\n数据来源：${[...new Set(feeData.map((f) => f.source))].join(" | ")}`,
        },
      ],
    };
  },
);

// ============================================================================
// 工具 2：查询单个市场的默认值（费率/汇率/税）
// ============================================================================

server.registerTool(
  "get_market_defaults",
  {
    description:
      "查询某国家×平台的默认费率、汇率、税种与示例售价。用于回答「泰国 TikTok Shop 佣金多少」「美国站汇率多少」这类问题，也可在调用 calculate_profit 前确认参数。",
    inputSchema: z.object({
      country: z
        .enum(["TH", "VN", "MY", "US"])
        .describe("国家代码：TH 泰国 / VN 越南 / MY 马来西亚 / US 美国"),
      platform: z
        .enum(["tiktok-shop", "shopee", "amazon"])
        .describe("平台：tiktok-shop / shopee / amazon"),
    }),
  },
  async ({ country, platform }) => {
    const c = getCountry(country as CountryCode);
    const p = getPlatform(platform as PlatformId);
    const fees = getPlatformFees(platform as PlatformId, country as CountryCode);
    if (!fees) {
      return {
        content: [
          {
            type: "text" as const,
            text: `${c.name} × ${p.name} 暂无费率数据。该国家可用平台：${getPlatformsForCountry(country as CountryCode).join(", ")}`,
          },
        ],
      };
    }
    const text = [
      `${c.flag} ${c.name} × ${p.name}`,
      `币种：${c.currency} (${c.currencySymbol})，默认汇率 1 CNY = ${c.defaultRate} ${c.currency}`,
      `税：${c.taxName ?? "VAT"} ${c.vat}%${c.taxNote ? `（${c.taxNote}）` : ""}`,
      `关税：${c.dutyNote ?? "按品类"}`,
      `平台费目：${JSON.stringify(fees.values)}`,
      `费目定义：${p.feeFields.map((f) => `${f.labelZh}(${f.key}, ${f.unit === "percent" ? "%" : c.currencySymbol}${f.formula === "per-order" ? "/单" : ""})`).join("、")}`,
      `费率生效：${fees.effectiveFrom}`,
      `来源：${fees.source}`,
      fees.notes ? `备注：${fees.notes}` : "",
      `示例售价：${c.currencySymbol}${c.samplePrice ?? "—"}`,
    ]
      .filter(Boolean)
      .join("\n");
    return { content: [{ type: "text" as const, text }] };
  },
);

// ============================================================================
// 工具 3：核心——计算利润（agent 只需传少量参数）
// ============================================================================

const CalcInput = z.object({
  country: z
    .enum(["TH", "VN", "MY", "US"])
    .describe("国家代码。用户说「泰国/越南/马来/美国」时对应转换"),
  platform: z
    .enum(["tiktok-shop", "shopee", "amazon"])
    .describe("平台。用户说「TikTok/虾皮/亚马逊」时对应转换"),
  price: z.number().positive().describe("商品售价（目标国币种）。必填"),
  purchaseCost: z
    .number()
    .nonnegative()
    .optional()
    .describe("采购成本（人民币）。不填用默认 25 元"),
  weightGrams: z
    .number()
    .nonnegative()
    .optional()
    .describe("商品重量（克），用于按重量推导国际物流。不填用默认 350g"),
  shippingRatePerKg: z
    .number()
    .nonnegative()
    .optional()
    .describe("国际物流单价（人民币/kg）。不填用默认 22 元/kg"),
  cpa: z
    .number()
    .nonnegative()
    .optional()
    .describe("单件广告获客成本（目标国币种）。不填用默认 30"),
  influencerCommissionRate: z
    .number()
    .nonnegative()
    .optional()
    .describe("达人佣金百分比。不填用默认 10%"),
  rate: z
    .number()
    .positive()
    .optional()
    .describe("自定义汇率（1 CNY = ? 目标币种）。不填用该国家默认汇率"),
  vatIncluded: z
    .boolean()
    .optional()
    .describe("售价是否已含税。默认 false（税作为成本扣减）"),
  note: z.string().optional().describe("可选备注，会原样带回结果，便于 agent 对照"),
});

server.registerTool(
  "calculate_profit",
  {
    description:
      "计算单件商品的真实利润、利润率、ROI、成本拆解。核心工具：agent 只需传国家、平台、售价，其余费率/汇率/税自动从数据层取。用户说「我在泰国 TikTok Shop 卖 299 铢，采购 25 元，帮我算利润」时调这个。",
    inputSchema: CalcInput,
  },
  async (params) => {
    const country = getCountry(params.country as CountryCode);
    const platform = getPlatform(params.platform as PlatformId);

    // 从数据层生成默认输入（费率/汇率/税/示例价全部自动填好）
    let input: ProfitInput = applyCountryDefaults(
      DEFAULT_INPUT,
      country,
      params.platform as PlatformId,
    );

    // 覆盖 agent 显式传入的业务参数
    const overrides: Partial<ProfitInput> = { price: params.price };
    if (params.purchaseCost !== undefined) overrides.purchaseCost = params.purchaseCost;
    if (params.weightGrams !== undefined) overrides.weightGrams = params.weightGrams;
    if (params.shippingRatePerKg !== undefined)
      overrides.shippingRatePerKg = params.shippingRatePerKg;
    if (params.cpa !== undefined) overrides.cpa = params.cpa;
    if (params.influencerCommissionRate !== undefined)
      overrides.influencerCommissionRate = params.influencerCommissionRate;
    if (params.rate !== undefined) overrides.rate = params.rate;
    if (params.vatIncluded !== undefined) overrides.vatIncluded = params.vatIncluded;
    input = { ...input, ...overrides };

    const r = calculateProfit(input);
    const sym = country.currencySymbol;
    const fmt = (n: number) => `${sym}${n.toFixed(2)}`;
    const b = r.breakdown;

    const lines = [
      `【${country.flag} ${country.name} × ${platform.name}｜售价 ${fmt(r.price)}】`,
      `净利润：${fmt(r.netProfit)}（${r.profitMargin.toFixed(1)}%）`,
      `ROI：${r.roi.toFixed(1)}%　健康度：${r.health}`,
      `总成本：${fmt(r.totalCost)}（不含广告 ${fmt(r.totalCostExclAd)}）`,
      ``,
      `成本拆解（${sym}）：`,
      `  商品成本 ${fmt(b.productCost)}（含汇率换算）`,
      `  平台费用 ${fmt(b.platformFee)}`,
      `  达人费用 ${fmt(b.influencerFee)}`,
      `  广告费用 ${fmt(b.adCost)}`,
      `  物流损耗 ${fmt(b.logisticsLoss)}`,
      `  税务成本 ${fmt(b.taxCost)}（${country.taxName ?? "VAT"} ${input.vatRate}%）`,
      `  收款成本 ${fmt(b.receivingCost)}`,
      `  仓储成本 ${fmt(b.warehouseCost)}`,
      `  团队成本 ${fmt(b.teamCost)}`,
      ``,
      `保本售价：${fmt(r.breakEvenPrice)}　保本CPA：${fmt(r.breakEvenCPA)}　保本ROAS：${r.breakEvenROAS.toFixed(2)}x`,
      `买家应付：${fmt(r.buyerTotalCost)}`,
      ``,
      `使用参数：汇率 1 CNY = ${input.rate} ${country.currency}；平台费 ${JSON.stringify(input.platformFeeValues ?? {})}；采购成本 ¥${input.purchaseCost}；重量 ${input.weightGrams}g × ¥${input.shippingRatePerKg}/kg`,
      params.note ? `备注：${params.note}` : "",
    ].filter(Boolean);

    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
      structuredContent: {
        country: params.country,
        platform: params.platform,
        currency: country.currency,
        price: r.price,
        netProfit: r.netProfit,
        profitMargin: r.profitMargin,
        roi: r.roi,
        totalCost: r.totalCost,
        breakEvenPrice: r.breakEvenPrice,
        breakEvenCPA: r.breakEvenCPA,
        breakEvenROAS: r.breakEvenROAS,
        health: r.health,
        breakdown: b,
      },
    };
  },
);

// ============================================================================
// 工具 4：反推建议售价（目标利润 / 目标利润率）
// ============================================================================

server.registerTool(
  "suggest_price",
  {
    description:
      "根据目标净利润或目标利润率，反推建议售价。用户说「我要每单净赚 100 铢，该卖多少钱」或「我要 30% 利润率」时调这个。国家/平台/成本参数同 calculate_profit。",
    inputSchema: CalcInput.extend({
      targetProfit: z
        .number()
        .positive()
        .optional()
        .describe("目标净利润（目标国币种）。与 targetMargin 二选一"),
      targetMargin: z
        .number()
        .positive()
        .optional()
        .describe("目标利润率（百分比，如 30 表示 30%）。与 targetProfit 二选一"),
    }),
  },
  async (params) => {
    const country = getCountry(params.country as CountryCode);
    let input: ProfitInput = applyCountryDefaults(
      DEFAULT_INPUT,
      country,
      params.platform as PlatformId,
    );
    const overrides: Partial<ProfitInput> = { price: params.price };
    if (params.purchaseCost !== undefined) overrides.purchaseCost = params.purchaseCost;
    if (params.weightGrams !== undefined) overrides.weightGrams = params.weightGrams;
    if (params.shippingRatePerKg !== undefined)
      overrides.shippingRatePerKg = params.shippingRatePerKg;
    if (params.cpa !== undefined) overrides.cpa = params.cpa;
    if (params.influencerCommissionRate !== undefined)
      overrides.influencerCommissionRate = params.influencerCommissionRate;
    if (params.rate !== undefined) overrides.rate = params.rate;
    if (params.targetProfit !== undefined) {
      overrides.targetPricingMode = "profit";
      overrides.targetProfit = params.targetProfit;
    } else if (params.targetMargin !== undefined) {
      overrides.targetPricingMode = "margin";
      overrides.targetMargin = params.targetMargin;
    }
    input = { ...input, ...overrides };

    const r = calculateProfit(input);
    const sym = country.currencySymbol;
    if (r.suggestedPrice <= 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: `在当前成本结构下目标不可达（总费率超 100% 或成本过高）。建议提高售价或降低成本。当前保本售价 ${sym}${r.breakEvenPrice.toFixed(2)}。`,
          },
        ],
      };
    }
    // 用建议售价重新计算，验证反推结果（不能直接拿原售价的 r.netProfit，会误导）
    const atSuggested = calculateProfit({ ...input, price: r.suggestedPrice });
    const lines = [
      `建议售价：${sym}${r.suggestedPrice.toFixed(2)}`,
      params.targetProfit
        ? `对应目标净利润 ${sym}${params.targetProfit}`
        : `对应目标利润率 ${params.targetMargin}%`,
      `该售价下预估净利润 ${sym}${atSuggested.netProfit.toFixed(2)}（${atSuggested.profitMargin.toFixed(1)}%）`,
      `参考：保本售价 ${sym}${r.breakEvenPrice.toFixed(2)}`,
    ];
    return {
      content: [{ type: "text" as const, text: lines.join("\n") }],
      structuredContent: {
        suggestedPrice: r.suggestedPrice,
        netProfitAtSuggestedPrice: atSuggested.netProfit,
        profitMarginAtSuggestedPrice: atSuggested.profitMargin,
        breakEvenPrice: r.breakEvenPrice,
        currency: country.currency,
      },
    };
  },
);

// ============================================================================
// 工具 5：批量对比（同成本在不同市场卖，哪个更赚）
// ============================================================================

server.registerTool(
  "compare_markets",
  {
    description:
      "把同一款商品放到多个市场对比净利润。用户说「这个货在泰国、越南、马来哪个平台卖更赚」时调这个。传入市场列表，返回各市场净利润排名。",
    inputSchema: z.object({
      price: z.number().positive().describe("基础售价（各市场本币；若各市场售价不同，请用 pricesByMarket 逐个指定）"),
      markets: z
        .array(
          z.object({
            country: z.enum(["TH", "VN", "MY", "US"]),
            platform: z.enum(["tiktok-shop", "shopee", "amazon"]),
            price: z.number().positive().optional().describe("该市场售价，不填则用上面的 price"),
          }),
        )
        .min(2)
        .describe("要对比的市场列表，至少 2 个"),
      purchaseCost: z.number().nonnegative().optional().describe("采购成本（人民币），默认 25"),
      weightGrams: z.number().nonnegative().optional().describe("重量（克），默认 350"),
    }),
  },
  async (params) => {
    const rows = params.markets.map((m) => {
      const country = getCountry(m.country as CountryCode);
      let input = applyCountryDefaults(DEFAULT_INPUT, country, m.platform as PlatformId);
      const overrides: Partial<ProfitInput> = {
        price: m.price ?? params.price,
        purchaseCost: params.purchaseCost ?? DEFAULT_INPUT.purchaseCost,
        weightGrams: params.weightGrams ?? DEFAULT_INPUT.weightGrams,
      };
      input = { ...input, ...overrides };
      const r = calculateProfit(input);
      return {
        market: `${country.flag} ${country.name} × ${getPlatform(m.platform).name}`,
        currency: country.currency,
        currencySymbol: country.currencySymbol,
        netProfit: r.netProfit,
        profitMargin: r.profitMargin,
        roi: r.roi,
        netProfitCNY: r.netProfit / input.rate,
      };
    });
    const ranked = [...rows].sort((a, b) => b.netProfitCNY - a.netProfitCNY);
    const lines = ranked.map(
      (r, i) =>
        `${i + 1}. ${r.market}：净利 ${r.currencySymbol}${r.netProfit.toFixed(2)}（约 ¥${r.netProfitCNY.toFixed(2)}，利润率 ${r.profitMargin.toFixed(1)}%）`,
    );
    return {
      content: [
        {
          type: "text" as const,
          text: `市场对比（按人民币净利润排名）：\n\n${lines.join("\n")}\n\n注：各市场汇率与费率取数据层默认值，实际以卖家中心为准。`,
        },
      ],
      structuredContent: { ranked },
    };
  },
);

// ============================================================================
// 工具 6：单变量试算（售价-利润曲线 / 敏感性分析）
// ============================================================================

server.registerTool(
  "simulate_prices",
  {
    description:
      "在给定售价区间内试算多个价格点的净利润，帮助用户找最优定价。用户说「卖 199/249/299 哪个划算」时调这个。",
    inputSchema: z.object({
      country: z.enum(["TH", "VN", "MY", "US"]),
      platform: z.enum(["tiktok-shop", "shopee", "amazon"]),
      prices: z.array(z.number().positive()).min(1).describe("要试算的售价列表"),
      purchaseCost: z.number().nonnegative().optional(),
      weightGrams: z.number().nonnegative().optional(),
    }),
  },
  async (params) => {
    const country = getCountry(params.country as CountryCode);
    let input: ProfitInput = applyCountryDefaults(
      DEFAULT_INPUT,
      country,
      params.platform as PlatformId,
    );
    if (params.purchaseCost !== undefined) input.purchaseCost = params.purchaseCost;
    if (params.weightGrams !== undefined) input.weightGrams = params.weightGrams;
    const sym = country.currencySymbol;
    const rows = params.prices.map((price) => {
      const profit = calculateProfitAtPrice(input, price);
      const r = calculateProfit({ ...input, price });
      return { price, netProfit: profit, profitMargin: r.profitMargin };
    });
    const lines = rows.map(
      (r) => `${sym}${r.price} → 净利 ${sym}${r.netProfit.toFixed(2)}（${r.profitMargin.toFixed(1)}%）`,
    );
    return {
      content: [{ type: "text" as const, text: `试算结果：\n\n${lines.join("\n")}` }],
      structuredContent: { rows },
    };
  },
);

// ============================================================================
// 启动
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio 协议下 stdout 只能输出协议消息，日志走 stderr
  console.error("Margin OS MCP Server v1.0.0 ready (stdio)");
}

main().catch((err) => {
  console.error("MCP server failed:", err);
  process.exit(1);
});
