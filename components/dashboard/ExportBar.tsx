"use client";

import * as React from "react";
import { Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { exportPNG, exportPDF } from "@/lib/exporters";

export function ExportBar({ targetRef }: { targetRef: React.RefObject<HTMLDivElement> }) {
  const [busy, setBusy] = React.useState<null | "png" | "pdf">(null);

  const run = async (kind: "png" | "pdf") => {
    if (!targetRef.current) return;
    setBusy(kind);
    try {
      if (kind === "png") await exportPNG(targetRef.current);
      else await exportPDF(targetRef.current);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => run("png")} disabled={busy !== null}>
        <Image className="h-4 w-4" />
        {busy === "png" ? "导出中" : "PNG"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => run("pdf")} disabled={busy !== null}>
        <FileText className="h-4 w-4" />
        {busy === "pdf" ? "导出中" : "PDF"}
      </Button>
    </div>
  );
}
