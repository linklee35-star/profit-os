"use client";

import { Wallet } from "lucide-react";
import { ModuleCard } from "./ModuleCard";
import { NumberField } from "./NumberField";
import { Button } from "@/components/ui/button";
import { useInputStore } from "@/store/useInputStore";

// 收款平台常见费率预设（提现 + 平台手续费，单位 %）
const PRESETS: Record<string, { withdrawFeeRate: number; platformFeeRate: number }> = {
  PingPong: { withdrawFeeRate: 0.5, platformFeeRate: 1.0 },
  Payoneer: { withdrawFeeRate: 1.0, platformFeeRate: 1.2 },
  LianLian: { withdrawFeeRate: 0.3, platformFeeRate: 0.8 },
};

export function ReceivingModule() {
  const setField = useInputStore((s) => s.setField);

  return (
    <ModuleCard
      title="收款"
      description="提现 / 收款平台手续费，及汇率损耗"
      icon={<Wallet className="h-4 w-4" />}
    >
      <div className="sm:col-span-2 flex flex-wrap gap-2">
        {Object.entries(PRESETS).map(([name, p]) => (
          <Button
            key={name}
            variant="outline"
            size="sm"
            onClick={() => {
              setField("withdrawFeeRate", p.withdrawFeeRate);
              setField("platformFeeRate", p.platformFeeRate);
            }}
          >
            {name}
          </Button>
        ))}
        <span className="self-center text-xs text-muted-foreground">一键填入预设</span>
      </div>
      <NumberField field="withdrawFeeRate" label="提现手续费" suffix="%" />
      <NumberField field="platformFeeRate" label="收款平台手续费" suffix="%" />
      <NumberField field="fxLossRate" label="汇率损耗" suffix="%" advanced />
    </ModuleCard>
  );
}
