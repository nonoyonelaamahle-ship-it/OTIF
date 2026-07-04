import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Building2, Truck, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/companies", label: "Companies", icon: Building2 },
  { path: "/deliveries", label: "Deliveries", icon: Truck },
  { path: "/reports", label: "Reports", icon: BarChart3 },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex justify-around py-2 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}