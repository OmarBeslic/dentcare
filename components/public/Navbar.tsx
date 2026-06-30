"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Stethoscope, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/#services", label: "Usluge" },
  { href: "/#about", label: "O nama" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  // Lock page scroll while the menu is open, and let Escape close it.
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-primary">DentCare</span>
          </Link>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Zatvori meni" : "Otvori meni"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* backdrop for mobile menu */}
      <div
        className={cn(
          "md:hidden fixed inset-x-0 top-16 bottom-0 z-30 bg-black/50 transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* mobile menu */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Glavni meni"
        className={cn(
          "md:hidden fixed top-16 inset-x-0 z-40 bg-card border-b border-border shadow-lg transition-transform duration-300 ease-in-out",
          open
            ? "translate-y-0 pointer-events-auto"
            : "-translate-y-[calc(100%+4rem)] pointer-events-none"
        )}
      >
        <nav className="p-4 space-y-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block py-3 px-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
