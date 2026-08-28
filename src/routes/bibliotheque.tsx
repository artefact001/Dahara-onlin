import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { BOOKS } from "@/lib/site-data";

export const Route = createFileRoute("/bibliotheque")({
  head: () => ({
    meta: [
      { title: "Bibliothèque islamique — livres, audios et fiches" },
      {
        name: "description",
        content:
          "Une bibliothèque de livres, fiches et audios en fiqh, hadith, arabe et tajwid, avec reprise de lecture et suivi de progression.",
      },
      { property: "og:title", content: "Bibliothèque islamique — Dahara Online" },
      {
        property: "og:description",
        content:
          "Livres, fiches et audios classés par science, avec reprise de lecture là où vous vous êtes arrêté.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BibliothequePage,
});

const CATS = ["Tout", "Fiqh", "Hadith", "Arabe", "Tajwid", "Sirah", "Invocations"];

function BibliothequePage() {
  const [cat, setCat] = useState("Tout");
  const list = BOOKS.filter((b) => cat === "Tout" || b.cat === cat);

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Bibliothèque" title="Le savoir à portée de main, hors ligne compris.">
        Livres, fiches de révision et audios classés par science. Votre lecture reprend
        automatiquement où vous l'avez laissée.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {CATS.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={
                  cat === c
                    ? "bg-forest text-cream rounded-full px-3.5 py-1.5 font-medium"
                    : "bg-cream ring-1 ring-black/5 text-ink-soft rounded-full px-3.5 py-1.5 hover:ring-ink/20"
                }
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((b) => (
              <article
                key={b.title}
                className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="h-28 rounded-[10px] bg-forest/10 grid place-items-center">
                  <span className="font-arabic text-3xl text-forest/70" dir="rtl" aria-hidden="true">
                    كتاب
                  </span>
                </div>
                <div className="mt-4 text-[11px] font-mono uppercase tracking-wider text-terra-deep">
                  {b.cat}
                </div>
                <h2 className="mt-1.5 font-display text-lg text-ink leading-tight">{b.title}</h2>
                <div className="mt-1 text-sm text-ink-soft">{b.author}</div>
                <div className="mt-4 h-1 rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-terra animate-barfill"
                    style={{ width: `${b.progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-ink-soft/70">
                  <span className="font-mono">{b.progress} %</span>
                  <span>{b.progress === 0 ? "Non commencé" : "En cours"}</span>
                </div>
                <button className="mt-4 w-full text-sm font-medium text-forest border border-forest/25 rounded-[10px] py-2.5 hover:bg-forest/5">
                  {b.progress === 0 ? "Commencer la lecture" : "Reprendre"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
