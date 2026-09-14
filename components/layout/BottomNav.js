"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import { NAV_MAIN, NAV_MORE } from "./nav";

export default function BottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = NAV_MORE.some((n) => pathname.startsWith(n.href));

  return (
    <>
      <div className="md:hidden fixed left-2.5 right-2.5 bottom-2.5 max-w-xl mx-auto bg-white dark:bg-[#161922] rounded-[20px] shadow-soft dark:shadow-softDark border border-slate-100 dark:border-slate-800 flex p-1.5 z-[100]">
        {NAV_MAIN.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <Link key={n.href} href={n.href} className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 ${active ? "text-primary dark:text-primary-dark" : "text-slate-400"}`}>
              <n.icon size={19} />
              <span className="text-[10.5px] font-bold">{n.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setMoreOpen(true)} className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 ${moreActive ? "text-primary dark:text-primary-dark" : "text-slate-400"}`}>
          <MoreHorizontal size={19} />
          <span className="text-[10.5px] font-bold">More</span>
        </button>
      </div>

      {moreOpen && (
        <div onClick={() => setMoreOpen(false)} className="md:hidden fixed inset-0 bg-black/50 z-[150] flex items-end">
          <div onClick={(e) => e.stopPropagation()} className="modal-slide bg-white dark:bg-[#161922] w-full rounded-t-[22px] p-5 pb-8">
            <div className="w-9 h-1 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto mb-4.5" />
            <div className="grid grid-cols-2 gap-3">
              {NAV_MORE.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setMoreOpen(false)} className="flex flex-col items-start gap-2.5 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                  <div className="w-9 h-9 rounded-[11px] bg-primary-light dark:bg-primary/20 flex items-center justify-center">
                    <n.icon size={17} className="text-primary dark:text-primary-dark" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{n.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
