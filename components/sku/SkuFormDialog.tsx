"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const skuSchema = z.object({
  sku: z.string().min(1, "SKU 必填"),
  name: z.string().min(1, "产品名称必填"),
  purchaseCost: z.coerce.number().min(0, "≥ 0"),
  domesticShipping: z.coerce.number().min(0, "≥ 0"),
  packagingCost: z.coerce.number().min(0, "≥ 0"),
  intlShipping: z.coerce.number().min(0, "≥ 0"),
  otherCost: z.coerce.number().min(0, "≥ 0"),
  price: z.coerce.number().min(0, "≥ 0"),
  cpa: z.coerce.number().min(0, "≥ 0"),
  influencerCommissionRate: z.coerce.number().min(0, "≥ 0"),
  note: z.string().optional().default(""),
});

export type SkuFormValues = z.infer<typeof skuSchema>;

interface SkuFormDialogProps {
  open: boolean;
  initial?: Partial<SkuFormValues> | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SkuFormValues) => void;
}

export function SkuFormDialog({ open, initial, onOpenChange, onSubmit }: SkuFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SkuFormValues>({
    resolver: zodResolver(skuSchema),
    defaultValues: {
      sku: "",
      name: "",
      purchaseCost: 0,
      domesticShipping: 0,
      packagingCost: 0,
      intlShipping: 0,
      otherCost: 0,
      price: 0,
      cpa: 0,
      influencerCommissionRate: 0,
      note: "",
      ...initial,
    },
  });

  React.useEffect(() => {
    if (open)
      reset({
        sku: "",
        name: "",
        purchaseCost: 0,
        domesticShipping: 0,
        packagingCost: 0,
        intlShipping: 0,
        otherCost: 0,
        price: 0,
        cpa: 0,
        influencerCommissionRate: 0,
        note: "",
        ...initial,
      });
  }, [open, initial, reset]);

  const numFields: (keyof SkuFormValues)[] = [
    "purchaseCost",
    "domesticShipping",
    "packagingCost",
    "intlShipping",
    "otherCost",
    "price",
    "cpa",
    "influencerCommissionRate",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial?.sku ? "编辑 SKU" : "新增 SKU"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sku">SKU</Label>
              <Input id="sku" {...register("sku")} />
              {errors.sku ? <p className="text-xs text-[hsl(var(--danger))]">{errors.sku.message}</p> : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="name">产品名称</Label>
              <Input id="name" {...register("name")} />
              {errors.name ? <p className="text-xs text-[hsl(var(--danger))]">{errors.name.message}</p> : null}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {numFields.map((f) => (
              <div key={f} className="space-y-1.5">
                <Label htmlFor={f}>
                  {f === "purchaseCost"
                    ? "采购成本"
                    : f === "domesticShipping"
                      ? "国内运费"
                      : f === "packagingCost"
                        ? "包装成本"
                        : f === "intlShipping"
                          ? "国际物流"
                          : f === "otherCost"
                            ? "其它成本"
                            : f === "price"
                              ? "售价"
                              : f === "cpa"
                                ? "CPA"
                                : "达人佣金%"}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">¥</span>
                </Label>
                <Input id={f} type="number" step={0.1} min={0} {...register(f)} />
                {errors[f] ? <p className="text-xs text-[hsl(var(--danger))]">{errors[f]?.message}</p> : null}
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">备注</Label>
            <Input id="note" {...register("note")} />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                取消
              </Button>
            </DialogClose>
            <Button type="submit">保存</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
