"use client";

import { GripVertical } from "lucide-react";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { ProductCostModule } from "./ProductCostModule";
import { SalesModule } from "./SalesModule";
import { PlatformFeeModule } from "./PlatformFeeModule";
import { InfluencerModule } from "./InfluencerModule";
import { AdModule } from "./AdModule";
import { LogisticsModule } from "./LogisticsModule";
import { TaxModule } from "./TaxModule";
import { ReceivingModule } from "./ReceivingModule";
import { WarehouseModule } from "./WarehouseModule";
import { TeamModule } from "./TeamModule";
import { TargetPriceModule } from "./TargetPriceModule";
import { ModuleSortHandleContext } from "./ModuleCard";
import { useModuleSorting } from "./useModuleSorting";

const modules: Record<string, ComponentType> = {
  sales: SalesModule,
  product: ProductCostModule,
  platform: PlatformFeeModule,
  influencer: InfluencerModule,
  ads: AdModule,
  logistics: LogisticsModule,
  tax: TaxModule,
  target: TargetPriceModule,
  receiving: ReceivingModule,
  warehouse: WarehouseModule,
  team: TeamModule,
};

const defaultOrder = Object.keys(modules);

export function CalculatorModules() {
  const sorting = useModuleSorting(defaultOrder);
  const { preview } = sorting;

  return (
    <ModuleSortHandleContext.Provider value={{
      onPointerDown: sorting.onHandlePointerDown,
      onKeyDown: sorting.onHandleKeyDown,
    }}>
      <div
        ref={sorting.list}
        onPointerMove={sorting.onPointerMove}
        onPointerUp={sorting.onPointerUp}
        onPointerCancel={sorting.onPointerCancel}
        onLostPointerCapture={sorting.onPointerCancel}
        className="grid grid-cols-1 gap-4 xl:block xl:columns-2 xl:[&>*]:mb-4 xl:[&>*]:break-inside-avoid"
      >
        {sorting.order.map((id) => {
          const Module = modules[id];
          const drop = preview?.drop?.id === id ? preview.drop : null;
          return (
            <div key={id} data-module-id={id} className={cn("relative min-w-0 empty:hidden", preview?.id === id && "opacity-40")}>
              <Module />
              {drop ? (
                <span
                  aria-hidden="true"
                  className={cn("pointer-events-none absolute inset-x-0 h-0.5 rounded-full bg-primary", drop.after ? "-bottom-2" : "-top-2")}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      <span className="sr-only" role="status">{sorting.announcement}</span>
      {preview ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-full items-center gap-2 rounded-lg border border-primary/35 bg-card px-3 py-2 text-sm font-medium text-foreground shadow-md"
          style={{ left: preview.x, top: preview.y - 8 }}
        >
          <GripVertical className="h-4 w-4 text-primary" />
          {preview.title}
        </div>
      ) : null}
    </ModuleSortHandleContext.Provider>
  );
}
