import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function CompanyLeaderboard({ companies, deliveries }) {
  const stats = companies.map(c => {
    const cd = deliveries.filter(d => d.company_id === c.id);
    const total = cd.length;
    const otif = cd.filter(d => d.is_otif).length;
    const pct = total > 0 ? (otif / total) * 100 : null;
    return { ...c, total, pct };
  }).filter(c => c.total > 0).sort((a, b) => (b.pct ?? 0) - (a.pct ?? 0));

  if (stats.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No delivery data yet</p>;
  }

  return (
    <div className="space-y-2">
      {stats.slice(0, 8).map((company, idx) => (
        <Link
          key={company.id}
          to={`/companies/${company.id}`}
          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
        >
          <span className="text-sm font-bold text-muted-foreground w-5 shrink-0">{idx + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{company.name}</p>
            <p className="text-xs text-muted-foreground">{company.total} deliveries</p>
          </div>
          {company.pct !== null && (
            <span className={cn(
              "text-sm font-bold tabular-nums",
              company.pct >= 95 ? "text-green-600" : company.pct >= 80 ? "text-amber-500" : "text-red-500"
            )}>
              {company.pct.toFixed(1)}%
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}