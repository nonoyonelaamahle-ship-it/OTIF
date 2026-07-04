import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CompanyForm({ company, onSubmit, onCancel, isLoading }) {
  const [form, setForm] = useState({
    name: company?.name || "",
    type: company?.type || "supplier",
    industry: company?.industry || "",
    contact_email: company?.contact_email || "",
    target_otif: company?.target_otif ?? 95,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Company Name *</Label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Acme Corp" required />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={form.type} onValueChange={v => setForm({...form, type: v})}>