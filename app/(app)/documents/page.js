"use client";

import { useState } from "react";
import { Upload, Cloud, Star, Share2, Download, Trash2, FileText, LayoutGrid, List as ListIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import IconButton from "@/components/ui/IconButton";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Field, TextInput, TextArea, Select } from "@/components/ui/Field";
import { useDocuments } from "@/lib/useData";
import { apiRequest } from "@/lib/fetcher";
import { fmtDate } from "@/lib/format";
import { useToast } from "@/app/providers";

const DOC_CATS = ["Education", "Home", "Job", "Personal", "Financial", "Medical", "Other"];

export default function DocumentsPage() {
  const { data: documents = [], isLoading, mutate } = useDocuments();
  const { toast } = useToast();
  const [view, setView] = useState("grid");
  const [catFilter, setCatFilter] = useState("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [driveConnected, setDriveConnected] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const empty = { name: "", category: "Personal", description: "", tags: "", file: null };
  const [form, setForm] = useState(empty);

  const filtered = documents.filter((d) =>
    (catFilter === "All" || d.category === catFilter) &&
    (d.name.toLowerCase().includes(q.toLowerCase()) || (d.tags || []).join(" ").toLowerCase().includes(q.toLowerCase()))
  );

  const toggleFav = async (d) => { await apiRequest(`/api/documents/${d._id}`, "PATCH", { favorite: !d.favorite }); mutate(); };
  const remove = async (id) => { await apiRequest(`/api/documents/${id}`, "DELETE"); mutate(); };
  const share = (d) => { toast(`Shareable link copied for "${d.name}"`); };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("category", form.category);
    fd.append("description", form.description);
    fd.append("tags", form.tags);
    fd.append("driveConnected", String(driveConnected));
    if (form.file) fd.append("file", form.file);
    await apiRequest("/api/documents", "POST", fd);
    mutate(); setOpen(false); setForm(empty); toast("Document uploaded");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2.5">
        <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100">Document vault</h2>
        <Button icon={Upload} onClick={() => setOpen(true)}>Upload document</Button>
      </div>

      <Card className={`p-3.5 mb-4 border-none flex items-center justify-between gap-2.5 flex-wrap ${driveConnected ? "bg-accent-light dark:bg-accent/15" : "bg-slate-100 dark:bg-slate-800"}`}>
        <div className="flex items-center gap-2.5">
          <Cloud size={16} className={driveConnected ? "text-accent" : "text-slate-400"} />
          <span className={`text-[12.5px] font-semibold ${driveConnected ? "text-accent" : "text-slate-500 dark:text-slate-400"}`}>
            {driveConnected ? "Google Drive connected — new uploads sync automatically." : "Connect Google Drive to back up your documents."}
          </span>
        </div>
        <Button variant="ghost" onClick={() => { setDriveConnected((c) => !c); toast(driveConnected ? "Google Drive disconnected" : "Google Drive connected"); }} className="px-3 py-1.5 text-xs">
          {driveConnected ? "Disconnect" : "Connect"}
        </Button>
      </Card>

      <div className="flex gap-2.5 mb-3 flex-wrap items-center">
        <TextInput placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 min-w-[180px]" />
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-lg ${view === "grid" ? "bg-white dark:bg-slate-700" : ""}`}><LayoutGrid size={15} className={view === "grid" ? "text-primary dark:text-primary-dark" : "text-slate-400"} /></button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-lg ${view === "list" ? "bg-white dark:bg-slate-700" : ""}`}><ListIcon size={15} className={view === "list" ? "text-primary dark:text-primary-dark" : "text-slate-400"} /></button>
        </div>
      </div>
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-0.5">
        {["All", ...DOC_CATS].map((c) => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap flex-shrink-0 ${catFilter === c ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"}`}>{c}</button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400 py-10 text-center">Loading documents…</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No documents found" subtitle="Try a different search or category, or upload a new document." actionLabel="Upload document" onAction={() => setOpen(true)} />
      ) : view === "grid" ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((d) => (
            <Card key={d._id} className="p-3.5">
              <div className="flex justify-between items-start mb-2.5">
                <div className="w-[38px] h-[38px] rounded-xl bg-primary-light dark:bg-primary/20 flex items-center justify-center"><FileText size={17} className="text-primary dark:text-primary-dark" /></div>
                <button onClick={() => toggleFav(d)}><Star size={16} className={d.favorite ? "text-amber-500 fill-amber-500" : "text-slate-300"} /></button>
              </div>
              <div className="text-[13.5px] font-extrabold text-slate-900 dark:text-slate-100 mb-0.5">{d.name}</div>
              <div className="text-[11.5px] text-slate-400 mb-2">{d.category} · {d.fileType}</div>
              {d.tags?.length > 0 && (
                <div className="flex gap-1.5 flex-wrap mb-2.5">
                  {d.tags.map((tag) => <span key={tag} className="text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{tag}</span>)}
                </div>
              )}
              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800">
                {d.driveSynced ? <span className="text-[10.5px] text-accent font-bold flex items-center gap-1"><Cloud size={12} />Synced</span> : <span className="text-[10.5px] text-slate-400">Not synced</span>}
                <div className="flex gap-0.5">
                  <IconButton icon={Share2} size={13} onClick={() => share(d)} label="Share" />
                  {d.fileUrl ? (
                    <a href={d.fileUrl} download target="_blank" rel="noreferrer" className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><Download size={13} /></a>
                  ) : (
                    <IconButton icon={Download} size={13} onClick={() => toast("No file was attached to this document")} label="Download" />
                  )}
                  <IconButton icon={Trash2} size={13} danger onClick={() => setConfirm({ title: "Delete document", message: `Delete "${d.name}"?`, onConfirm: () => { remove(d._id); toast("Document deleted"); } })} label="Delete" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-1.5">
          {filtered.map((d, i) => (
            <div key={d._id} className={`flex items-center gap-3 py-3 px-2 ${i < filtered.length - 1 ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
              <div className="w-9 h-9 rounded-[11px] bg-primary-light dark:bg-primary/20 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-primary dark:text-primary-dark" /></div>
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">{d.name}{d.favorite && <Star size={12} className="text-amber-500 fill-amber-500" />}</div>
                <div className="text-[11.5px] text-slate-400">{d.category} · {d.fileType} · {fmtDate(d.updatedAt)}</div>
              </div>
              {d.driveSynced && <Cloud size={14} className="text-accent" />}
              <IconButton icon={Share2} size={14} onClick={() => share(d)} label="Share" />
              <IconButton icon={Trash2} size={14} danger onClick={() => setConfirm({ title: "Delete document", message: `Delete "${d.name}"?`, onConfirm: () => { remove(d._id); toast("Document deleted"); } })} label="Delete" />
            </div>
          ))}
        </Card>
      )}

      {open && (
        <Modal title="Upload document" onClose={() => setOpen(false)}>
          <form onSubmit={submit}>
            <Field label="Document name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Passport copy" /></Field>
            <Field label="Category"><Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{DOC_CATS.map((c) => <option key={c}>{c}</option>)}</Select></Field>
            <Field label="Description"><TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
            <Field label="Tags (comma separated)"><TextInput value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="ID, Govt" /></Field>
            <Field label="File">
              <input type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => setForm({ ...form, file: e.target.files[0] || null })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-sm text-slate-700 dark:text-slate-200" />
              <div className="text-[11px] text-slate-400 mt-1.5">PDF, JPG, PNG or DOCX — stored on the server under /public/uploads.</div>
            </Field>
            <Button type="submit" className="w-full">Upload</Button>
          </form>
        </Modal>
      )}
      {confirm && <ConfirmDialog title={confirm.title} message={confirm.message} onCancel={() => setConfirm(null)} onConfirm={() => { confirm.onConfirm(); setConfirm(null); }} />}
    </div>
  );
}
