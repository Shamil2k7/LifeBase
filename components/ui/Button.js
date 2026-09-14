"use client";

const VARIANTS = {
  primary: "bg-primary dark:bg-primary-dark text-white border-transparent hover:opacity-90",
  accent: "bg-accent dark:bg-accent-dark text-white border-transparent hover:opacity-90",
  ghost: "bg-transparent text-[var(--fg,inherit)] border-[var(--border)] hover:bg-[var(--surface-2)] text-slate-700 dark:text-slate-200",
  danger: "bg-transparent text-red-500 border-red-100 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950",
  text: "bg-transparent text-primary dark:text-primary-dark border-transparent hover:opacity-80",
};

export default function Button({ children, variant = "primary", icon: Icon, className = "", ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
