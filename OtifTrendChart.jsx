import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { parseISO } from "date-fns";

export default function OtifTrendChart({ deliveries }) {
  const monthlyData = {};
  deliveries.forEach(d => {
    if (!d.promised_date) return;
    const month = d.promised_date.substring(0, 7);
    if (!monthlyData[month]) monthlyData[month] = { total: 0, otif: 0, onTime: 0, inFull: 0 };
    monthlyData[month].total++;
    if (d.is_on_time) monthlyData[month].onTime++;
    if (d.is_in_full) monthlyData[month].inFull++;
    if (d.is_otif) monthlyData[month].otif++;
  });

  const data = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, s]) => ({
      month: new Date(month + "-01").toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      OTIF: s.total > 0 ? parseFloat(((s.otif / s.total) * 100).toFixed(1)) : 0,
      "On-Time": s.total > 0 ? parseFloat(((s.onTime / s.total) * 100).toFixed(1)) : 0,
      "In-Full": s.total > 0 ? parseFloat(((s.inFull / s.total) * 100).toFixed(1)) : 0,
    }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        No delivery data available yet
      </div>