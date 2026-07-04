const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from "@tanstack/react-query";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import jsPDF from "jspdf";
import { useState } from "react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Reports() {
  const { data: companies = [], isLoading: lc } = useQuery({
    queryKey: ["companies"],
    queryFn: () => db.entities.Company.list(),
  });

  const { data: deliveries = [], isLoading: ld } = useQuery({
    queryKey: ["deliveries"],
    queryFn: () => db.entities.Delivery.list("-promised_date", 500),
  });

  const isLoading = lc || ld;

  const [filterIndustry, setFilterIndustry] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const industries = [...new Set(companies.map(c => c.industry).filter(Boolean))].sort();