"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { TextInput, Field } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", masterPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong.");
      return;
    }
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9] dark:bg-[#0C0E13] px-4">
      <div className="max-w-sm w-full">
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles size={19} className="text-white" />
          </div>
          <span className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-100">Lifebase</span>
        </div>
        <div className="bg-white dark:bg-[#161922] rounded-3xl p-7 shadow-soft">
          <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Create your account</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Set a master password for your password vault too — you can't recover it later, so keep it safe.</p>
          <form onSubmit={submit}>
            <Field label="Name"><TextInput required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Email"><TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
            <Field label="Password"><TextInput type="password" required minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></Field>
            <Field label="Vault master password"><TextInput type="password" required minLength={4} value={form.masterPassword} onChange={(e) => setForm({ ...form, masterPassword: e.target.value })} /></Field>
            {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Creating…" : "Create account"}</Button>
          </form>
          <p className="text-xs text-slate-400 mt-5 text-center">
            Already have an account? <Link href="/login" className="text-primary dark:text-primary-dark font-bold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
