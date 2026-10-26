"use client";

import { useInputStore } from "@/store/useInputStore";
import { CATEGORIES } from "@/lib/categories";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CategorySelect() {
  const category = useInputStore((s) => s.data.category);
  const applyCategory = useInputStore((s) => s.applyCategory);
  const desc = CATEGORIES.find((c) => c.id === category)?.desc ?? "";

  return (
    <div className="space-y-1.5">
      <Label>品类模板</Label>
      <Select value={category} onValueChange={(v) => applyCategory(v)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </div>
  );
}
