"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSession } from "next-auth/react";
import { MapPin, CheckSquare, Calendar, Wallet, FileText, Lock, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Card from "@/components/ui/Card";
import { useDashboard } from "@/lib/useData";
import { fmtINR, fmtDate, daysBetween, todayISO } from "@/lib/format";

function StatCard({ icon: Icon, colorClass, bgClass, label, value, href }) {
  return (
    <Link href={href}>
      <Card className="p-4 hover:-translate-y-0.5 transition-transform">
        <div className={`w-[34px] h-[34px] rounded-[10px] ${bgClass} flex items-center justify-center mb-2.5`}>
          <Icon size={16} className={colorClass} />
        </div>
        <div className="text-[11.5px] text-slate-400 font-bold mb-0.5">{label}</div>
        <div className="text-sm text-slate-900 dark:text-slate-100 font-extrabold truncate">{value}</div>
      </Card>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useDashboard();
  const TODAY = todayISO();

  const trips = data?.trips || [];
  const todos = data?.todos || [];
  const events = data?.events || [];
  const documents = data?.documents || [];
  const transactions = data?.transactions || [];

  const upcomingTrip = useMemo(() => [...trips].filter((t) => daysBetween(TODAY, t.startDate) >= 0).sort((a, b) => a.startDate.localeCompare(b.startDate))[0], [trips, TODAY]);
  const pendingTodos = todos.filter((t) => t.status !== "completed");
  const todosToday = pendingTodos.filter((t) => t.dueDate === TODAY);
  const upcomingEvents = useMemo(() => [...events].filter((e) => daysBetween(TODAY, e.date) >= 0).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 2), [events, TODAY]);
  const monthTx = transactions.filter((x) => x.date.slice(0, 7) === TODAY.slice(0, 7));
  const monthExpense = monthTx.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const totalSavings = Math.max(0, transactions.reduce((s, x) => s + (x.type === "income" ? x.amount : -x.amount), 0));
  const recentTx = [...transactions].slice(0, 4);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = (session?.user?.name || "there").split(" ")[0];

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading your dashboard…</div>;

  return (
    <div>
      <div className="rounded-3xl p-6 bg-primary dark:bg-primary text-white mb-4 relative overflow-hidden">
        <div className="absolute right-[-30px] top-[-30px] w-36 h-36 rounded-full bg-white/10" />
        <div className="text-[13px] opacity-80 font-semibold mb-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
        <div className="font-display text-2xl font-extrabold mb-4">{greeting}, {first}</div>
        <div className="flex gap-2.5 flex-wrap">
          <Link href="/todos" className="bg-white/15 rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"><Plus size={14} />Add todo</Link>
          <Link href="/expenses" className="bg-white/15 rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"><Wallet size={14} />Add expense</Link>
          <Link href="/trips" className="bg-white/15 rounded-xl px-3.5 py-2 text-xs font-bold flex items-center gap-1.5"><MapPin size={14} />Plan trip</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5">
        <StatCard icon={MapPin} colorClass="text-accent" bgClass="bg-accent-light dark:bg-accent/15" label="Upcoming trip" value={upcomingTrip ? upcomingTrip.name : "None planned"} href="/trips" />
        <StatCard icon={CheckSquare} colorClass="text-amber-500" bgClass="bg-amber-50 dark:bg-amber-950/40" label="Pending todos" value={`${pendingTodos.length} tasks`} href="/todos" />
        <StatCard icon={Calendar} colorClass="text-primary" bgClass="bg-primary-light dark:bg-primary/15" label="Upcoming events" value={`${upcomingEvents.length} soon`} href="/events" />
        <StatCard icon={Wallet} colorClass="text-red-500" bgClass="bg-red-50 dark:bg-red-950/40" label="Monthly expenses" value={fmtINR(monthExpense)} href="/expenses" />
        <StatCard icon={FileText} colorClass="text-primary" bgClass="bg-primary-light dark:bg-primary/15" label="Documents" value={`${documents.length}+ saved`} href="/documents" />
        <StatCard icon={Lock} colorClass="text-slate-900 dark:text-slate-100" bgClass="bg-slate-100 dark:bg-slate-800" label="Password vault" value="Tap to unlock" href="/vault" />
      </div>

      <SectionHeader title="Today" />
      <Card className="p-4 mb-5">
        {todosToday.length === 0 ? (
          <div className="text-[13.5px] text-slate-400">No tasks due today. Enjoy the calm.</div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todosToday.map((td) => (
              <div key={td._id} className="flex items-center gap-2.5">
                <PriorityDot p={td.priority} />
                <span className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100">{td.title}</span>
                <span className="text-[11.5px] text-slate-400 ml-auto">{td.type}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <SectionHeader title="Upcoming events" action="View all" href="/events" />
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        {upcomingEvents.length === 0 ? (
          <div className="text-[13.5px] text-slate-400">No events coming up.</div>
        ) : upcomingEvents.map((ev) => {
          const d = daysBetween(TODAY, ev.date);
          return (
            <Card key={ev._id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark">{ev.category}</span>
                <span className="text-[11.5px] text-slate-400 font-bold">{d === 0 ? "Today" : `In ${d}d`}</span>
              </div>
              <div className="text-[14.5px] font-extrabold text-slate-900 dark:text-slate-100 mb-1">{ev.name}</div>
              <div className="text-xs text-slate-400">{fmtDate(ev.date)} · {ev.time}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <SectionHeader title="Recent documents" action="View all" href="/documents" />
          <Card className="p-1.5">
            {documents.length === 0 && <div className="text-[13px] text-slate-400 p-3">No documents yet.</div>}
            {documents.map((d) => (
              <div key={d._id} className="flex items-center gap-2.5 p-2.5">
                <div className="w-[34px] h-[34px] rounded-[10px] bg-primary-light dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <FileText size={15} className="text-primary dark:text-primary-dark" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">{d.name}</div>
                  <div className="text-[11px] text-slate-400">{d.category}</div>
                </div>
              </div>
            ))}
          </Card>
        </div>
        <div>
          <SectionHeader title="Recent transactions" action="View all" href="/expenses" />
          <Card className="p-1.5">
            {recentTx.length === 0 && <div className="text-[13px] text-slate-400 p-3">No transactions yet.</div>}
            {recentTx.map((x) => (
              <div key={x._id} className="flex items-center gap-2.5 p-2.5">
                <div className={`w-[34px] h-[34px] rounded-[10px] flex items-center justify-center flex-shrink-0 ${x.type === "income" ? "bg-accent-light dark:bg-accent/15" : "bg-red-50 dark:bg-red-950/40"}`}>
                  {x.type === "income" ? <ArrowDownRight size={15} className="text-accent" /> : <ArrowUpRight size={15} className="text-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate">{x.notes || x.category}</div>
                  <div className="text-[11px] text-slate-400">{fmtDate(x.date)}</div>
                </div>
                <div className={`text-[13px] font-extrabold ${x.type === "income" ? "text-accent" : "text-slate-900 dark:text-slate-100"}`}>
                  {x.type === "income" ? "+" : "-"}{fmtINR(x.amount)}
                </div>
              </div>
            ))}
          </Card>
          <Card className="mt-2.5 p-4 bg-primary text-white flex justify-between items-center border-none">
            <span className="text-xs text-white/85 font-bold">Total savings</span>
            <span className="text-base font-extrabold">{fmtINR(totalSavings)}</span>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, action, href }) {
  return (
    <div className="flex items-center justify-between mx-0.5 mb-2.5 mt-1">
      <h3 className="font-display text-[15.5px] font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
      {action && <Link href={href} className="text-primary dark:text-primary-dark text-xs font-bold">{action}</Link>}
    </div>
  );
}
function PriorityDot({ p }) {
  const c = { High: "bg-red-500", Medium: "bg-amber-500", Low: "bg-accent" }[p] || "bg-slate-400";
  return <span className={`w-2 h-2 rounded-full ${c} flex-shrink-0`} />;
}
