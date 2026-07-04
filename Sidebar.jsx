import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Truck, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/deliveries", label: "Deliveries", icon: Truck },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-primary text-primary-foreground flex flex-col z-40 transition-all duration-300",
      collapsed ? "w-[68px]" : "w-[220px]"
    )}>
      <div className="flex items-center gap-3 px-4 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
          <Truck className="w-4 h-4 text-white" />
        </div>
        {!collapsed && <span className="font-bold tracking-tight whitespace-nowrap">OTIF Tracker</span>}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-0.5">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/10 text-white/40 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}