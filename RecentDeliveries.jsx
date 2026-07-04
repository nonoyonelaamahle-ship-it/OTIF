import { CheckCircle2, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export default function RecentDeliveries({ deliveries }) {
  const sorted = [...deliveries]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 6);

  if (sorted.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No recent deliveries</p>;
  }

  return (
    <div className="space-y-2">
      {sorted.map(d => (
        <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
          <div className={cn("p-1.5 rounded-lg shrink-0", d.is_otif ? "bg-green-50" : "bg-red-50")}>
            {d.is_otif
              ? <CheckCircle2 className="w-4 h-4 text-green-600" />
              : <XCircle className="w-4 h-4 text-red-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{d.company_name}</p>
            <p className="text-xs text-muted-foreground">{d.order_number || "No ref"} · {d.product || "—"}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={cn("text-xs font-bold", d.is_otif ? "text-green-600" : "text-red-500")}>
              {d.is_otif ? "OTIF" : "MISS"}
            </p>