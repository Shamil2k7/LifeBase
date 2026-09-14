export default function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}>
      {children}
    </span>
  );
}
