import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider";
import { useBgRemoval } from "./BgRemovalProvider";

const navItems = [
  { to: "/", label: "Wardrobe", icon: "👕" },
  { to: "/outfits", label: "Outfits", icon: "👔" },
  { to: "/suggest", label: "Suggest", icon: "✨" },
  { to: "/history", label: "History", icon: "📅" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();
  const { pending } = useBgRemoval();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">Aufi</h1>
          {pending > 0 && (
            <span className="animate-pulse rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
              Processing {pending} photo{pending !== 1 && "s"}...
            </span>
          )}
        </div>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 active:text-gray-700 dark:text-gray-400 dark:active:text-gray-200"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-white dark:border-gray-800 dark:bg-gray-900">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center py-2 text-xs ${
                isActive ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
