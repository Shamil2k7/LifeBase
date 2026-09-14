"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Check, Clock, CheckSquare } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useTodos } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { fmtDate, todayISO } from "@/lib/format";
import { useToast } from "@/app/providers";

const TODO_TYPES = ["Personal", "Study", "Work", "Shopping", "Health", "Finance", "Travel", "Other"];
const REMINDER_OPTS = ["None", "1 Day Before", "2 Days Before", "7 Days Before"];
const SECTIONS = ["Today", "Upcoming", "Overdue", "Completed", "All Tasks"];
const TODAY = todayISO();

export default function TodosPage() {
  const { data: todos = [], isLoading, mutate } = useTodos();
  const { toast } = useToast();
  const [section, setSection] = useState("Today");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const empty = { title: "", description: "", type: "Personal", priority: "Medium", dueDate: TODAY, reminder: "None" };
  const [form, setForm] = useState(empty);

  const filtered = useMemo(() => {
    return todos.filter((td) => {
      if (section === "Today") return td.status !== "completed" && td.dueDate === TODAY;
      if (section === "Upcoming") return td.status !== "completed" && td.dueDate > TODAY;
      if (section === "Overdue") return td.status !== "completed" && td.dueDate < TODAY;
      if (section === "Completed") return td.status === "completed";
      return true;
    }).sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || ""));
  }, [todos, section]);

  const toggle = async (td) => { await apiRequest(`/api/todos/${td._id}`, "PATCH", { status: td.status === "completed" ? "pending" : "completed" }); mutate(); };
  const remove = async (id) => { await apiRequest(`/api/todos/${id}`, "DELETE"); mutate(); };

  const openEdit = (td) => { setEditing(td._id); setForm({ title: td.title, description: td.description || "", type: td.type, priority: td.priority, dueDate: td.dueDate, reminder: td.reminder }); setOpen(true); };
  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title) return;
    if (editing) { await apiRequest(`/api/todos/${editing}`, "PATCH", form); toast("Todo updated"); }
    else { await apiRequest("/api/todos", "POST", form); toast("Todo added"); }
    mutate(); setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Todo manager</h2>
        <Button icon={Plus} onClick={openAdd}>Add todo</Button>
      </div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5">
        {SECTIONS.map((s) => (
          <button key={s} onClick={() => setSection(s)} className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 ${section === s ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>{s}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading todos…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={CheckSquare} title="Nothing here" subtitle="Tasks in this section will show up here." actionLabel="Add todo" onAction={openAdd} />
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((td) => {
            const overdue = td.status !== "completed" && td.dueDate < TODAY;
            return (
              <Card key={td._id} className={`p-3.5 flex items-start gap-3 ${overdue ? "border-red-100 dark:border-red-900" : ""}`}>
                <button onClick={() => toggle(td)} className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${td.status === "completed" ? "bg-accent border-accent" : "border-slate-200 dark:border-slate-700"}`}>
                  {td.status === "completed" && <Check size={14} className="text-white pop" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[14.5px] font-bold text-slate-900 dark:text-slate-100 ${td.status === "completed" ? "line-through opacity-50" : ""}`}>{td.title}</span>
                    <PriorityDot p={td.priority} />
                  </div>
                  {td.description && <div className="text-xs text-slate-400 mt-0.5">{td.description}</div>}
                  <div className="flex gap-2 mt-2 flex-wrap items-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark">{td.type}</span>
                    <span className={`text-[11.5px] font-bold flex items-center gap-1 ${overdue ? "text-red-500" : "text-slate-400"}`}><Clock size={11} />{fmtDate(td.dueDate)}{overdue ? " · Overdue" : ""}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <IconButton icon={Pencil} size={14} onClick={() => openEdit(td)} label="Edit" />
                  <IconButton icon={Trash2} size={14} danger onClick={() => setConfirm({ title: "Delete todo", message: `Delete "${td.title}"? This can't be undone.`, onConfirm: () => { remove(td._id); toast("Todo deleted"); } })} label="Delete" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title={editing ? "Edit todo" : "Add todo"} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Title"><TextInput required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
            <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Type"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{TODO_TYPES.map((x) => <option key={x}>{x}</option>)}</Select></Field>
              <Field label="Priority"><Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>High</option><option>Medium</option><option>Low</option></Select></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due date"><TextInput type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></Field>
              <Field label="Reminder"><Select value={form.reminder} onChange={(e) => setForm({ ...form, reminder: e.target.value })}>{REMINDER_OPTS.map((x) => <option key={x}>{x}</option>)}</Select></Field>
            </div>
            <Button type="submit" className="w-full">{editing ? "Save changes" : "Add todo"}</Button>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}
function PriorityDot({ p }) {
  const c = { High: "bg-red-500", Medium: "bg-amber-500", Low: "bg-accent" }[p] || "bg-slate-400";
  return <span className={`w-2 h-2 rounded-full ${c} flex-shrink-0`} />;
}
