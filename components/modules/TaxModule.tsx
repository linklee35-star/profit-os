"use client";

import { useInputStore } from "@/store/useInputStore";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DUTY_PRESETS } from "@/lib/types";
import type { DutyCategory } from "@/lib/types";
import { Receipt } from "lucide-react";

export function TaxModule() {
  const data = useInputStore((s) => s.data);
  const setField = useInputStore((s) => s.setField);

  return (
    <ModuleCard
      title="税务与关税"
      description="VAT 7% + 进口关税（2026年起取消免税额度）"
      icon={<Receipt className="h-4 w-4" />}
      advanced
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">售价含税</Label>
          <p className="text-[11px] text-muted-foreground">含税则 VAT 为价内税不重复扣减</p>
        </div>
        <Switch
          checked={data.vatIncluded}
          onCheckedChange={(v) => setField("vatIncluded", v)}
        />
      </div>

      <NumberField field="vatRate" label="VAT" suffix="%" hint="泰国 VAT 7%" />

      {/* ======== 进口关税 ======== */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label className="text-sm">进口关税</Label>
          <p className="text-[11px] text-muted-foreground">
            {data.dutyEnabled ? "已启用 · 买家承担" : "未启用"}
          </p>
        </div>
        <Switch
          checked={data.dutyEnabled}
          onCheckedChange={(v) => setField("dutyEnabled", v)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm">关税品类</Label>
        <Select
          value={data.dutyCategory}
          onValueChange={(v) => {
            setField("dutyCategory", v as DutyCategory);
            const preset = DUTY_PRESETS.find((p) => p.id === v);
            if (preset && v !== "custom") {
              setField("dutyRate", preset.rate);
            }
          }}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DUTY_PRESETS.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}（{p.rate}%）
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          {DUTY_PRESETS.find((p) => p.id === data.dutyCategory)?.desc}
        </p>
      </div>

      {data.dutyCategory === "custom" ? (
        <NumberField field="dutyRate" label="关税税率" suffix="%" />
      ) : null}

      <NumberField field="customsFee" label="清关费" suffix="฿" hint="固定清关费" />
      <NumberField field="taxServiceFee" label="税务服务费" suffix="฿" hint="税务代理/代缴" />
    </ModuleCard>
  );
}
