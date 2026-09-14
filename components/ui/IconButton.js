"use client";

export default function IconButton({ icon: Icon, label, active, danger, size = 18, className = "", ...props }) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
        ${active ? "bg-primary-light dark:bg-primary/20 text-primary dark:text-primary-dark" : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}
        ${danger ? "hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950" : ""} ${className}`}
      {...props}
    >
      <Icon size={size} />
    </button>
  );
}
