"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, GripVertical, Trash2, Plus, Compass, Wallet } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { ProgressRing } from "@/components/ui/ProgressBar";
import { fetcher, apiRequest } from "@/lib/fetcher";
import { fmtDate, fmtINR, daysBetween } from "@/lib/format";
import { useToast } from "@/app/providers";

const TRIP_EXPENSE_CATS = ["Travel", "Food", "Hotel", "Shopping", "Activities", "Other"];
const TODAY = new Date().toISOString().slice(0, 10);

export default function TripDetailPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: trip, isLoading, mutate } = useSWR(`/api/trips/${params.id}`, fetcher);
  const [tab, setTab] = useState("Overview");
  const [confirm, setConfirm] = useState(null);

  if (isLoading) return <div className="text-sm text-slate-400 py-10 text-center">Loading trip…</div>;
  if (!trip) return <div className="text-sm text-slate-400 py-10 text-center">Trip not found.</div>;

  const patch = async (body) => { await apiRequest(`/api/trips/${trip._id}`, "PATCH", body); mutate(); };

  const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const remaining = trip.budget - spent;
  const daysToGo = daysBetween(TODAY, trip.startDate);
  const totalDays = daysBetween(trip.startDate, trip.endDate) + 1;
  const tabs = ["Overview", "Itinerary", "Expenses", "Places", "Notes"];

  return (
    <div>
      <button onClick={() => router.push("/trips")} className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[13px] font-bold mb-3">
        <ArrowLeft size={16} /> All trips
      </button>

      <Card className="overflow-hidden mb-4">
        <div className="h-[120px] flex items-center justify-center text-5xl" style={{ background: trip.coverColor }}>{trip.cover}</div>
        <div className="p-4.5 p-[18px]">
          <div className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">{trip.name}</div>
          <div className="text-[13px] text-slate-400 flex items-center gap-1 mt-1"><MapPin size={13} />{trip.destination}</div>
        </div>
      </Card>

      <div className="flex gap-1.5 mb-[18px] overflow-x-auto pb-0.5">
        {tabs.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} className={`px-4 py-2 rounded-xl text-[13px] font-bold whitespace-nowrap flex-shrink-0 ${tab === tb ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>{tb}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <MiniStat label="Dates" value={`${fmtDate(trip.startDate, { day: "numeric", month: "short" })} – ${fmtDate(trip.endDate, { day: "numeric", month: "short" })}`} />
            <MiniStat label="Duration" value={`${totalDays} days`} />
            <MiniStat label="Travelers" value={String(trip.travelers)} />
            <MiniStat label={daysToGo >= 0 ? "Countdown" : "Status"} value={daysToGo > 0 ? `${daysToGo} days to go` : daysToGo === 0 ? "Starts today" : "Completed"} />
          </div>
          <Card className="p-4.5 p-[18px] mb-4 flex items-center gap-5">
            <ProgressRing pct={trip.budget ? spent / trip.budget : 0} color={spent > trip.budget ? "#E1544C" : "#0BA97A"} track="#F1F2F6" size={70} stroke={7} />
            <div className="flex-1">
              <Row label="Budget" value={fmtINR(trip.budget)} />
              <Row label="Total spent" value={fmtINR(spent)} />
              <Row label="Remaining" value={fmtINR(remaining)} danger={remaining < 0} />
            </div>
          </Card>
          {trip.description && <Card className="p-4"><div className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">{trip.description}</div></Card>}
        </div>
      )}

      {tab === "Itinerary" && <ItineraryTab trip={trip} patch={patch} toast={toast} />}
      {tab === "Expenses" && <ExpensesTab trip={trip} patch={patch} toast={toast} setConfirm={setConfirm} />}
      {tab === "Places" && <PlacesTab trip={trip} patch={patch} toast={toast} setConfirm={setConfirm} />}
      {tab === "Notes" && (
        <Card className="p-4">
          <label className="text-xs font-bold text-slate-400 mb-1.5 block">Trip notes</label>
          <TextArea defaultValue={trip.notes} onBlur={(e) => patch({ notes: e.target.value })} className="min-h-[160px]" placeholder="Packing lists, ideas, reminders…" />
        </Card>
      )}

      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <Card className="p-3.5">
      <div className="text-[11px] text-slate-400 font-bold mb-1">{label}</div>
      <div className="text-[13.5px] text-slate-900 dark:text-slate-100 font-extrabold">{value}</div>
    </Card>
  );
}
function Row({ label, value, danger }) {
  return (
    <div className="flex justify-between py-1 text-[13px]">
      <span className="text-slate-400">{label}</span>
      <span className={`font-extrabold ${danger ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>{value}</span>
    </div>
  );
}

function ItineraryTab({ trip, patch, toast }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ day: 1, time: "", title: "" });

  const addActivity = async (e) => {
    e.preventDefault();
    if (!form.title || !form.time) return;
    const itinerary = JSON.parse(JSON.stringify(trip.itinerary));
    let d = itinerary.find((x) => x.day === Number(form.day));
    if (!d) { d = { day: Number(form.day), activities: [] }; itinerary.push(d); itinerary.sort((a, b) => a.day - b.day); }
    d.activities.push({ time: form.time, title: form.title });
    d.activities.sort((a, b) => a.time.localeCompare(b.time));
    await patch({ itinerary });
    setOpen(false); setForm({ day: 1, time: "", title: "" }); toast("Activity added");
  };
  const removeActivity = async (day, activityId) => {
    const itinerary = JSON.parse(JSON.stringify(trip.itinerary));
    const d = itinerary.find((x) => x.day === day);
    d.activities = d.activities.filter((a) => (a._id || a.id) !== activityId);
    await patch({ itinerary });
  };

  return (
    <div>
      <div className="flex justify-end mb-3"><Button icon={Plus} onClick={() => setOpen(true)}>Add activity</Button></div>
      {trip.itinerary.length === 0 ? (
        <EmptyState icon={Compass} title="No itinerary yet" subtitle="Plan your days hour by hour." actionLabel="Add activity" onAction={() => setOpen(true)} />
      ) : trip.itinerary.map((d) => (
        <div key={d.day} className="mb-[18px]">
          <div className="text-[13.5px] font-extrabold text-slate-900 dark:text-slate-100 mb-2">Day {d.day}</div>
          <Card className="p-1.5">
            {d.activities.map((a, i) => (
              <div key={a._id || i} className={`flex items-center gap-3 py-2.5 px-2.5 ${i < d.activities.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
                <GripVertical size={14} className="text-slate-300" />
                <div className="text-[12.5px] font-extrabold text-primary dark:text-primary-dark w-[54px] flex-shrink-0">{a.time}</div>
                <div className="text-[13.5px] text-slate-900 dark:text-slate-100 flex-1">{a.title}</div>
                <IconButton icon={Trash2} size={14} danger onClick={() => removeActivity(d.day, a._id)} label="Remove" />
              </div>
            ))}
          </Card>
        </div>
      ))}
      {open && (
        <Modal title="Add activity" onClose={() => setOpen(false)}>
          <form onSubmit={addActivity}>
            <Field label="Day number"><TextInput type="number" min="1" required value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })} /></Field>
            <Field label="Time"><TextInput type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            <Field label="Activity"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Button type="submit" className="w-full">Add activity</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function ExpensesTab({ trip, patch, toast, setConfirm }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ amount: "", category: "Travel", date: TODAY, notes: "" });
  const spent = trip.expenses.reduce((s, e) => s + e.amount, 0);

  const add = async (e) => {
    e.preventDefault();
    if (!form.amount) return;
    const expenses = [{ ...form, amount: Number(form.amount) }, ...JSON.parse(JSON.stringify(trip.expenses))];
    await patch({ expenses });
    setOpen(false); setForm({ amount: "", category: "Travel", date: TODAY, notes: "" }); toast("Expense added to trip");
  };
  const remove = async (id) => {
    const expenses = trip.expenses.filter((e) => e._id !== id);
    await patch({ expenses });
  };

  return (
    <div>
      <Card className="p-4 mb-3.5 flex justify-between">
        <MiniInline label="Budget" value={fmtINR(trip.budget)} />
        <MiniInline label="Spent" value={fmtINR(spent)} />
        <MiniInline label="Remaining" value={fmtINR(trip.budget - spent)} danger={trip.budget - spent < 0} />
      </Card>
      <div className="flex justify-end mb-2.5"><Button icon={Plus} onClick={() => setOpen(true)}>Add expense</Button></div>
      {trip.expenses.length === 0 ? (
        <EmptyState icon={Wallet} title="No expenses logged" subtitle="Track what you spend on this trip." />
      ) : (
        <Card className="p-1.5">
          {trip.expenses.map((e, i) => (
            <div key={e._id || i} className={`flex items-center gap-2.5 py-2.5 px-2 ${i < trip.expenses.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{e.notes || e.category}</div>
                <div className="text-[11px] text-slate-400">{e.category} · {fmtDate(e.date)}</div>
              </div>
              <div className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">{fmtINR(e.amount)}</div>
              <IconButton icon={Trash2} size={14} danger onClick={() => setConfirm({ title: "Delete expense", message: "This expense will be removed from the trip.", onConfirm: () => { remove(e._id); toast("Expense deleted"); } })} label="Delete" />
            </div>
          ))}
        </Card>
      )}
      {open && (
        <Modal title="Add trip expense" onClose={() => setOpen(false)}>
          <form onSubmit={add}>
            <Field label="Amount (₹)"><TextInput type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
            <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{TRIP_EXPENSE_CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Date"><TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
            <Field label="Notes"><TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button type="submit" className="w-full">Add expense</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
function MiniInline({ label, value, danger }) {
  return (
    <div>
      <div className="text-[11px] text-slate-400 font-bold mb-0.5">{label}</div>
      <div className={`text-[14.5px] font-extrabold ${danger ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>{value}</div>
    </div>
  );
}

function PlacesTab({ trip, patch, toast, setConfirm }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", location: "", description: "", visitDate: "", status: "Want to Visit" });
  const order = ["Want to Visit", "Visited", "Skipped"];

  const add = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    const places = [{ ...form }, ...JSON.parse(JSON.stringify(trip.places))];
    await patch({ places });
    setOpen(false); setForm({ name: "", location: "", description: "", visitDate: "", status: "Want to Visit" }); toast("Place added");
  };
  const cycle = async (id) => {
    const places = JSON.parse(JSON.stringify(trip.places));
    const p = places.find((x) => x._id === id);
    p.status = order[(order.indexOf(p.status) + 1) % order.length];
    await patch({ places });
  };
  const remove = async (id) => { await patch({ places: trip.places.filter((p) => p._id !== id) }); };

  return (
    <div>
      <div className="flex justify-end mb-3"><Button icon={Plus} onClick={() => setOpen(true)}>Add place</Button></div>
      {trip.places.length === 0 ? (
        <EmptyState icon={Compass} title="No places added" subtitle="Save tourist spots for this trip." actionLabel="Add place" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {trip.places.map((p) => (
            <Card key={p._id} className="p-3.5">
              <div className="flex justify-between items-start mb-2">
                <button onClick={() => cycle(p._id)}>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark">{p.status}</span>
                </button>
                <IconButton icon={Trash2} size={13} danger onClick={() => setConfirm({ title: "Delete place", message: "This place will be removed from the trip.", onConfirm: () => { remove(p._id); toast("Place deleted"); } })} label="Delete" />
              </div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">{p.name}</div>
              {p.location && <div className="text-[11.5px] text-slate-400 mb-1.5 flex items-center gap-1"><MapPin size={11} />{p.location}</div>}
              {p.description && <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{p.description}</div>}
              {p.visitDate && <div className="text-[11px] text-slate-400 mt-2">Planned for {fmtDate(p.visitDate)}</div>}
            </Card>
          ))}
        </div>
      )}
      {open && (
        <Modal title="Add a place" onClose={() => setOpen(false)}>
          <form onSubmit={add}>
            <Field label="Place name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Location"><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Visit date"><TextInput type="date" value={form.visitDate} onChange={(e) => setForm({ ...form, visitDate: e.target.value })} /></Field>
            <Button type="submit" className="w-full">Add place</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
