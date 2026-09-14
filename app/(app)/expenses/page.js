"use client";

import { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Plus, ArrowUpRight, ArrowDownRight, Trash2, Wallet, Banknote, Smartphone, Landmark, CreditCard } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, Select } from "@/components/ui/Field";
import { useTransactions, useTrips } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { fmtINR, fmtDate, todayISO } from "@/lib/format";
import { useToast } from "@/app/providers";

const EXPENSE_CATS = ["Food", "Travel", "Shopping", "Bills", "Education", "Entertainment", "Health", "Other"];
const PAYMENT_METHODS = ["Cash", "UPI", "Bank", "Card"];
const PAY_ICON = { Cash: Banknote, UPI: Smartphone, Bank: Landmark, Card: CreditCard };
const CAT_COLORS = { Food: "#DE9520", Travel: "#2C3E8C", Shopping: "#B23E7A", Bills: "#5B6072", Education: "#0BA97A", Entertainment: "#8B5CF6", Health: "#E1544C", Other: "#6B7180", Salary: "#0BA97A" };
const TODAY = todayISO();

export default function ExpensesPage() {
  const { data: transactions = [], isLoading, mutate } = useTransactions();
  const { data: trips = [] } = useTrips();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const empty = { type: "expense", amount: "", category: "Food", date: TODAY, notes: "", paymentMethod: "UPI", trip: "" };
  const [form, setForm] = useState(empty);

  const monthTx = transactions.filter((x) => x.date.slice(0, 7) === TODAY.slice(0, 7));
  const income = monthTx.filter((x) => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const expense = monthTx.filter((x) => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const balance = transactions.reduce((s, x) => s + (x.type === "income" ? x.amount : -x.amount), 0);
  const savings = Math.max(0, income - expense);

  const categoryData = useMemo(() => {
    const map = {};
    monthTx.filter((x) => x.type === "expense").forEach((x) => { map[x.category] = (map[x.category] || 0) + x.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [monthTx]);

  const monthlyTrend = useMemo(() => {
    const map = {};
    transactions.forEach((x) => {
      const m = x.date.slice(0, 7);
      if (!map[m]) map[m] = { month: m, Income: 0, Expense: 0 };
      map[m][x.type === "income" ? "Income" : "Expense"] += x.amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6).map((x) => ({ ...x, label: fmtDate(x.month + "-01", { month: "short" }) }));
  }, [transactions]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    await apiRequest("/api/transactions", "POST", { ...form, amount: Number(form.amount), trip: form.trip || null });
    mutate(); setOpen(false); setForm(empty); toast(form.type === "income" ? "Income added" : "Expense added");
  };
  const remove = async (id) => { await apiRequest(`/api/transactions/${id}`, "DELETE"); mutate(); };

  const sortedTx = [...transactions].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Expense tracker</h2>
        <Button icon={Plus} onClick={() => setOpen(true)}>Add transaction</Button>
      </div>

      <Card className="p-5 mb-3.5 bg-primary text-white border-none relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] w-[110px] h-[110px] rounded-full bg-white/10" />
        <div className="text-xs opacity-85 font-semibold mb-1">Current balance</div>
        <div className="font-display text-3xl font-extrabold mb-4">{fmtINR(balance)}</div>
        <div className="flex gap-5">
          <div><div className="text-[11px] opacity-80">Income this month</div><div className="text-[15px] font-extrabold">{fmtINR(income)}</div></div>
          <div><div className="text-[11px] opacity-80">Expense this month</div><div className="text-[15px] font-extrabold">{fmtINR(expense)}</div></div>
          <div><div className="text-[11px] opacity-80">Savings</div><div className="text-[15px] font-extrabold">{fmtINR(savings)}</div></div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-3.5 mb-4">
        <Card className="p-4">
          <div className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 mb-2.5">Category spending</div>
          {categoryData.length === 0 ? <div className="text-[12.5px] text-slate-400">No expenses this month yet.</div> : (
            <div className="flex items-center gap-3.5">
              <div className="w-[130px] h-[130px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={35} outerRadius={62} paddingAngle={2}>
                      {categoryData.map((entry, i) => <Cell key={i} fill={CAT_COLORS[entry.name] || "#6B7180"} />)}
                    </Pie>
                    <Tooltip formatter={(v) => fmtINR(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                {categoryData.map((c) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-[11.5px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: CAT_COLORS[c.name] || "#6B7180" }} />
                    <span className="text-slate-500 dark:text-slate-400 flex-1">{c.name}</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{fmtINR(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100 mb-2.5">Income vs expense</div>
          <div className="w-full h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={34} />
                <Tooltip formatter={(v) => fmtINR(v)} />
                <Bar dataKey="Income" fill="#0BA97A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Expense" fill="#E1544C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <h3 className="font-display text-[15.5px] font-extrabold text-slate-900 dark:text-slate-100 mb-2.5">All transactions</h3>
      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading…</div>
      ) : sortedTx.length === 0 ? (
        <EmptyState icon={Wallet} title="No transactions" subtitle="Add your first income or expense entry." actionLabel="Add transaction" onAction={() => setOpen(true)} />
      ) : (
        <Card className="p-1.5">
          {sortedTx.map((x, i) => {
            const trip = trips.find((tr) => tr._id === x.trip);
            const PayIcon = PAY_ICON[x.paymentMethod] || Banknote;
            return (
              <div key={x._id} className={`flex items-center gap-3 py-3 px-2 ${i < sortedTx.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
                <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0 ${x.type === "income" ? "bg-accent-light dark:bg-accent/15" : "bg-red-50 dark:bg-red-950/40"}`}>
                  {x.type === "income" ? <ArrowDownRight size={16} className="text-accent" /> : <ArrowUpRight size={16} className="text-red-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">{x.notes || x.category}</div>
                  <div className="text-[11.5px] text-slate-400 flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span>{x.category}</span><span>·</span><span>{fmtDate(x.date)}</span><span>·</span>
                    <span className="flex items-center gap-1"><PayIcon size={11} />{x.paymentMethod}</span>
                    {trip && <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-accent-light dark:bg-accent/15 text-accent">{trip.name}</span>}
                  </div>
                </div>
                <div className={`text-sm font-extrabold whitespace-nowrap ${x.type === "income" ? "text-accent" : "text-slate-900 dark:text-slate-100"}`}>
                  {x.type === "income" ? "+" : "-"}{fmtINR(x.amount)}
                </div>
                <IconButton icon={Trash2} size={13} danger onClick={() => setConfirm({ title: "Delete transaction", message: "This transaction will be permanently removed.", onConfirm: () => { remove(x._id); toast("Transaction deleted"); } })} label="Delete" />
              </div>
            );
          })}
        </Card>
      )}

      {open && (
        <Modal title="Add transaction" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <div className="flex gap-2 mb-3.5">
              {["expense", "income"].map((ty) => (
                <button key={ty} type="button" onClick={() => setForm({ ...form, type: ty, category: ty === "income" ? "Salary" : "Food" })}
                  className={`flex-1 py-2.5 rounded-xl border font-extrabold text-[13px] capitalize ${form.type === ty ? "border-primary bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}>{ty}</button>
              ))}
            </div>
            <Field label="Amount (₹)"><TextInput type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            {form.type === "expense" ? (
              <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            ) : (
              <Field label="Category"><TextInput value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Salary" /></Field>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Payment method"><Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            </div>
            {form.type === "expense" && (
              <Field label="Trip (optional)">
                <Select value={form.trip} onChange={(e) => setForm({ ...form, trip: e.target.value })}>
                  <option value="">No trip</option>
                  {trips.map((tr) => <option key={tr._id} value={tr._id}>{tr.name}</option>)}
                </Select>
              </Field>
            )}
            <Field label="Notes"><TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button type="submit" className="w-full">Add {form.type === "income" ? "income" : "expense"}</Button>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}
