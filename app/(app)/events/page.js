"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Bell, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useEvents } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { fmtDate, daysBetween, todayISO } from "@/lib/format";
import { useToast } from "@/app/providers";

const EVENT_CATS = ["Birthday", "Exam", "Meeting", "Appointment", "Travel", "Personal", "Other"];
const REMINDER_OPTS = ["None", "1 Day Before", "2 Days Before", "7 Days Before"];
const TODAY = todayISO();

export default function EventsPage() {
  const { data: events = [], isLoading, mutate } = useEvents();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const empty = { name: "", description: "", date: TODAY, time: "12:00", location: "", category: "Personal", reminder: "2 Days Before" };
  const [form, setForm] = useState(empty);
  const [notifPerm, setNotifPerm] = useState(typeof window !== "undefined" && "Notification" in window ? Notification.permission : "default");

  const sorted = [...events].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  const openEdit = (ev) => { setEditing(ev._id); setForm({ name: ev.name, description: ev.description || "", date: ev.date, time: ev.time, location: ev.location || "", category: ev.category, reminder: ev.reminder }); setOpen(true); };
  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const remove = async (id) => { await apiRequest(`/api/events/${id}`, "DELETE"); mutate(); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    if (editing) { await apiRequest(`/api/events/${editing}`, "PATCH", form); toast("Event updated"); }
    else { await apiRequest("/api/events", "POST", form); toast("Event added"); }
    mutate(); setOpen(false);
  };

  const requestPerm = () => {
    if (!("Notification" in window)) { toast("Notifications not supported in this browser"); return; }
    Notification.requestPermission().then((p) => { setNotifPerm(p); toast(p === "granted" ? "Notifications enabled" : "Notifications blocked"); });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Events</h2>
        <Button icon={Plus} onClick={openAdd}>Add event</Button>
      </div>

      {notifPerm !== "granted" && (
        <Card className="p-3.5 mb-4 bg-primary-light dark:bg-primary/15 border-none flex items-center gap-3 justify-between flex-wrap">
          <div className="flex items-center gap-2.5">
            <Bell size={16} className="text-primary dark:text-primary-dark" />
            <span className="text-[12.5px] font-semibold text-primary dark:text-primary-dark">Turn on browser notifications to get event reminders.</span>
          </div>
          <Button variant="ghost" onClick={requestPerm} className="px-3 py-1.5 text-xs">Enable</Button>
        </Card>
      )}

      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading events…</div>
      ) : sorted.length === 0 ? (
        <EmptyState icon={Calendar} title="No events yet" subtitle="Add birthdays, exams, meetings and appointments." actionLabel="Add event" onAction={openAdd} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {sorted.map((ev) => {
            const d = daysBetween(TODAY, ev.date);
            return (
              <Card key={ev._id} className="p-3.5 flex gap-3.5 items-center">
                <div className="w-[50px] h-[50px] rounded-2xl bg-primary-light dark:bg-primary/20 flex flex-col items-center justify-center flex-shrink-0">
                  <div className="text-[15px] font-extrabold text-primary dark:text-primary-dark leading-none">{fmtDate(ev.date, { day: "numeric" })}</div>
                  <div className="text-[10px] font-bold text-primary dark:text-primary-dark uppercase">{fmtDate(ev.date, { month: "short" })}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-extrabold text-slate-900 dark:text-slate-100">{ev.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{ev.time} {ev.location && `· ${ev.location}`}</div>
                  <div className="flex gap-2 mt-2 items-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent-light dark:bg-accent/15 text-accent">{ev.category}</span>
                    <span className={`text-[11.5px] font-bold ${d < 0 ? "text-slate-400" : "text-amber-500"}`}>{d < 0 ? "Past" : d === 0 ? "Today" : `In ${d} day${d > 1 ? "s" : ""}`}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <IconButton icon={Pencil} size={14} onClick={() => openEdit(ev)} label="Edit" />
                  <IconButton icon={Trash2} size={14} danger onClick={() => setConfirm({ title: "Delete event", message: `Delete "${ev.name}"?`, onConfirm: () => { remove(ev._id); toast("Event deleted"); } })} label="Delete" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title={editing ? "Edit event" : "Add event"} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Event name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Date"><TextInput type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></Field>
              <Field label="Time"><TextInput type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></Field>
            </div>
            <Field label="Location"><TextInput value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{EVENT_CATS.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Reminder"><Select value={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.value })}>{REMINDER_OPTS.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            </div>
            <Button type="submit" className="w-full">{editing ? "Save changes" : "Add event"}</Button>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}
