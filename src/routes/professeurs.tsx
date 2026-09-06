import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { fetchTeachers, formatMoney } from "@/lib/booking-queries";

export const Route = createFileRoute("/professeurs")({
  head: () => ({
    meta: [
      { title: "Trouver un professeur de Coran et d'arabe | Dahara Online" },
      {
        name: "description",
        content:
          "Parcourez les professeurs vérifiés de Dahara Online, comparez matières, langues et tarifs, et réservez un créneau réel dans leur agenda.",
      },
      { property: "og:title", content: "Professeurs vérifiés — Dahara Online" },
      {
        property: "og:description",
        content: "Coran, tajwid, langue arabe, fiqh et sira : réservez votre cours en quelques clics.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfesseursPage,
});

function ProfesseursPage() {
  const [subject, setSubject] = useState("Tout");
  const [query, setQuery] = useState("");
  const teachers = useQuery({ queryKey: ["teachers"], queryFn: fetchTeachers });

  const subjects = useMemo(
    () => ["Tout", ...new Set((teachers.data ?? []).flatMap((t) => t.subjects))],
    [teachers.data],
  );

  const list = (teachers.data ?? []).filter((t) => {
    const q = query.trim().toLowerCase();
    return (
      (subject === "Tout" || t.subjects.includes(subject)) &&
      (!q ||
        t.full_name.toLowerCase().includes(q) ||
        (t.city ?? "").toLowerCase().includes(q) ||
        t.subjects.join(" ").toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Professeurs" title="Un maître pour votre parcours, un créneau pour ce soir.">
        Tous nos enseignants sont vérifiés. Choisissez la matière, la langue et l'horaire qui vous
        conviennent, puis réservez directement dans leur agenda.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nom, ville, matière…"
              className="flex-1 bg-cream rounded-[10px] ring-1 ring-black/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-terra/40"
            />
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {subjects.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={
                    subject === s
                      ? "bg-forest text-cream rounded-full px-3.5 py-2 font-medium"
                      : "bg-cream ring-1 ring-black/5 text-ink-soft rounded-full px-3.5 py-2 hover:ring-ink/20"
                  }
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {teachers.isLoading && <p className="mt-8 text-sm text-ink-soft">Chargement…</p>}
          {!teachers.isLoading && list.length === 0 && (
            <p className="mt-8 text-sm text-ink-soft">Aucun professeur ne correspond à cette recherche.</p>
          )}

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((t) => (
              <Link
                key={t.id}
                to="/professeurs/$slug"
                params={{ slug: t.slug }}
                className="bg-cream rounded-[16px] ring-1 ring-black/5 p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-forest/10 text-forest grid place-items-center font-display text-lg">
                    {t.full_name.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-lg text-ink leading-tight truncate">
                      {t.full_name}
                    </h2>
                    <div className="text-xs text-ink-soft/80">
                      {t.city} · ★ {t.rating.toFixed(1)}
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-ink-soft line-clamp-2">{t.headline}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.subjects.map((s) => (
                    <span
                      key={s}
                      className="text-[11px] font-mono px-2 py-1 rounded-full bg-sand text-ink-soft"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-4 flex items-end justify-between">
                  <span className="font-display text-lg text-forest">
                    {formatMoney(t.hourly_price)}
                  </span>
                  <span className="text-xs text-ink-soft/70">/ heure</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
