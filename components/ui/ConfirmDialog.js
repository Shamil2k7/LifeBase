"use client";

import { AlertCircle } from "lucide-react";
import Button from "./Button";

export default function ConfirmDialog({ title, message, onConfirm, onCancel }) {
  return (
    <div onClick={onCancel} className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-5">
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#161922] rounded-3xl p-6 max-w-sm w-full shadow-xl">
        <div className="w-11 h-11 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mb-3.5">
          <AlertCircle size={22} className="text-red-500" />
        </div>
        <h3 className="font-display text-base font-extrabold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">{message}</p>
        <div className="flex gap-2.5">
          <Button variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 border-transparent">Delete</Button>
        </div>
      </div>
    </div>
  );
}
