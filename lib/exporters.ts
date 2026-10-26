import type { BatchResult } from "./types";

// 所有重型库（xlsx / jspdf / html-to-image）均动态 import，
// 不进入首屏包，保证 Lighthouse 性能。

/** 批量结果导出为 Excel（动态加载 xlsx），净利润/利润率/ROI 带红绿条件格式 */
export async function exportBatchExcel(rows: BatchResult[], filename = "测品结果.xlsx") {
  const XLSX = await import("xlsx");
  const data = rows.map((r) => ({
    SKU: r.sku,
    名称: r.name,
    采购成本: r.purchaseCost,
    物流成本: r.logisticsCost,
    售价: r.price,
    CPA: r.cpa,
    达人佣金率: r.influencerCommissionRate,
    商品成本THB: r.productCostTHB,
    净利润: r.netProfit,
    利润率: r.profitMargin,
    ROI: r.roi,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const GREEN = { fill: { fgColor: { rgb: "C6EFCE" } }, font: { color: { rgb: "006100" } } };
  const RED = { fill: { fgColor: { rgb: "FFC7CE" } }, font: { color: { rgb: "9C0006" } } };
  const range = XLSX.utils.decode_range(ws["!ref"] as string);
  // 数据行（跳过表头）：I=净利润 J=利润率 K=ROI
  for (let r = range.s.r + 1; r <= range.e.r; r++) {
    const net = ws[`I${r + 1}`];
    const margin = ws[`J${r + 1}`];
    const roi = ws[`K${r + 1}`];
    if (net) net.s = (net.v as number) >= 0 ? GREEN : RED;
    if (margin) margin.s = (margin.v as number) >= 0 ? GREEN : RED;
    if (roi) roi.s = (roi.v as number) >= 0 ? GREEN : RED;
  }
  ws["!cols"] = [
    { wch: 10 }, { wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 8 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 10 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "测品结果");
  XLSX.writeFile(wb, filename);
}

/** 下载 Excel 批测模板 */
export async function downloadBatchTemplate() {
  const XLSX = await import("xlsx");
  const tpl = [
    { SKU: "PET-001", 名称: "示例商品", 采购成本: 25, 物流成本: 20, 售价: 299, CPA: 30, 达人佣金率: 10 },
  ];
  const ws = XLSX.utils.json_to_sheet(tpl);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "模板");
  XLSX.writeFile(wb, "batch-template.xlsx");
}

/** 解析上传的 Excel 为批测行（动态加载 xlsx） */
export async function parseBatchExcel(file: File): Promise<
  {
    sku: string;
    name: string;
    purchaseCost: number;
    logisticsCost: number;
    price: number;
    cpa: number;
    influencerCommissionRate: number;
  }[]
> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
  return json.map((r) => ({
    sku: String(r.SKU ?? r.sku ?? ""),
    name: String(r.名称 ?? r.name ?? ""),
    purchaseCost: Number(r.采购成本 ?? r.purchaseCost ?? 0),
    logisticsCost: Number(r.物流成本 ?? r.logisticsCost ?? 0),
    price: Number(r.售价 ?? r.price ?? 0),
    cpa: Number(r.CPA ?? r.cpa ?? 0),
    influencerCommissionRate: Number(r.达人佣金率 ?? r.influencerCommissionRate ?? 0),
  }));
}

/** 节点导出为 PNG（动态加载 html-to-image） */
export async function exportPNG(node: HTMLElement, filename = "profit-os.png") {
  const { toPng } = await import("html-to-image");
  const bg = getComputedStyle(document.body).backgroundColor;
  const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: bg });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

/** 节点导出为 PDF（动态加载 html-to-image + jspdf） */
export async function exportPDF(node: HTMLElement, filename = "profit-os.pdf") {
  const { toPng } = await import("html-to-image");
  const { jsPDF } = await import("jspdf");
  const bg = getComputedStyle(document.body).backgroundColor;
  const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: bg });
  const img = new Image();
  img.src = dataUrl;
  await new Promise<void>((res) => {
    img.onload = () => res();
  });
  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = (img.height / img.width) * pw;
  pdf.addImage(dataUrl, "PNG", 0, 0, pw, ph);
  pdf.save(filename);
}
