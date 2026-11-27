# Margin OS MCP Server

让 AI agent 直接调用 Margin OS 的利润计算引擎——**不用人工在网页里手填数值**。

## 它解决什么

以前：打开网页 → 选国家 → 选平台 → 填售价 → 填采购成本 → 填重量 → 填费率 → 填汇率 → 看结果。

现在：跟 agent 说一句「我在泰国 TikTok Shop 卖 299 铢，采购 25 块，重 350 克，帮我算利润」，agent 调 MCP 工具，费率/汇率/税全部由数据层自动补齐。

## 关键设计

- **agent 只传业务参数**（国家、平台、售价、成本），费率/汇率/税/VAT 从 `lib/countries` + `lib/fees` 自动取，不重复造轮子
- **stdio 传输**：零部署、零 API Key、零模型成本——智能在 agent 那一层，本 server 只做确定性的计算
- **复用网页同一套引擎**：调的是 `lib/profit-engine` 的 `calculateProfit()`，和网页算出来的数完全一致

## 安装依赖

安装 Node.js 20 或以上版本，在项目目录运行 `npm ci`。其中会安装：
- `@modelcontextprotocol/server` — MCP server SDK v2
- `@modelcontextprotocol/client` — 仅冒烟测试用
- `tsx` — 直接跑 TypeScript，无需编译

## 接入配置（以 WorkBuddy / Claude Code / Cursor 为例）

在 MCP 配置文件（`~/.workbuddy-ai/mcp.json` 或对应客户端的 mcp 配置）里加：

```json
{
  "mcpServers": {
    "margin-os": {
      "command": "node",
      "args": [
        "node_modules/tsx/dist/cli.mjs",
        "mcp/server.ts"
      ],
      "cwd": "/absolute/path/to/profit-os"
    }
  }
}
```

> 将 `cwd` 改成你的项目绝对路径。Windows 可以写 `D:/projects/profit-os`。如果客户端找不到 `node`，在 `command` 使用 `node.exe` 的绝对路径。

配好后重启 agent，让它列一下工具，应该看到 6 个。

## 工具清单

| 工具 | 作用 | agent 什么时候用 |
|---|---|---|
| `list_markets` | 列出所有国家×平台组合及默认费率 | 用户没说清市场时，先确认可选范围 |
| `get_market_defaults` | 查某市场的费率/汇率/税/费目定义 | 回答「泰国佣金多少」这类问题 |
| `calculate_profit` | **核心**：算净利润、利润率、ROI、成本拆解 | 用户报了售价和成本，要算利润 |
| `suggest_price` | 反推建议售价（按目标利润或利润率） | 「我要每单净赚 100 铢，卖多少」 |
| `compare_markets` | 同款商品多市场对比，按人民币净利排名 | 「泰国和越南哪个更赚」 |
| `simulate_prices` | 多个价格点试算 | 「卖 199/249/299 哪个划算」 |

## 参数约定

`calculate_profit` / `suggest_price` 的最小必填只有三个：

- `country`: `TH` / `VN` / `MY` / `US`
- `platform`: `tiktok-shop` / `shopee` / `amazon`
- `price`: 售价（目标国币种）

可选：`purchaseCost`（人民币）、`weightGrams`、`shippingRatePerKg`、`cpa`、`influencerCommissionRate`、`rate`（自定义汇率）、`vatIncluded`。

不填的字段走 `lib/schema.ts` 的 DEFAULT_INPUT + 国家默认值——和网页默认参数一致。

## 验证

```bash
npm run mcp:smoke
```

用真实 MCP client 通过 stdio 启动 server，逐个调用 6 个工具并打印结果。改完 server 后跑一遍确认没坏。

## 注意事项

- stdio 协议的 stdout 只能输出协议消息，server 的日志走 stderr
- 费率数据带来源与生效日期，但平台会调价——结果用于快速估算，实际以卖家中心为准
- zod 3.25 会有一条 `~standard.jsonSchema` 告警，是 SDK 用旧版 fallback，不影响功能；升级 zod 到 4.2+ 可消除
