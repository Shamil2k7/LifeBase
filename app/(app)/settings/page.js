"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { TextInput } from "@/components/ui/Field";
import { useTheme, useToast } from "@/app/providers";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { dark, toggle } = useTheme();
  const { toast } = useToast();
  const [name, setName] = useState(session?.user?.name || "");
  const [email] = useState(session?.user?.email || "");
  const [driveConnected, setDriveConnected] = useState(true);
  const [prefs, setPrefs] = useState({ events: true, todos: true, trips: true, documents: false });

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-[18px]">Settings</h2>

      <Section title="Profile">
        <Field label="Name"><TextInput value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Email"><TextInput value={email} disabled /></Field>
        <Button onClick={() => toast("Profile updated")}>Save profile</Button>
      </Section>

      <Section title="Appearance">
        <Row label="Dark mode" desc="Switch between light and dark themes."><Toggle checked={dark} onChange={toggle} /></Row>
      </Section>

      <Section title="Notifications">
        {[["events", "Event reminders", "Get notified 2 days before events."], ["todos", "Todo reminders", "Alerts for tasks due today or overdue."], ["trips", "Trip reminders", "Heads up before upcoming trips."], ["documents", "Document expiry", "Reminders when documents are due to expire."]].map(([key, label, desc]) => (
          <Row key={key} label={label} desc={desc}><Toggle checked={prefs[key]} onChange={() => setPrefs((p) => ({ ...p, [key]: !p[key] }))} /></Row>
        ))}
      </Section>

      <Section title="Connected services">
        <Row label="Google Drive" desc={driveConnected ? "Connected — documents sync automatically." : "Not connected."}>
          <Button variant="ghost" onClick={() => { setDriveConnected((c) => !c); toast(driveConnected ? "Google Drive disconnected" : "Google Drive connected"); }} className="px-3 py-1.5 text-xs">{driveConnected ? "Disconnect" : "Connect"}</Button>
        </Row>
      </Section>

      <Section title="Security">
        <Row label="Master password" desc="Used to unlock your password vault."><Button variant="ghost" onClick={() => toast("Master password rotation isn't wired up in this starter — add it as an API route when needed")} className="px-3 py-1.5 text-xs">Change</Button></Row>
        <Row label="Log out" desc="End your session on this device."><Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })} className="px-3 py-1.5 text-xs">Log out</Button></Row>
      </Section>
    </div>
  );
}

function Field({ label, children }) {
  return <div className="mb-3.5"><label className="text-xs font-bold text-slate-400 mb-1.5 block">{label}</label>{children}</div>;
}
function Section({ title, children }) {
  return (
    <div className="mb-5">
      <div className="text-xs font-extrabold text-slate-400 mb-2 uppercase tracking-wide">{title}</div>
      <Card className="p-4">{children}</Card>
    </div>
  );
}
function Row({ label, desc, children }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div><div className="text-[13.5px] font-bold text-slate-900 dark:text-slate-100">{label}</div>{desc && <div className="text-xs text-slate-400 mt-0.5">{desc}</div>}</div>
      {children}
    </div>
  );
}
function Toggle({ checked, onChange }) {
  return (
    <button onClick={onChange} className={`w-[44px] h-[26px] rounded-full relative flex-shrink-0 transition-colors ${checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`}>
      <span className={`absolute top-[3px] w-5 h-5 rounded-full bg-white shadow transition-all ${checked ? "left-[21px]" : "left-[3px]"}`} />
    </button>
  );
}
