export const fmtINR = (n) => "\u20B9" + Math.round(n || 0).toLocaleString("en-IN");

export const fmtDate = (iso, opts) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", opts || { day: "numeric", month: "short", year: "numeric" });
};

export const daysBetween = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2 - d1) / 86400000);
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const uid = () => Math.random().toString(36).slice(2, 10);
