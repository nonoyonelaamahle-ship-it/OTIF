import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

function getGrade(pct) {
  if (pct >= 95) return { label: "A", color: "text-green-600", bg: "bg-green-50 border-green-200" };
  if (pct >= 85) return { label: "B", color: "text-blue-600", bg: "bg-blue-50 border-blue-200" };
  if (pct >= 75) return { label: "C", color: "text-amber-600", bg: "bg-amber-50 border-amber-200" };
  return { label: "D", color: "text-red-600", bg: "bg-red-50 border-red-200" };
}

export default function SupplierScorecard({ companies, deliveries }) {
  const scores = companies.map(c => {
    const cd = deliveries.filter(d => d.company_id === c.id);
    const total = cd.length;
    if (total === 0) return null;
    const otif = (cd.filter(d => d.is_otif).length / total) * 100;
    const onTime = (cd.filter(d => d.is_on_time).length / total) * 100;
    const inFull = (cd.filter(d => d.is_in_full).length / total) * 100;
    const target = c.target_otif ?? 95;
    const diff = otif - target;
    return { ...c, total, otif, onTime, inFull, target, diff };
  }).filter(Boolean).sort((a, b) => b.otif - a.otif);

  if (scores.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-6">No supplier data yet</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">