import { Home, MapPin, CheckSquare, Calendar, Wallet, FileText, Lock, Settings } from "lucide-react";

export const NAV_MAIN = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "Trips", icon: MapPin },
  { href: "/todos", label: "Todo", icon: CheckSquare },
  { href: "/expenses", label: "Expense", icon: Wallet },
];

export const NAV_MORE = [
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/vault", label: "Password Vault", icon: Lock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export const NAV_DESKTOP = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/trips", label: "Trips", icon: MapPin },
  { href: "/todos", label: "Todo", icon: CheckSquare },
  { href: "/events", label: "Events", icon: Calendar },
  { href: "/expenses", label: "Expense", icon: Wallet },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/vault", label: "Password Vault", icon: Lock },
  { href: "/settings", label: "Settings", icon: Settings },
];
