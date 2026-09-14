export function FieldLabel({ children }) {
  return <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">{children}</label>;
}

export function Field({ label, children }) {
  return (
    <div className="mb-3.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  );
}

const inputClasses =
  "w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 text-[14.5px] outline-none focus:ring-2 focus:ring-primary/30 dark:focus:ring-primary-dark/30";

export function TextInput(props) {
  return <input {...props} className={`${inputClasses} ${props.className || ""}`} />;
}
export function TextArea(props) {
  return <textarea {...props} className={`${inputClasses} min-h-[80px] resize-y ${props.className || ""}`} />;
}
export function Select({ children, ...props }) {
  return (
    <select {...props} className={`${inputClasses} ${props.className || ""}`}>
      {children}
    </select>
  );
}
