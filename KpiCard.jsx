import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ title, value, subtitle, trend, icon: Icon, color = 'emerald', large = false }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-500', text: 'text-emerald-600', border: 'border-emerald-100' },
    navy: { bg: 'bg-blue-50', iconBg: 'bg-blue-900', text: 'text-blue-900', border: 'border-blue-100' },
    amber: { bg: 'bg-amber-50', iconBg: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', iconBg: 'bg-red-500', text: 'text-red-600', border: 'border-red-100' },
  };
  const c = colorMap[color] || colorMap.emerald;

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-500' : 'text-muted-foreground';

  return (
    <div className={cn('bg-card rounded-2xl border border-border p-6 flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow', large && 'col-span-2')}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className={cn('mt-2 font-bold text-foreground', large ? 'text-5xl' : 'text-3xl')}>{value}</p>
        </div>
        {Icon && (
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', c.iconBg)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {trend !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}