const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import { Truck, Building2, CheckCircle2, AlertTriangle } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import OtifGauge from "../components/dashboard/OtifGauge";
import OtifTrendChart from "../components/dashboard/OtifTrendChart";
import CompanyLeaderboard from "../components/dashboard/CompanyLeaderboard";
import RecentDeliveries from "../components/dashboard/RecentDeliveries";
import SupplierScorecard from "../components/dashboard/SupplierScorecard";
import SupplierRankList from "../components/dashboard/SupplierRankList";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: companies = [], isLoading: lc } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
  });

  const { data: deliveries = [], isLoading: ld } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => db.entities.Delivery.list("-promised_date", 500),
  });

  const isLoading = lc || ld;

  const total = deliveries.length;
  const otifCount = deliveries.filter(d => d.is_otif).length;
  const onTimeCount = deliveries.filter(d => d.is_on_time).length;
  const inFullCount = deliveries.filter(d => d.is_in_full).length;
  const otifPct = total > 0 ? (otifCount / total) * 100 : 0;
  const onTimePct = total > 0 ? (onTimeCount / total) * 100 : 0;
  const inFullPct = total > 0 ? (inFullCount / total) * 100 : 0;

  const atRisk = companies.filter(c => {
    const cd = deliveries.filter(d => d.company_id === c.id);
    if (!cd.length) return false;
    const pct = (cd.filter(d => d.is_otif).length / cd.length) * 100;
    return pct < (c.target_otif ?? 95);
  }).length;

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 md:p-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor your supply chain OTIF performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Deliveries" value={total} icon={Truck} subtitle="All time" accent="blue" />
        <StatCard title="OTIF Rate" value={`${otifPct.toFixed(1)}%`} icon={CheckCircle2} subtitle={`${otifCount} / ${total} deliveries`} accent="green" />
        <StatCard title="Companies" value={companies.length} icon={Building2} subtitle="Tracked suppliers" accent="amber" />
        <StatCard title="At Risk" value={atRisk} icon={AlertTriangle} subtitle="Below OTIF target" accent="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold mb-4">OTIF Trend (Monthly)</h2>
          <OtifTrendChart deliveries={deliveries} />
        </div>
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center justify-center gap-4">
          <h2 className="text-base font-semibold self-start">Overall Score</h2>
          <OtifGauge percentage={otifPct} label="OTIF" size="lg" />
          <div className="flex gap-8 mt-2">
            <OtifGauge percentage={onTimePct} label="On-Time" size="sm" />
            <OtifGauge percentage={inFullPct} label="In-Full" size="sm" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold mb-4">Company Leaderboard</h2>
          <CompanyLeaderboard companies={companies} deliveries={deliveries} />
        </div>
        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-base font-semibold mb-4">Recent Deliveries</h2>
          <RecentDeliveries deliveries={deliveries} />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold mb-4">Supplier Rankings</h2>
        <SupplierRankList companies={companies} deliveries={deliveries} />
      </div>

      <div className="hidden lg:block bg-card rounded-xl border border-border p-6">
        <h2 className="text-base font-semibold mb-4">Supplier Scorecard</h2>
        <SupplierScorecard companies={companies} deliveries={deliveries} />
      </div>
    </div>
  );
}