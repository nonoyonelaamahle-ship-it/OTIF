import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        <main className="flex-1 pb-20 md:pb-0">
          <Outlet />
        </main>
      </div>
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}