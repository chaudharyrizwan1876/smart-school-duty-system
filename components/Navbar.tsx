"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/teachers", label: "Teachers" },
  { href: "/duty-types", label: "Duty Types" },
  { href: "/assign", label: "Assign Duties" },
  { href: "/schedule", label: "Schedule" },
  { href: "/logs", label: "Notifications Log" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-slate-900 dark:bg-slate-950 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Logo className="h-9 w-9" />
            <span className="font-semibold text-lg tracking-tight hidden sm:block">
              School Duty <span className="text-brand-300">System</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 rounded-lg transition font-medium ${
                  pathname === link.href
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="ml-1 pl-2 border-l border-slate-700">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg text-slate-300 hover:bg-white/10"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden pb-3 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`px-3 py-2 rounded-lg transition font-medium text-sm ${
                  pathname === link.href
                    ? "bg-brand-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
