import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthProvider";

const navItems = [
  { to: "/", label: "Wardrobe", icon: "👕" },
  { to: "/outfits", label: "Outfits", icon: "👔" },
  { to: "/suggest", label: "Suggest", icon: "✨" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Aufi</h1>
        <button
          onClick={signOut}
          className="text-sm text-gray-500 active:text-gray-700"
        >
          Sign out
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-20">{children}</main>

      <nav className="fixed bottom-0 left-0 right-0 flex border-t bg-white">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center py-2 text-xs ${
                isActive ? "text-gray-900" : "text-gray-400"
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
