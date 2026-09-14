"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

const ThemeContext = createContext({ dark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

const ToastContext = createContext({ toast: () => {} });
export const useToast = () => useContext(ToastContext);

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lm-theme");
    const isDark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = useCallback(() => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("lm-theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  }, []);

  return <ThemeContext.Provider value={{ dark, toggle }}>{children}</ThemeContext.Provider>;
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const toast = useCallback((msg) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((s) => [...s, { id, msg }]);
    setTimeout(() => setToasts((s) => s.filter((t) => t.id !== id)), 2400);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div key={t.id} className="bg-[#151824] text-white dark:bg-white dark:text-[#151824] px-4 py-2.5 rounded-2xl text-sm font-semibold shadow-lg">
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
