import { Link } from "@tanstack/react-router";
import { useState } from "react";

const NAV = [
  { to: "/professeurs", label: "Professeurs" },
  { to: "/mon-dahara", label: "Mon Dahara" },
  { to: "/coran", label: "Coran" },
  { to: "/bibliotheque", label: "Bibliothèque" },
  { to: "/tarifs", label: "Tarifs" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-cream/90 border-b border-ink/10 sticky top-0 z-50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="size-9 grid place-items-center bg-forest text-cream rounded-[10px] font-display text-lg leading-none">
            D
          </div>
          <span className="font-display text-lg tracking-tight text-ink">
            Dahara <span className="text-ink-soft/70">Online</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-ink-soft">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-ink font-medium" }}
              className="hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            to="/devenir-professeur"
            className="hidden lg:block text-sm text-ink-soft hover:text-ink"
          >
            Enseigner
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium bg-forest text-cream rounded-[10px] px-4 py-2 ring-1 ring-forest-deep/20 transition-transform hover:-translate-y-0.5"
          >
            Commencer
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            className="md:hidden size-9 grid place-items-center rounded-[10px] border border-ink/15 text-ink"
          >
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor">
              <path strokeWidth="2" d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="md:hidden border-t border-ink/10 bg-cream px-5 py-3 flex flex-col gap-1 text-sm">
          {[...NAV, { to: "/devenir-professeur", label: "Devenir professeur" } as const, { to: "/a-propos", label: "À propos" } as const].map(
            (item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                activeProps={{ className: "text-ink font-medium" }}
                className="text-ink-soft py-2"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
      )}
    </header>
  );
}
