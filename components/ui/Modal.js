"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import IconButton from "./IconButton";

export default function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[200] flex items-end justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`modal-slide bg-white dark:bg-[#161922] w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-t-3xl p-6 pb-8`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-extrabold text-slate-900 dark:text-slate-100">{title}</h2>
          <IconButton icon={X} onClick={onClose} label="Close" />
        </div>
        {children}
      </div>
    </div>
  );
}
