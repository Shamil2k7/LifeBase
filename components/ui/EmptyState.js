import Button from "./Button";
import { Plus } from "lucide-react";

export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="text-center py-14 px-5 text-slate-400 dark:text-slate-500">
      <div className="w-16 h-16 rounded-2xl bg-primary-light dark:bg-primary/15 flex items-center justify-center mx-auto mb-4">
        <Icon size={28} className="text-primary dark:text-primary-dark" />
      </div>
      <div className="font-display text-base font-extrabold text-slate-900 dark:text-slate-100 mb-1.5">{title}</div>
      <div className="text-[13.5px] mb-4 max-w-xs mx-auto leading-relaxed">{subtitle}</div>
      {actionLabel && <Button icon={Plus} onClick={onAction}>{actionLabel}</Button>}
    </div>
  );
}
