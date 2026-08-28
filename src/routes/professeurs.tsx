import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SUBJECTS, TEACHERS } from "@/lib/site-data";

export const Route = createFileRoute("/professeurs")({
  head: () => ({
    meta: [
      { title: "Professeurs vérifiés d'arabe et de Coran — Dahara Online" },
      {
        name: "description",
        content:
          "Parcourez les enseignants vérifiés de Dahara Online : arabe, Coran, tajwid, hadith et fiqh. Tarifs, langues, disponibilités et réservation en ligne.",
      },
      { property: "og:title", content: "Professeurs vérifiés — Dahara Online" },
      {
        property: "og:description",
        content:
          "Trouvez le professeur qui correspond à votre niveau, votre langue et votre emploi du temps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfesseursPage,
});

function ProfesseursPage() {
  const [subject, setSubject] = useState("Tous");
  const [query, setQuery] = useState("");

  const list = useMemo(
    () =>
      TEACHERS.filter(
        (t) =>
          (subject === "Tous" || t.tags.includes(subject)) &&
          (query.trim() === "" ||
            `${t.name} ${t.subjects} ${t.city}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [subject, query],
  );

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Trouver un professeur" title="Des enseignants vérifiés, un à un.">
        Chaque professeur est entretenu, vérifié et évalué par ses élèves. Choisissez la matière,
        la langue et le créneau qui vous conviennent.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
          <div className="bg-cream rounded-[14px] ring-1 ring-black/5 p-3 sm:p-4">
            <div className="grid sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Matière, prénom du professeur, ville…"
                  className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
                />
              </div>
              <div className="sm:col-span-3">
                <select className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink-soft focus:outline-none focus:ring-2 focus:ring-terra/40">
                  <option>Tous niveaux</option>
                  <option>Débutant</option>
                  <option>Intermédiaire</option>
                  <option>Avancé</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <select className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm text-ink-soft focus:outline-none focus:ring-2 focus:ring-terra/40">
                  <option>Format</option>
                  <option>Individuel</option>
                  <option>Groupe</option>
                  <option>Enfant</option>
                  <option>Adulte</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-ink-soft/60 font-mono uppercase tracking-wider mr-1">
              Filtres
            </span>
            {["Tous", ...SUBJECTS].map((s) => (
              <button
                key={s}
                onClick={() => setSubject(s)}
                className={
                  subject === s
                    ? "bg-forest text-cream rounded-full px-3.5 py-1.5 font-medium"
                    : "bg-cream ring-1 ring-black/5 text-ink-soft rounded-full px-3.5 py-1.5 hover:ring-ink/20"
                }
              >
                {s}
              </button>
            ))}
            <span className="ml-auto text-ink-soft/70 font-mono">
              {list.length} professeur{list.length > 1 ? "s" : ""}
            </span>
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((t) => (
              <article
                key={t.slug}
                className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={t.photo}
                    width={512}
                    height={512}
                    loading="lazy"
                    alt={`Portrait de ${t.name}`}
                    className="size-14 shrink-0 rounded-[12px] object-cover outline-1 -outline-offset-1 outline-black/5"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg text-ink leading-tight">{t.name}</h2>
                      <span className="text-[10px] font-mono uppercase tracking-wide bg-forest/10 text-forest rounded-full px-2 py-0.5">
                        Vérifié
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-ink-soft">{t.subjects}</div>
                    <div className="mt-1.5 text-xs text-ink-soft/70">{t.meta}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-ink">
                    {t.rating} <span className="text-ink-soft/50 text-xs">/5 · {t.reviews} avis</span>
                  </span>
                  <div className="flex gap-1.5 text-[11px] font-mono text-ink-soft">
                    {t.languages.map((l) => (
                      <span key={l} className="px-1.5 py-0.5 bg-sand rounded">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-ink/10 flex items-center justify-between">
                  <div>
                    <div className="font-display text-xl text-terra-deep">
                      {t.price} <span className="text-xs text-ink-soft/60 font-body">FCFA</span>
                    </div>
                    <div className="text-xs text-ink-soft/70">{t.session}</div>
                  </div>
                  <span className="text-xs flex items-center gap-1.5 text-forest">
                    <span className="size-2 rounded-full bg-forest" />
                    {t.days}
                  </span>
                </div>
                <Link
                  to="/professeurs/$slug"
                  params={{ slug: t.slug }}
                  className="mt-4 block text-center w-full text-sm font-medium text-forest border border-forest/25 rounded-[10px] py-2.5 hover:bg-forest/5"
                >
                  Voir le profil
                </Link>
              </article>
            ))}
          </div>

          {list.length === 0 && (
            <p className="mt-10 text-sm text-ink-soft">
              Aucun professeur ne correspond à cette recherche pour le moment.
            </p>
          )}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
