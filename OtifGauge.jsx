import { cn } from "@/lib/utils";

export default function OtifGauge({ percentage = 0, label, size = "lg" }) {
  const radius = size === "lg" ? 80 : 50;
  const stroke = size === "lg" ? 12 : 8;
  const circumference = 2 * Math.PI * radius;
  const progress = ((Math.min(Math.max(percentage, 0), 100)) / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  const color = percentage >= 95 ? "#10b981" : percentage >= 80 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle cx={radius + stroke} cy={radius + stroke} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
          <circle
            cx={radius + stroke} cy={radius + stroke} r={radius}
            fill="none" stroke={color} strokeWidth={stroke}
            strokeDasharray={circumference} strokeDashoffset={circumference - progress}
            strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold tracking-tight", size === "lg" ? "text-3xl" : "text-xl")} style={{ color }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
      {label && <p className="text-xs font-medium text-muted-foreground">{label}</p>}
    </div>
  );
}