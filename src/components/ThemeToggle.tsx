"use client";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-sm border border-neutral-700 px-3 py-1 rounded hover:bg-neutral-800"
      aria-label="Alternar tema"
    >
      {isDark ? "Light" : "Dark"}
    </button>
  );
}
