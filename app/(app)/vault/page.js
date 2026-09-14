"use client";

import { useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2, Eye, EyeOff, Copy, Lock } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { usePasswords } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { useToast } from "@/app/providers";

function passwordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "#E1544C", pct: 0.25 };
  if (score <= 3) return { label: "Fair", color: "#DE9520", pct: 0.55 };
  if (score === 4) return { label: "Good", color: "#2C7BE5", pct: 0.8 };
  return { label: "Strong", color: "#0BA97A", pct: 1 };
}

export default function VaultPage() {
  const [unlocked, setUnlocked] = useState(false);
  const { data: passwords = [], isLoading, mutate } = usePasswords(unlocked);
  const { toast } = useToast();
  const [master, setMaster] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [reveal, setReveal] = useState({});
  const empty = { site: "", username: "", password: "", url: "", notes: "" };
  const [form, setForm] = useState(empty);

  const tryUnlock = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/vault/unlock", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ masterPassword: master }) });
    if (res.ok) { setUnlocked(true); setError(""); setMaster(""); }
    else setError("Incorrect master password.");
  };
  const lock = async () => { await fetch("/api/vault/lock", { method: "POST" }); setUnlocked(false); };

  if (!unlocked) {
    return (
      <div className="flex items-center justify-center min-h-[480px]">
        <div className="max-w-[340px] w-full text-center">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-[18px]">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">Password vault</h2>
          <p className="text-[13px] text-slate-400 mb-5 leading-relaxed">Enter your master password to unlock saved passwords.</p>
          <form onSubmit={tryUnlock}>
            <TextInput type="password" autoFocus placeholder="Master password" value={master} onChange={(e) => { setMaster(e.target.value); setError(""); }} className="text-center mb-2.5" />
            {error && <div className="text-xs text-red-500 mb-2.5">{error}</div>}
            <Button type="submit" className="w-full">Unlock vault</Button>
          </form>
          <div className="text-[11px] text-slate-400 mt-3.5">Master password is set when you register your account (or via <code>npm run seed</code>).</div>
        </div>
      </div>
    );
  }

  const filtered = passwords.filter((p) => p.site.toLowerCase().includes(q.toLowerCase()));
  const openEdit = (p) => { setEditing(p._id); setForm({ site: p.site, username: p.username || "", password: p.password, url: p.url || "", notes: p.notes || "" }); setOpen(true); };
  const openAdd = () => { setEditing(null); setForm(empty); setOpen(true); };
  const remove = async (id) => { await apiRequest(`/api/passwords/${id}`, "DELETE"); mutate(); };
  const copy = (text, label) => { navigator.clipboard?.writeText(text).catch(() => {}); toast(`${label} copied`); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.site || !form.password) return;
    if (editing) { await apiRequest(`/api/passwords/${editing}`, "PUT", form); toast("Password updated"); }
    else { await apiRequest("/api/passwords", "POST", form); toast("Password saved"); }
    mutate(); setOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5 gap-2.5 flex-wrap">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Password vault</h2>
        <div className="flex gap-2">
          <Button variant="ghost" icon={Lock} onClick={lock}>Lock</Button>
          <Button icon={Plus} onClick={openAdd}>Add password</Button>
        </div>
      </div>
      <TextInput placeholder="Search passwords…" value={q} onChange={(e) => setQ(e.target.value)} className="mb-4" />

      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading vault…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Lock} title="No passwords saved" subtitle="Store your website and app logins securely." actionLabel="Add password" onAction={openAdd} />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map((p) => {
            const strength = passwordStrength(p.password);
            const shown = reveal[p._id];
            return (
              <Card key={p._id} className="p-4">
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-[38px] h-[38px] rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center text-sm font-extrabold text-primary dark:text-primary-dark flex-shrink-0">{p.site[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-extrabold text-slate-900 dark:text-slate-100 truncate">{p.site}</div>
                    {p.url && <div className="text-[11px] text-slate-400 truncate">{p.url}</div>}
                  </div>
                  <IconButton icon={Pencil} size={13} onClick={() => openEdit(p)} label="Edit" />
                  <IconButton icon={Trash2} size={13} danger onClick={() => setConfirm({ title: "Delete password", message: `Delete saved password for "${p.site}"?`, onConfirm: () => { remove(p._id); toast("Password deleted"); } })} label="Delete" />
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-2.5 py-2 mb-2">
                  <span className="text-[12.5px] text-slate-600 dark:text-slate-300 flex-1 truncate">{p.username}</span>
                  <button onClick={() => copy(p.username, "Username")} className="text-slate-400"><Copy size={13} /></button>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-2.5 py-2 mb-2.5">
                  <span className="text-[12.5px] text-slate-600 dark:text-slate-300 flex-1 font-mono">{shown ? p.password : "•".repeat(Math.min(p.password.length, 12))}</span>
                  <button onClick={() => setReveal((r) => ({ ...r, [p._id]: !r[p._id] }))} className="text-slate-400">{shown ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                  <button onClick={() => copy(p.password, "Password")} className="text-slate-400"><Copy size={13} /></button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1"><ProgressBar pct={strength.pct} color={strength.color} height={5} /></div>
                  <span className="text-[10.5px] font-extrabold" style={{ color: strength.color }}>{strength.label}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {open && (
        <Modal title={editing ? "Edit password" : "Add password"} onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Website / app name"><TextInput required value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })} /></Field>
            <Field label="Username or email"><TextInput value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></Field>
            <Field label="Password"><TextInput required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
            <Field label="URL"><TextInput value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://" /></Field>
            <Field label="Notes"><TextArea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></Field>
            <Button type="submit" className="w-full">{editing ? "Save changes" : "Save password"}</Button>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}
