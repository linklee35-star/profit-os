"use client";

import { useInputStore } from "@/store/useInputStore";
import { CATEGORY_GROUPS, DEFAULT_CATEGORY, getCategory } from "@/lib/categories";
import { formatMoney } from "@/lib/format";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategorySelect() {
  const category = getCategory(useInputStore((s) => s.data.category));
  const logisticsMode = useInputStore((s) => s.data.logisticsMode);
  const applyCategory = useInputStore((s) => s.applyCategory);
  const sample = category.sample;

  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor="category-template">品类模板</Label>
      <Select value={category.id} onValueChange={applyCategory}>
        <SelectTrigger id="category-template" aria-describedby="category-template-description" className="w-[200px] max-w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start" className="max-h-[min(24rem,var(--radix-select-content-available-height))]">
          <SelectItem value={DEFAULT_CATEGORY.id}>{DEFAULT_CATEGORY.name}</SelectItem>
          {CATEGORY_GROUPS.map((group) => (
            <SelectGroup key={group.name}>
              <SelectLabel className="px-2 pb-1 pt-2 text-xs font-medium text-muted-foreground">
                {group.name}
              </SelectLabel>
              {group.templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
      <p id="category-template-description" className="text-xs text-muted-foreground">
        {sample
          ? `${category.desc}。示例重量 ${sample.weightGrams} g，包装 ${formatMoney(sample.packagingCost, "¥")}。`
          : "按商品类型预填示例重量和包装成本。"}
        {sample && logisticsMode === "manual" ? " 当前国际运费按手动金额计算。" : null}
      </p>
    </div>
  );
}
