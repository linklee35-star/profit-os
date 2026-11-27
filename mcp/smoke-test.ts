/**
 * MCP Server 端到端冒烟测试
 *
 * 用真实 MCP client 通过 stdio 启动 server，列出工具并逐个调用，
 * 验证 agent 接入后拿到的是可用结果而不是报错。
 *
 * 运行：npx tsx mcp/smoke-test.ts
 */

import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

const client = new Client({ name: "margin-os-smoke-test", version: "1.0.0" });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: ["node_modules/tsx/dist/cli.mjs", "mcp/server.ts"],
  cwd: process.cwd(),
  stderr: "inherit",
});

async function show(name: string, args: Record<string, unknown>) {
  const result = await client.callTool({ name, arguments: args });
  console.log(`\n--- ${name} (${JSON.stringify(args)}) ---`);
  if (result.isError) {
    console.log("ERROR:", JSON.stringify(result.content));
    return;
  }
  for (const block of result.content) {
    if (block.type === "text") console.log(block.text);
  }
  if (result.structuredContent) {
    console.log("[structured]", JSON.stringify(result.structuredContent).slice(0, 300));
  }
}

async function main() {
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    console.log("工具列表：", tools.map((t) => t.name).join(", "));

    await show("list_markets", {});
    await show("get_market_defaults", { country: "TH", platform: "tiktok-shop" });
    await show("calculate_profit", {
      country: "TH",
      platform: "tiktok-shop",
      price: 299,
      purchaseCost: 25,
      note: "冒烟测试",
    });
    await show("calculate_profit", {
      country: "US",
      platform: "amazon",
      price: 29.9,
      purchaseCost: 25,
    });
    await show("suggest_price", {
      country: "TH",
      platform: "tiktok-shop",
      price: 299,
      targetProfit: 100,
    });
    await show("compare_markets", {
      price: 299,
      markets: [
        { country: "TH", platform: "tiktok-shop" },
        { country: "VN", platform: "shopee" },
        { country: "US", platform: "amazon", price: 29.9 },
      ],
    });
    await show("simulate_prices", {
      country: "TH",
      platform: "tiktok-shop",
      prices: [199, 249, 299],
    });
    console.log("\n✅ 全部工具调用完成");
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error("smoke test failed:", err);
  process.exit(1);
});
