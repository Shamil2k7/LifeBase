"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sparkles } from "lucide-react";
import { NAV_DESKTOP } from "./nav";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const name = session?.user?.name || "";
  const email = session?.user?.email || "";
  const initials = name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="hidden md:flex w-[232px] flex-shrink-0 border-r border-slate-100 dark:border-slate-800 p-3.5 flex-col gap-1 bg-white dark:bg-[#161922] min-h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-2.5 pt-1.5 pb-5">
        <div className="w-[34px] h-[34px] rounded-[11px] bg-primary flex items-center justify-center flex-shrink-0">
          <Sparkles size={17} className="text-white" />
        </div>
        <span className="font-display font-extrabold text-[15.5px] text-slate-900 dark:text-slate-100">Lifebase</span>
      </div>
      {NAV_DESKTOP.map((n) => {
        const active = pathname === n.href || pathname.startsWith(n.href + "/");
        return (
          <Link key={n.href} href={n.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-[13px] text-sm font-bold transition-colors
            ${active ? "bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60"}`}>
            <n.icon size={18} />{n.label}
          </Link>
        );
      })}
      <div className="flex-1" />
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[12.5px] font-extrabold flex-shrink-0">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{name}</div>
          <div className="text-[11px] text-slate-400 truncate">{email}</div>
        </div>
      </div>
    </div>
  );
}
