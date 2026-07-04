import { cn } from "@/lib/utils";

export default function StatCard({ title, value, subtitle, icon: Icon, accent = "blue" }) {
  const accentMap = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };
  return (
    <div className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-2.5 rounded-lg", accentMap[accent])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}