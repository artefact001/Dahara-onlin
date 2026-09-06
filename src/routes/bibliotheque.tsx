import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { fetchBooks, fetchFavorites, fetchReadingProgress } from "@/lib/library-queries";

export const Route = createFileRoute("/bibliotheque")({
  head: () => ({
    meta: [
      { title: "Bibliothèque islamique — lecture en ligne et favoris" },
      {
        name: "description",
        content:
          "Lisez des livres de hadith, tajwid, sira et langue arabe directement en ligne, ajoutez vos favoris et reprenez votre lecture au bon chapitre.",
      },
      { property: "og:title", content: "Bibliothèque islamique — Dahara Online" },
      {
        property: "og:description",
        content: "Livres lisibles chapitre par chapitre, favoris et reprise de lecture automatique.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BibliothequePage,
});

function BibliothequePage() {
  const { user } = useAuth();
  const [cat, setCat] = useState("Tout");
  const [onlyFavs, setOnlyFavs] = useState(false);

  const books = useQuery({ queryKey: ["books"], queryFn: fetchBooks });
  const favorites = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: fetchFavorites,
    enabled: !!user,
  });
  const progress = useQuery({
    queryKey: ["reading-progress", user?.id],
    queryFn: fetchReadingProgress,
    enabled: !!user,
  });

  const cats = useMemo(
    () => ["Tout", ...new Set((books.data ?? []).map((b) => b.category))],
    [books.data],
  );

  const favIds = new Set((favorites.data ?? []).map((f) => f.book_id));
  const list = (books.data ?? []).filter(
    (b) => (cat === "Tout" || b.category === cat) && (!onlyFavs || favIds.has(b.id)),
  );
  const resume = (progress.data ?? [])[0];
  const resumeBook = (books.data ?? []).find((b) => b.id === resume?.book_id);

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Bibliothèque" title="Des livres à lire vraiment, chapitre par chapitre.">
        Hadith, tajwid, sira et langue arabe. Ajoutez vos livres en favoris et retrouvez votre
        lecture au chapitre exact où vous l'avez laissée.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
          {resumeBook && (
            <Link
              to="/bibliotheque/$slug"
              params={{ slug: resumeBook.slug }}
              className="block bg-forest text-cream rounded-[16px] p-6 mb-8"
            >
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
                Reprendre la lecture
              </div>
              <div className="mt-2 font-display text-2xl">{resumeBook.title}</div>
              <div className="mt-1 text-sm text-cream/75">
                Chapitre {(resume!.chapter_index ?? 0) + 1} · {resume!.percent} % lu
              </div>
            </Link>
          )}

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {cats.map((c) => (
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
            {user && (
              <button
                onClick={() => setOnlyFavs((v) => !v)}
                className={
                  onlyFavs
                    ? "ml-auto bg-terra text-cream rounded-full px-3.5 py-1.5 font-medium"
                    : "ml-auto bg-cream ring-1 ring-black/5 text-ink-soft rounded-full px-3.5 py-1.5"
                }
              >
                ★ Mes favoris
              </button>
            )}
          </div>

          {books.isLoading && <p className="mt-8 text-sm text-ink-soft">Chargement des livres…</p>}

          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.map((b) => {
              const p = (progress.data ?? []).find((x) => x.book_id === b.id);
              return (
                <Link
                  key={b.id}
                  to="/bibliotheque/$slug"
                  params={{ slug: b.slug }}
                  className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5 transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="h-28 rounded-[10px] bg-forest/10 grid place-items-center">
                    <span className="font-arabic text-3xl text-forest/70" dir="rtl" aria-hidden="true">
                      كتاب
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-terra-deep">
                      {b.category}
                    </span>
                    {favIds.has(b.id) && <span className="text-terra text-sm">★</span>}
                  </div>
                  <h2 className="mt-1.5 font-display text-lg text-ink leading-tight">{b.title}</h2>
                  <div className="mt-1 text-sm text-ink-soft">{b.author}</div>
                  <p className="mt-2 text-sm text-ink-soft/80 line-clamp-2">{b.description}</p>
                  <div className="mt-4 h-1 rounded-full bg-ink/10">
                    <div
                      className="h-full rounded-full bg-terra animate-barfill"
                      style={{ width: `${p?.percent ?? 0}%` }}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-ink-soft/70">
                    <span className="font-mono">{b.chapters.length} chapitres</span>
                    <span>{p ? `${p.percent} % lu` : "Commencer"}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
