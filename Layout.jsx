import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Building2, Truck, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Companies', path: '/companies', icon: Building2 },
  { label: 'Deliveries', path: '/deliveries', icon: Truck },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
];

export default function Layout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-primary text-primary-foreground shrink-0">
        <div className="px-6 py-7 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">OTIFtrack</span>
          </div>
          <p className="text-xs text-white/40 mt-1">On Time, In Full</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ label, path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                location.pathname === path
                  ? 'bg-white/10 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10 text-xs text-white/30">
          © 2026 OTIFtrack
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <Truck className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">OTIFtrack</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white/80">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-primary pt-16 px-4 py-6">
          <nav className="space-y-1">
            {navItems.map(({ label, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium',
                  location.pathname === path ? 'bg-white/10 text-white' : 'text-white/60'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-0 md:pt-0">
        <div className="md:hidden h-14" />
        <Outlet />
      </main>
    </div>
  );
}