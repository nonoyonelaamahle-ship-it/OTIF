import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function computeOtif({ promised_date, actual_date, ordered_quantity, delivered_quantity }) {
  const is_on_time = actual_date && promised_date ? actual_date <= promised_date : false;
  const is_in_full = ordered_quantity && delivered_quantity
    ? Number(delivered_quantity) >= Number(ordered_quantity)
    : false;
  return { is_on_time, is_in_full, is_otif: is_on_time && is_in_full };
}

export default function DeliveryForm({ delivery, companies, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    company_id: delivery?.company_id || "",
    company_name: delivery?.company_name || "",
    order_number: delivery?.order_number || "",
    product: delivery?.product || "",
    promised_date: delivery?.promised_date || "",
    actual_date: delivery?.actual_date || "",
    ordered_quantity: delivery?.ordered_quantity ?? "",
    delivered_quantity: delivery?.delivered_quantity ?? "",
    notes: delivery?.notes || "",
  });

  const handleCompanyChange = (id) => {
    const co = companies.find(c => c.id === id);
    setForm(f => ({ ...f, company_id: id, company_name: co?.name || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otif = computeOtif(form);
    const payload = {
      ...form,
      ordered_quantity: form.ordered_quantity !== "" ? Number(form.ordered_quantity) : undefined,
      delivered_quantity: form.delivered_quantity !== "" ? Number(form.delivered_quantity) : undefined,
      ...otif,
    };
    onSubmit(payload);
  };

  const preview = computeOtif(form);
  const hasPreview = form.actual_date || form.delivered_quantity;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Company *</Label>
          <Select value={form.company_id} onValueChange={handleCompanyChange} required>
            <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
            <SelectContent>
              {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Order Number</Label>
          <Input placeholder="PO-001" value={form.order_number} onChange={e => setForm({ ...form, order_number: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Product / Description</Label>
          <Input placeholder="e.g. Steel bolts" value={form.product} onChange={e => setForm({ ...form, product: e.target.value })} />
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
          <Input type="number" min={0} placeholder="100" value={form.ordered_quantity} onChange={e => setForm({ ...form, ordered_quantity: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-1">
          <Label>Delivered Qty</Label>
          <Input type="number" min={0} placeholder="100" value={form.delivered_quantity} onChange={e => setForm({ ...form, delivered_quantity: e.target.value })} />
        </div>
      </div>

      {hasPreview && (
        <div className="flex gap-2 items-center p-3 rounded-lg bg-muted text-sm">
          <span className="text-muted-foreground text-xs font-medium mr-1">AUTO-CALC:</span>
          <StatusPill value={preview.is_on_time} label="On Time" />
          <StatusPill value={preview.is_in_full} label="In Full" />
          <StatusPill value={preview.is_otif} label="OTIF" bold />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Notes</Label>
        <Textarea rows={2} placeholder="Optional..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isLoading || !form.company_id || !form.promised_date}>
          {delivery ? "Update Delivery" : "Log Delivery"}
        </Button>
      </div>
    </form>
  );
}

function StatusPill({ value, label, bold }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-${bold ? "bold" : "medium"} ${value ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
      {value ? "✓" : "✗"} {label}
    </span>
  );
}