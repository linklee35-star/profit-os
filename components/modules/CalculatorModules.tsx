"use client";

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

export function CalculatorModules() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ProductCostModule />
      <SalesModule />
      <PlatformFeeModule />
      <InfluencerModule />
      <AdModule />
      <LogisticsModule />
      <TaxModule />
      <TargetPriceModule />
      <ReceivingModule />
      <WarehouseModule />
      <TeamModule />
    </div>
  );
}
