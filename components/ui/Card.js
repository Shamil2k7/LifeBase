export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`bg-white dark:bg-[#161922] border border-slate-100 dark:border-slate-800 rounded-card ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
