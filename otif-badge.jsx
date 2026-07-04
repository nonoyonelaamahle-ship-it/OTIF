import { cn } from "@/lib/utils";

export function OtifBadge({ value, label }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold",
      value ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
    )}>
      {value ? "✓" : "✗"} {label}
    </span>
  );
}

export function OtifMainBadge({ value }) {
  return (
    <span className={cn(
      "inline-flex items-center text-xs px-2.5 py-0.5 rounded-full font-bold",
      value ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
    )}>
      {value ? "OTIF" : "FAIL"}
    </span>
  );
}