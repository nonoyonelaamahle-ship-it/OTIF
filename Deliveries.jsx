const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useState, useMemo } from "react";
import { Plus, Truck, X, Search, CheckCircle2, XCircle, List, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { OtifBadge, OtifMainBadge } from "@/components/ui/otif-badge";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { computeOtifFlags } from "@/lib/otif";
import DeliveryCalendar from "@/components/deliveries/DeliveryCalendar";

const EMPTY = { company_id: "", company_name: "", order_number: "", product: "", promised_date: "", actual_date: "", ordered_quantity: "", delivered_quantity: "", notes: "" };

export default function Deliveries() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterOtif, setFilterOtif] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => db.entities.Delivery.list("-promised_date", 500),
  });
  const { data: companies = [] } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
  });

  const createMutation = useMutation({
    mutationFn: d => db.entities.Delivery.create(d),
    onSuccess: () => { qc.invalidateQueries(["deliveries"]); close(); },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, d }) => db.entities.Delivery.update(id, d),
    onSuccess: () => { qc.invalidateQueries(["deliveries"]); close(); },
  });
  const deleteMutation = useMutation({
    mutationFn: id => db.entities.Delivery.delete(id),
    onSuccess: () => qc.invalidateQueries(["deliveries"]),
  });

  const close = () => { setShowForm(false); setEditing(null); setForm(EMPTY); };

  const openEdit = d => {
    setEditing(d);
    setForm({
      company_id: d.company_id, company_name: d.company_name,
      order_number: d.order_number || "", product: d.product || "",
      promised_date: d.promised_date || "", actual_date: d.actual_date || "",
      ordered_quantity: d.ordered_quantity ?? "", delivered_quantity: d.delivered_quantity ?? "",
      notes: d.notes || "",
    });
    setShowForm(true);
  };

  const handleCompany = id => {
    const c = companies.find(c => c.id === id);
    setForm(f => ({ ...f, company_id: id, company_name: c?.name || "" }));
  };

  const preview = useMemo(() => computeOtifFlags(form.promised_date, form.actual_date, form.ordered_quantity, form.delivered_quantity), [form]);

  const handleSubmit = e => {
    e.preventDefault();
    const payload = {
      ...form,
      ordered_quantity: form.ordered_quantity !== "" ? Number(form.ordered_quantity) : undefined,
      delivered_quantity: form.delivered_quantity !== "" ? Number(form.delivered_quantity) : undefined,
      ...computeOtifFlags(form.promised_date, form.actual_date, form.ordered_quantity, form.delivered_quantity),
    };
    if (editing) updateMutation.mutate({ id: editing.id, d: payload });
    else createMutation.mutate(payload);
  };

  const filtered = useMemo(() => deliveries.filter(d => {
    const s = search.toLowerCase();
    const ms = !s || d.company_name?.toLowerCase().includes(s) || d.order_number?.toLowerCase().includes(s) || d.product?.toLowerCase().includes(s);
    const mc = filterCompany === "all" || d.company_id === filterCompany;
    const mo = filterOtif === "all" || (filterOtif === "otif" && d.is_otif) || (filterOtif === "fail" && !d.is_otif);
    return ms && mc && mo;
  }), [deliveries, search, filterCompany, filterOtif]);

  const hasPreview = form.actual_date || (form.ordered_quantity && form.delivered_quantity);

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Deliveries</h1>
          <p className="text-muted-foreground text-sm mt-1">Log and review delivery performance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors", viewMode === "list" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
            >
              <List className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={cn("px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors border-l border-border", viewMode === "calendar" ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted")}
            >
              <CalendarDays className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>
          <Button onClick={() => { close(); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" /> Log Delivery
          </Button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold">{editing ? "Edit Delivery" : "Log New Delivery"}</h2>
            <button onClick={close}><X className="w-4 h-4 text-muted-foreground" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Company *</Label>
              <Select value={form.company_id} onValueChange={handleCompany}>
                <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                <SelectContent>
                  {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Order Number</Label>
              <Input value={form.order_number} onChange={e => setForm({ ...form, order_number: e.target.value })} placeholder="PO-001" />
            </div>
            <div className="space-y-1.5">
              <Label>Product</Label>
              <Input value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} placeholder="Product name" />
            </div>
            <div className="space-y-1.5">
              <Label>Promised Date *</Label>
              <Input type="date" value={form.promised_date} onChange={e => setForm({ ...form, promised_date: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label>Actual Delivery Date</Label>
              <Input type="date" value={form.actual_date} onChange={e => setForm({ ...form, actual_date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Ordered Qty</Label>
              <Input type="number" min={0} value={form.ordered_quantity} onChange={e => setForm({ ...form, ordered_quantity: e.target.value })} placeholder="100" />
            </div>
            <div className="space-y-1.5">
              <Label>Delivered Qty</Label>
              <Input type="number" min={0} value={form.delivered_quantity} onChange={e => setForm({ ...form, delivered_quantity: e.target.value })} placeholder="100" />
            </div>
            {hasPreview && (
              <div className="md:col-span-3 flex items-center gap-2 py-1">
                <span className="text-xs text-muted-foreground font-medium mr-1">Preview:</span>
                <OtifBadge value={preview.is_on_time} label="On Time" />
                <OtifBadge value={preview.is_in_full} label="In Full" />
                <OtifMainBadge value={preview.is_otif} />
              </div>
            )}
            <div className="md:col-span-3 space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Optional notes…" />
            </div>
            <div className="md:col-span-3 flex gap-3 justify-end pt-1">
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="submit" disabled={!form.company_id || createMutation.isPending || updateMutation.isPending}>
                {editing ? "Update" : "Log Delivery"}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-44"><SelectValue placeholder="All companies" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterOtif} onValueChange={setFilterOtif}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="otif">OTIF ✓</SelectItem>
            <SelectItem value="fail">Failed ✗</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {viewMode === "calendar" ? (
        <DeliveryCalendar deliveries={deliveries} />
      ) : isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i=><div key={i} className="h-14 bg-muted rounded-xl animate-pulse"/>)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center gap-3 text-muted-foreground">
          <Truck className="w-10 h-10 opacity-30" />
          <p className="text-sm">No deliveries found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {["Company", "Order #", "Product", "Promised", "Actual", "Qty", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium">{d.company_name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.order_number || "—"}</td>
                    <td className="px-4 py-3">{d.product || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.promised_date ? format(parseISO(d.promised_date), "MMM d, yy") : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.actual_date ? format(parseISO(d.actual_date), "MMM d, yy") : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{d.delivered_quantity ?? "—"}/{d.ordered_quantity ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <OtifBadge value={d.is_on_time} label="OT" />
                        <OtifBadge value={d.is_in_full} label="IF" />
                        <OtifMainBadge value={d.is_otif} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={() => openEdit(d)}>
                          <span className="text-xs">✏️</span>
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive/60 hover:text-destructive" onClick={() => deleteMutation.mutate(d.id)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            {filtered.length} of {deliveries.length} deliveries
          </div>
        </div>
      )}
    </div>
  );
}