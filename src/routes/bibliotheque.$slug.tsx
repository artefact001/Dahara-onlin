import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchBook,
  fetchFavorites,
  fetchReadingProgress,
  saveReadingProgress,
  toggleFavorite,
} from "@/lib/library-queries";

export const Route = createFileRoute("/bibliotheque/$slug")({
  head: () => ({
    meta: [
      { title: "Lecture d'un livre | Bibliothèque Dahara Online" },
      {
        name: "description",
        content:
          "Lisez le livre chapitre par chapitre, ajoutez-le à vos favoris et reprenez votre lecture au bon endroit.",
      },
      { property: "og:title", content: "Lecture en ligne — Bibliothèque Dahara Online" },
      {
        property: "og:description",
        content: "Chapitres lisibles, favoris et reprise de lecture automatique.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BookReaderPage,
});

function BookReaderPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [chapter, setChapter] = useState(0);

  const book = useQuery({ queryKey: ["book", slug], queryFn: () => fetchBook(slug) });
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

  const mine = (progress.data ?? []).find((p) => p.book_id === book.data?.id);
  useEffect(() => {
    if (mine) setChapter(mine.chapter_index);
  }, [mine?.book_id]);

  const fav = (favorites.data ?? []).find((f) => f.book_id === book.data?.id);

  const favMutation = useMutation({
    mutationFn: () => toggleFavorite(user!.id, book.data!.id, fav?.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["favorites", user?.id] }),
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const total = book.data?.chapters.length ?? 0;

  function go(index: number) {
    setChapter(index);
    if (!user || !book.data) return;
    const percent = Math.round(((index + 1) / Math.max(1, total)) * 100);
    void saveReadingProgress(user.id, book.data.id, index, percent).then(() =>
      qc.invalidateQueries({ queryKey: ["reading-progress", user.id] }),
    );
  }

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />

      <section className="bg-sand/50 border-b border-ink/10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
          <Link to="/bibliotheque" className="text-sm text-ink-soft hover:text-ink">
            ← Bibliothèque
          </Link>
          {book.isLoading && <p className="mt-6 text-sm text-ink-soft">Chargement…</p>}
          {book.data === null && (
            <p className="mt-6 text-sm text-terra-deep">Ce livre n'existe pas ou plus.</p>
          )}
          {book.data && (
            <>
              <div className="mt-4 text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                {book.data.category} · {book.data.language}
              </div>
              <h1 className="mt-2 font-display font-medium text-3xl text-ink">{book.data.title}</h1>
              <div className="mt-1 text-sm text-ink-soft">{book.data.author}</div>
              {user && (
                <button
                  onClick={() => favMutation.mutate()}
                  className={`mt-5 text-sm font-medium rounded-[10px] px-4 py-2.5 ${
                    fav ? "bg-terra text-cream" : "ring-1 ring-black/10 text-ink-soft hover:bg-cream"
                  }`}
                >
                  {fav ? "★ Dans mes favoris" : "☆ Ajouter aux favoris"}
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {book.data && (
        <section className="bg-cream">
          <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-8">
            <nav className="lg:col-span-4">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-ink-soft/70">
                Chapitres
              </div>
              <ul className="mt-3 space-y-1">
                {book.data.chapters.map((c, i) => (
                  <li key={c.title}>
                    <button
                      onClick={() => go(i)}
                      className={`w-full text-left text-sm rounded-[10px] px-3 py-2.5 ${
                        chapter === i ? "bg-sand text-ink font-medium" : "text-ink-soft hover:bg-sand/50"
                      }`}
                    >
                      <span className="font-mono text-xs text-ink-soft/60">{i + 1}.</span> {c.title}
                    </button>
                  </li>
                ))}
              </ul>
              {mine && (
                <div className="mt-5 text-xs font-mono text-ink-soft/70">{mine.percent} % lu</div>
              )}
            </nav>

            <article className="lg:col-span-8 bg-sand/40 rounded-[16px] ring-1 ring-black/5 p-6 sm:p-8">
              <h2 className="font-display text-2xl text-ink">
                {book.data.chapters[chapter]?.title}
              </h2>
              <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-soft whitespace-pre-line">
                {book.data.chapters[chapter]?.content}
              </div>
              <div className="mt-8 flex items-center justify-between">
                <button
                  disabled={chapter === 0}
                  onClick={() => go(chapter - 1)}
                  className="text-sm text-ink-soft disabled:opacity-40"
                >
                  ← Chapitre précédent
                </button>
                <button
                  disabled={chapter >= total - 1}
                  onClick={() => go(chapter + 1)}
                  className="text-sm font-medium bg-forest text-cream rounded-[10px] px-4 py-2.5 disabled:opacity-40"
                >
                  Chapitre suivant →
                </button>
              </div>
              {!user && (
                <p className="mt-6 text-xs text-ink-soft/70">
                  <Link to="/auth" className="text-terra-deep hover:underline">
                    Connectez-vous
                  </Link>{" "}
                  pour enregistrer vos favoris et votre reprise de lecture.
                </p>
              )}
            </article>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}
