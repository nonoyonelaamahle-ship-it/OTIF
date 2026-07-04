import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Link } from "react-router-dom";

function scoreColor(pct) {
  if (pct >= 95) return { text: "text-green-600", bg: "bg-green-100", bar: "bg-green-500" };
  if (pct >= 85) return { text: "text-blue-600", bg: "bg-blue-100", bar: "bg-blue-500" };
  if (pct >= 75) return { text: "text-amber-600", bg: "bg-amber-100", bar: "bg-amber-500" };
  return { text: "text-red-600", bg: "bg-red-100", bar: "bg-red-500" };
}

function SupplierRow({ rank, company, isTop }) {
  const colors = scoreColor(company.otif);
  return (
    <Link
      to={`/companies/${company.id}`}
      className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors group"
    >
      <span className={cn("text-xs font-bold w-5 text-center shrink-0", isTop ? "text-green-600" : "text-red-500")}>
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{company.name}</p>
        <div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", colors.bar)}
            style={{ width: `${company.otif}%` }}
          />
        </div>
      </div>
      <span className={cn("text-sm font-bold tabular-nums px-2 py-0.5 rounded-md shrink-0", colors.bg, colors.text)}>
        {company.otif.toFixed(1)}%
      </span>
    </Link>
  );
}

export default function SupplierRankList({ companies, deliveries }) {
  const scores = companies.map(c => {
    const cd = deliveries.filter(d => d.company_id === c.id);
    if (!cd.length) return null;
    const otif = (cd.filter(d => d.is_otif).length / cd.length) * 100;
    return { ...c, otif, total: cd.length };
  }).filter(Boolean).sort((a, b) => b.otif - a.otif);

  if (scores.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No supplier data yet</p>;
  }

  const top = scores.slice(0, 3);
  const bottom = scores.slice(-3).reverse();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-xs font-semibold text-green-600 uppercase tracking-wide">Top Performers</span>
        </div>
        <div className="space-y-0.5">
          {top.map((c, i) => <SupplierRow key={c.id} rank={i + 1} company={c} isTop={true} />)}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Needs Attention</span>
        </div>
        <div className="space-y-0.5">
          {bottom.map((c, i) => <SupplierRow key={c.id} rank={scores.length - i} company={c} isTop={false} />)}
        </div>
      </div>
    </div>
  );
}