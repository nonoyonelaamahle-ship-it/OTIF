const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import CompanyForm from "../components/companies/CompanyForm";
import OtifGauge from "../components/dashboard/OtifGauge";
import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyDetail() {
  const { id: companyId } = useParams();
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: companies = [], isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
  });

  const { data: deliveries = [] } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => db.entities.Delivery.list("-promised_date", 500),
  });

  const company = companies.find(c => c.id === companyId);
  const cd = deliveries.filter(d => d.company_id === companyId);
  const total = cd.length;
  const otifC = cd.filter(d => d.is_otif).length;
  const otPct = total > 0 ? (cd.filter(d => d.is_on_time).length / total) * 100 : 0;
  const ifPct = total > 0 ? (cd.filter(d => d.is_in_full).length / total) * 100 : 0;
  const otifPct = total > 0 ? (otifC / total) * 100 : 0;

  const updateMutation = useMutation({
    mutationFn: (data) => db.entities.Company.update(companyId, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["companies"] }); setEditing(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: () => db.entities.Company.delete(companyId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["companies"] }); navigate("/companies"); },
  });

  if (isLoading) {
    return <div className="p-6 space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-64 rounded-xl" /></div>;
  }

  if (!company) {
    return (
      <div className="p-6 text-center py-20">
        <p className="text-muted-foreground">Company not found</p>
        <Link to="/companies"><Button variant="outline" className="mt-4">Back</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-5xl">
      <div className="flex items-center gap-2">
        <Link to="/companies">
          <Button variant="ghost" size="icon" className="shrink-0"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.industry || "—"} · {company.type}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="shrink-0">
          <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="icon" className="text-destructive hover:text-destructive shrink-0">
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {company.name}?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 flex flex-col items-center gap-4">
          <OtifGauge percentage={otifPct} label="OTIF Score" size="lg" />
          <div className="flex gap-8">
            <OtifGauge percentage={otPct} label="On-Time" size="sm" />
            <OtifGauge percentage={ifPct} label="In-Full" size="sm" />
          </div>
          <p className="text-xs text-muted-foreground">Target: {company.target_otif ?? 95}%</p>
        </div>

        <div className="md:col-span-2 bg-card rounded-xl border border-border p-6">
          <h2 className="font-semibold mb-4">Overview</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-muted-foreground text-xs">Contact Email</p><p className="font-medium mt-0.5">{company.contact_email || "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Type</p><p className="font-medium mt-0.5 capitalize">{company.type || "—"}</p></div>
            <div><p className="text-muted-foreground text-xs">Total Deliveries</p><p className="font-medium mt-0.5">{total}</p></div>
            <div><p className="text-muted-foreground text-xs">OTIF Deliveries</p><p className="font-medium mt-0.5">{otifC} / {total}</p></div>
            <div><p className="text-muted-foreground text-xs">Target OTIF</p><p className="font-medium mt-0.5">{company.target_otif ?? 95}%</p></div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <p className={cn("font-bold mt-0.5", otifPct >= (company.target_otif ?? 95) ? "text-green-600" : "text-red-500")}>
                {total === 0 ? "No data" : otifPct >= (company.target_otif ?? 95) ? "On target" : "Below target"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Delivery History ({total})</h2>
        {cd.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No deliveries recorded for this company</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Order #</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Promised</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">Actual</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">On-Time</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">In-Full</th>
                  <th className="text-left pb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wide">OTIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cd.map(d => (
                  <tr key={d.id} className="hover:bg-muted/30">
                    <td className="py-3 font-medium">{d.order_number || "—"}</td>
                    <td className="py-3 text-muted-foreground">{d.product || "—"}</td>
                    <td className="py-3">{d.promised_date ? format(parseISO(d.promised_date), "MMM d, yyyy") : "—"}</td>
                    <td className="py-3">{d.actual_date ? format(parseISO(d.actual_date), "MMM d, yyyy") : "—"}</td>
                    <td className="py-3">
                      {d.is_on_time ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                    <td className="py-3">
                      {d.is_in_full ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-400" />}
                    </td>
                    <td className="py-3">
                      <Badge className={cn("text-xs font-bold", d.is_otif ? "bg-green-500 text-white" : "bg-red-500 text-white")}>
                        {d.is_otif ? "OTIF" : "MISS"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Company</DialogTitle></DialogHeader>
          <CompanyForm
            company={company}
            onSubmit={data => updateMutation.mutate(data)}
            onCancel={() => setEditing(false)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}