import { HEALTH_META } from "@/lib/pricing-engine";
import { Badge } from "@/components/ui/badge";
import type { HealthLevel } from "@/lib/types";

export function HealthBanner({ health }: { health: HealthLevel }) {
  const { tone, label, desc } = HEALTH_META[health];
  return (
    <div className="flex items-center gap-2.5 border-t border-border px-4 py-3">
      <Badge className="shrink-0" variant={tone}>{label}</Badge>
      <span className="text-xs leading-relaxed text-muted-foreground">{desc}</span>
    </div>
  );
}
