"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { TextInput, Field } from "@/components/ui/Field";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { ...form, redirect: false });
    setLoading(false);
    if (res?.error) setError("Invalid email or password.");
    else router.push("/dashboard");
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
          <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Log in to your personal life manager.</p>
          <form onSubmit={submit}>
            <Field label="Email">
              <TextInput type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </Field>
            <Field label="Password">
              <TextInput type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </Field>
            {error && <div className="text-sm text-red-500 mb-3">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "Logging in…" : "Log in"}</Button>
          </form>
          <p className="text-xs text-slate-400 mt-5 text-center">
            No account? <Link href="/register" className="text-primary dark:text-primary-dark font-bold">Create one</Link>
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-5 text-center">
          Run <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">npm run seed</code> to create a demo account.
        </p>
      </div>
    </div>
  );
}
