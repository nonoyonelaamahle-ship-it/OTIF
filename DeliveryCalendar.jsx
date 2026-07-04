import { useMemo, useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, isToday, isPast, addMonths, subMonths } from "date-fns";
import { ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function getStatusColor(deliveries) {
  if (!deliveries.length) return null;
  const anyPending = deliveries.some(d => !d.actual_date);
  if (!anyPending) return "bg-green-500";
  const allPending = deliveries.every(d => !d.actual_date);
  return allPending ? "bg-amber-400" : "bg-blue-400";
}

export default function DeliveryCalendar({ deliveries }) {
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState(null);

  // Group deliveries by promised_date
  const byDate = useMemo(() => {
    const map = {};
    deliveries.forEach(d => {
      if (!d.promised_date) return;
      const key = d.promised_date.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(d);
    });
    return map;
  }, [deliveries]);

  const monthStart = startOfMonth(current);
  const monthEnd = endOfMonth(current);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let day = gridStart;
  while (day <= gridEnd) {
    days.push(day);
    day = addDays(day, 1);
  }

  const selectedKey = selected ? format(selected, "yyyy-MM-dd") : null;
  const selectedDeliveries = selectedKey ? (byDate[selectedKey] || []) : [];

  return (
    <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h2 className="font-semibold text-base">{format(current, "MMMM yyyy")}</h2>
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCurrent(subMonths(current, 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setCurrent(new Date())}>
            Today
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setCurrent(addMonths(current, 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 border-b border-border">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
          <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((d, i) => {
          const key = format(d, "yyyy-MM-dd");
          const items = byDate[key] || [];
          const inMonth = isSameMonth(d, current);
          const isSelected = selected && isSameDay(d, selected);
          const today = isToday(d);
          const isPastDay = isPast(d) && !today;
          const pending = items.filter(x => !x.actual_date);
          const hasPendingPast = isPastDay && pending.length > 0;

          return (
            <button
              key={i}
              onClick={() => setSelected(isSelected ? null : d)}
              className={cn(
                "min-h-[72px] p-1.5 text-left border-b border-r border-border/50 transition-colors relative",
                !inMonth && "opacity-35",
                isSelected && "bg-primary/5 ring-1 ring-inset ring-primary",
                !isSelected && "hover:bg-muted/40",
                i % 7 === 6 && "border-r-0"
              )}
            >
              <span className={cn(
                "text-xs font-medium inline-flex items-center justify-center w-6 h-6 rounded-full",
                today && "bg-primary text-primary-foreground",
                !today && "text-foreground"
              )}>
                {format(d, "d")}
              </span>

              {hasPendingPast && (
                <AlertTriangle className="absolute top-1.5 right-1.5 w-3 h-3 text-amber-500" />
              )}

              <div className="mt-1 space-y-0.5">
                {items.slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium",
                      item.actual_date
                        ? "bg-green-100 text-green-800"
                        : isPastDay
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-800"
                    )}
                  >
                    {item.company_name}
                  </div>
                ))}
                {items.length > 3 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{items.length - 3} more</div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 px-5 py-3 border-t border-border bg-muted/20 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300 inline-block" />Upcoming</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />Overdue (no delivery logged)</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-300 inline-block" />Delivered</span>
      </div>

      {/* Selected day detail */}
      {selected && selectedDeliveries.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <h3 className="text-sm font-semibold mb-3">{format(selected, "EEEE, MMMM d")} — {selectedDeliveries.length} delivery{selectedDeliveries.length !== 1 ? "s" : ""}</h3>
          <div className="space-y-2">
            {selectedDeliveries.map(d => (
              <div key={d.id} className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg bg-muted/30">
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{d.company_name}</span>
                  {d.order_number && <span className="text-muted-foreground ml-2 text-xs">#{d.order_number}</span>}
                  {d.product && <span className="text-muted-foreground ml-1 text-xs">· {d.product}</span>}
                </div>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full shrink-0",
                  d.actual_date ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {d.actual_date ? "Delivered" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && selectedDeliveries.length === 0 && (
        <div className="border-t border-border px-5 py-4 text-sm text-muted-foreground">
          No deliveries on {format(selected, "MMMM d")}.
        </div>
      )}
    </div>
  );
}