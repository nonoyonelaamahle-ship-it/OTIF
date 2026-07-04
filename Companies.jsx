const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Link } from "react-router-dom";
import { Plus, Search, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import CompanyForm from "../components/companies/CompanyForm";

export default function Companies() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => db.entities.Delivery.list("-promised_date", 500),
  });

  const createMutation = useMutation({
    mutationFn: (data) => db.entities.Company.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["companies"] }); setShowForm(false); },
  });

  const filtered = companies.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  const getOtif = (companyId) => {
    const cd = deliveries.filter(d => d.company_id === companyId);
    if (!cd.length) return null;
    return (cd.filter(d => d.is_otif).length / cd.length) * 100;
  };

  const typeColors = {
    supplier: "bg-blue-50 text-blue-700",
    customer: "bg-purple-50 text-purple-700",
    both: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage suppliers and track their OTIF performance</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Company
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search companies..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-40 bg-card rounded-xl border border-border animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Building2 className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No companies yet</p>
          <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>Add your first company</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(company => {
            const otif = getOtif(company.id);
            const isGood = otif !== null && otif >= (company.target_otif ?? 95);
            const cd = deliveries.filter(d => d.company_id === company.id);
            return (
              <Link
                key={company.id}
                to={`/companies/${company.id}`}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-lg hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {company.name?.[0]?.toUpperCase()}
                  </div>
                  {company.type && (
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", typeColors[company.type])}>
                      {company.type}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold group-hover:text-primary transition-colors mb-0.5">{company.name}</h3>
                <p className="text-xs text-muted-foreground">{company.industry || "—"}</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">OTIF Score</p>
                    <p className={cn(
                      "text-2xl font-bold",
                      otif === null ? "text-muted-foreground" : isGood ? "text-green-600" : "text-red-500"
                    )}>
                      {otif !== null ? `${otif.toFixed(1)}%` : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{cd.length} deliveries</p>
                    <p className="text-xs text-muted-foreground">Target: {company.target_otif ?? 95}%</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Company</DialogTitle>
          </DialogHeader>
          <CompanyForm
            onSubmit={data => createMutation.mutate(data)}
            onCancel={() => setShowForm(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}