const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import { useQuery } from '@tanstack/react-query';

import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { format, subDays, subMonths, startOfMonth, endOfMonth, parseISO, isWithinInterval } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [range, setRange] = useState('90');

  const { data: deliveries = [] } = useQuery({
    queryKey: ['deliveries'],
    queryFn: () => db.entities.Delivery.list('-promised_date', 1000),
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['companies'],
    queryFn: () => db.entities.Company.list(),
  });

  const filtered = useMemo(() => {
    const days = Number(range);
    const from = subDays(new Date(), days);
    return deliveries.filter(d => {
      if (!d.promised_date) return false;
      return parseISO(d.promised_date) >= from;
    });
  }, [deliveries, range]);

  // Monthly OTIF breakdown
  const monthlyData = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      if (!d.promised_date) return;
      const month = format(parseISO(d.promised_date), 'MMM yy');
      if (!map[month]) map[month] = { month, total: 0, otif: 0, onTime: 0, inFull: 0 };
      map[month].total++;
      if (d.is_otif) map[month].otif++;
      if (d.is_on_time) map[month].onTime++;
      if (d.is_in_full) map[month].inFull++;
    });
    return Object.values(map).map(m => ({
      ...m,
      'OTIF %': m.total ? Math.round((m.otif / m.total) * 100) : 0,
      'On Time %': m.total ? Math.round((m.onTime / m.total) * 100) : 0,
      'In Full %': m.total ? Math.round((m.inFull / m.total) * 100) : 0,
    }));
  }, [filtered]);

  // Company breakdown
  const companyData = useMemo(() => {
    const map = {};
    filtered.forEach(d => {
      if (!map[d.company_name]) map[d.company_name] = { name: d.company_name, total: 0, otif: 0 };
      map[d.company_name].total++;
      if (d.is_otif) map[d.company_name].otif++;
    });
    return Object.values(map).map(c => ({
      ...c,
      'OTIF %': c.total ? Math.round((c.otif / c.total) * 100) : 0,
    })).sort((a, b) => b['OTIF %'] - a['OTIF %']);
  }, [filtered]);

  // Pie: pass/fail
  const pieData = useMemo(() => {
    const otif = filtered.filter(d => d.is_otif).length;
    const fail = filtered.length - otif;
    return [
      { name: 'OTIF', value: otif },
      { name: 'Failed', value: fail },
    ];
  }, [filtered]);

  // Failure reason breakdown
  const failData = useMemo(() => {
    const late = filtered.filter(d => !d.is_on_time && d.is_in_full).length;
    const shortShip = filtered.filter(d => d.is_on_time && !d.is_in_full).length;
    const both = filtered.filter(d => !d.is_on_time && !d.is_in_full).length;
    return [
      { name: 'Late Only', value: late },
      { name: 'Short Ship Only', value: shortShip },
      { name: 'Late + Short', value: both },
    ].filter(d => d.value > 0);
  }, [filtered]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground text-sm mt-1">Deep-dive into OTIF performance</p>
        </div>
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pass/Fail Pie + Failure reasons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">OTIF Pass / Fail</h2>
          {pieData.reduce((a, d) => a + d.value, 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={i === 0 ? '#10b981' : '#ef4444'} />)}
                </Pie>
                <Legend />
                <Tooltip formatter={(v) => [`${v} deliveries`]} />
              </PieChart>
            </ResponsiveContainer>
          ) : <EmptyChart />}
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-sm font-semibold mb-4">Failure Reasons</h2>
          {failData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={failData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                <Bar dataKey="value" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <EmptyChart message="No failures in this period 🎉" />}
        </div>
      </div>

      {/* Monthly trend */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold mb-4">Monthly Performance</h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
              <Legend />
              <Line type="monotone" dataKey="OTIF %" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="On Time %" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="In Full %" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </div>

      {/* Company ranking */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-sm font-semibold mb-4">Company OTIF Ranking</h2>
        {companyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={Math.max(220, companyData.length * 40)}>
            <BarChart layout="vertical" data={companyData} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip formatter={(v) => [`${v}%`, 'OTIF']} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
              <Bar dataKey="OTIF %" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <EmptyChart />}
      </div>
    </div>
  );
}

function EmptyChart({ message = 'No data in this period.' }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">{message}</div>
  );
}