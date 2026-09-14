"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useTrips } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { fmtDate, fmtINR, daysBetween } from "@/lib/format";
import { useToast } from "@/app/providers";

const emptyTrip = { name: "", destination: "", startDate: "", endDate: "", budget: "", travelers: 1, description: "", cover: "🧳", coverColor: "#2C3E8C" };

export default function TripsPage() {
  const { data: trips = [], isLoading, mutate } = useTrips();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyTrip);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.destination || !form.startDate || !form.endDate) return;
    await apiRequest("/api/trips", "POST", { ...form, budget: Number(form.budget) || 0, travelers: Number(form.travelers) || 1 });
    mutate();
    setShowAdd(false);
    setForm(emptyTrip);
    toast("Trip created");
  };

  const sorted = [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Trips</h2>
        <Button icon={Plus} onClick={() => setShowAdd(true)}>New trip</Button>
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading trips…</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={MapPin} title="No trips yet" subtitle="Start planning your next getaway." actionLabel="Plan a trip" onAction={() => setShowAdd(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sorted.map((tr) => {
            const spent = tr.expenses.reduce((s, e) => s + e.amount, 0);
            const pct = tr.budget ? spent / tr.budget : 0;
            const days = daysBetween(tr.startDate, tr.endDate) + 1;
            return (
              <Link key={tr._id} href={`/trips/${tr._id}`}>
                <Card className="overflow-hidden hover:-translate-y-0.5 transition-transform h-full">
                  <div className="h-[92px] flex items-center justify-center text-4xl" style={{ background: tr.coverColor }}>{tr.cover}</div>
                  <div className="p-4">
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100">{tr.name}</div>
                    <div className="text-[12.5px] text-slate-400 mb-2.5 flex items-center gap-1"><MapPin size={12} />{tr.destination}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-3">{fmtDate(tr.startDate)} – {fmtDate(tr.endDate)} · {days} day{days > 1 ? "s" : ""}</div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Budget {fmtINR(tr.budget)}</span>
                      <span className="text-slate-900 dark:text-slate-100 font-bold">Spent {fmtINR(spent)}</span>
                    </div>
                    <ProgressBar pct={pct} color={pct > 1 ? "#E1544C" : "#0BA97A"} />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {showAdd && (
        <Modal title="Plan a new trip" onClose={() => setShowAdd(false)}>
          <form onSubmit={submit}>
            <Field label="Trip name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Wayanad Adventure" /></Field>
            <Field label="Destination"><TextInput required value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date"><TextInput type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></Field>
              <Field label="End date"><TextInput type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Budget (₹)"><TextInput type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></Field>
              <Field label="Travelers"><TextInput type="number" min="1" value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} /></Field>
            </div>
            <Field label="Cover emoji"><TextInput value={form.cover} onChange={(e) => setForm({ ...form, cover: e.target.value })} maxLength={2} /></Field>
            <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Button type="submit" className="w-full">Create trip</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
