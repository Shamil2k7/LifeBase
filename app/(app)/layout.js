import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";
import Topbar from "@/components/layout/Topbar";

export default function AppLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--bg)]">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar />
        <div className="flex-1 px-4 pb-28 pt-2 page-anim">{children}</div>
      </div>
      <BottomNav />
    </div>
  );
}
