"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="ml-auto rounded-full border border-pink-200 bg-white px-3 py-1.5 text-sm font-medium text-[#8a5570] transition hover:border-[#ec0a7a] hover:text-[#ec0a7a] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:text-pink-300"
    >
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}
