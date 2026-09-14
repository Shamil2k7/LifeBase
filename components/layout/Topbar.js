"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, Sun, Moon, ArrowLeft, FileQuestion, Calendar, CheckSquare, AlertCircle, MapPin } from "lucide-react";
import IconButton from "@/components/ui/IconButton";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { useTheme } from "@/app/providers";
import { useTrips, useTodos, useEvents, useDocuments } from "@/lib/useData";
import { daysBetween, todayISO, fmtDate } from "@/lib/format";

export default function Topbar() {
  const { dark, toggle } = useTheme();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [q, setQ] = useState("");

  const { data: trips = [] } = useTrips();
  const { data: todos = [] } = useTodos();
  const { data: events = [] } = useEvents();
  const { data: documents = [] } = useDocuments();

  const TODAY = todayISO();

  const notifications = useMemo(() => {
    const list = [];
    events.forEach((ev) => {
      const d = daysBetween(TODAY, ev.date);
      if (d >= 0 && d <= 2) list.push({ id: "ev-" + ev._id, icon: Calendar, title: ev.name, sub: d === 0 ? "Today" : `In ${d} day${d > 1 ? "s" : ""}` });
    });
    todos.filter((td) => td.status !== "completed").forEach((td) => {
      const d = daysBetween(TODAY, td.dueDate);
      if (d === 0) list.push({ id: "td-" + td._id, icon: CheckSquare, title: td.title, sub: "Due today" });
      if (d < 0) list.push({ id: "tdo-" + td._id, icon: AlertCircle, title: td.title, sub: `Overdue by ${-d}d` });
    });
    trips.forEach((tr) => {
      const d = daysBetween(TODAY, tr.startDate);
      if (d >= 0 && d <= 7) list.push({ id: "tr-" + tr._id, icon: MapPin, title: tr.name, sub: d === 0 ? "Starts today" : `Starts in ${d}d` });
    });
    return list;
  }, [events, todos, trips, TODAY]);

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const query = q.toLowerCase();
    const res = [];
    trips.forEach((x) => (x.name + x.destination).toLowerCase().includes(query) && res.push({ type: "Trip", label: x.name, sub: x.destination, href: `/trips/${x._id}` }));
    todos.forEach((x) => x.title.toLowerCase().includes(query) && res.push({ type: "Todo", label: x.title, sub: x.type, href: "/todos" }));
    events.forEach((x) => x.name.toLowerCase().includes(query) && res.push({ type: "Event", label: x.name, sub: fmtDate(x.date), href: "/events" }));
    documents.forEach((x) => x.name.toLowerCase().includes(query) && res.push({ type: "Document", label: x.name, sub: x.category, href: "/documents" }));
    return res.slice(0, 20);
  }, [q, trips, todos, events, documents]);

  return (
    <div className="flex items-center gap-2.5 px-4 pt-4 pb-2 sticky top-0 bg-[var(--bg)] z-20">
      <button onClick={() => setSearchOpen(true)} className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161922] text-left">
        <Search size={16} className="text-slate-400" />
        <span className="text-[13.5px] text-slate-400">Search trips, todos, events…</span>
      </button>
      <IconButton icon={dark ? Sun : Moon} onClick={toggle} label="Toggle theme" />
      <div className="relative">
        <IconButton icon={Bell} onClick={() => setNotifOpen((o) => !o)} label="Notifications" />
        {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 border-2 border-[var(--bg)]" />}
        {notifOpen && (
          <div className="absolute right-0 top-11 w-[300px] max-h-[360px] overflow-y-auto bg-white dark:bg-[#161922] rounded-2xl shadow-soft dark:shadow-softDark border border-slate-100 dark:border-slate-800 p-2.5 z-50">
            <div className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 px-1.5 pb-2">Notifications</div>
            {notifications.length === 0 ? (
              <div className="text-xs text-slate-400 px-1.5 py-2.5">You're all caught up.</div>
            ) : notifications.map((n) => (
              <div key={n.id} className="flex gap-2.5 items-center p-1.5 rounded-xl">
                <div className="w-8 h-8 rounded-[10px] bg-primary-light dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <n.icon size={15} className="text-primary dark:text-primary-dark" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{n.title}</div>
                  <div className="text-[11px] text-slate-400">{n.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {searchOpen && (
        <div className="fixed inset-0 bg-[var(--bg)] z-[250] flex flex-col p-4">
          <div className="flex items-center gap-2.5 mb-4">
            <IconButton icon={ArrowLeft} onClick={() => { setSearchOpen(false); setQ(""); }} label="Back" />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search everything…"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 outline-none text-slate-900 dark:text-slate-100" />
          </div>
          {q.trim() === "" ? (
            <EmptyState icon={Search} title="Search your life" subtitle="Find trips, todos, events and documents in one place." />
          ) : results.length === 0 ? (
            <EmptyState icon={FileQuestion} title="No results" subtitle={`Nothing matched "${q}".`} />
          ) : (
            <div className="flex flex-col gap-2 overflow-y-auto">
              {results.map((r, i) => (
                <button key={i} onClick={() => { router.push(r.href); setSearchOpen(false); }} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161922] text-left">
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.label}</div>
                    <div className="text-xs text-slate-400">{r.sub}</div>
                  </div>
                  <Badge className="bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark">{r.type}</Badge>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
