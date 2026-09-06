import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchBookmarks,
  fetchLastRead,
  fetchSurah,
  fetchSurahList,
  saveLastRead,
  toggleBookmark,
} from "@/lib/quran";

export const Route = createFileRoute("/coran")({
  head: () => ({
    meta: [
      { title: "Coran complet — texte arabe, traduction et récitation" },
      {
        name: "description",
        content:
          "Les 114 sourates du Coran : texte arabe intégral, traduction française, récitation verset par verset, marque-pages et reprise de lecture.",
      },
      { property: "og:title", content: "Coran complet — Dahara Online" },
      {
        property: "og:description",
        content:
          "Lisez et écoutez les 114 sourates : arabe, traduction française, récitation d'Al-Afasy et marque-pages.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CoranPage,
});

function CoranPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [current, setCurrent] = useState(1);
  const [playing, setPlaying] = useState<number | null>(null);
  const [continuous, setContinuous] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const list = useQuery({ queryKey: ["surah-list"], queryFn: fetchSurahList, staleTime: Infinity });
  const surah = useQuery({
    queryKey: ["surah", current],
    queryFn: () => fetchSurah(current),
    staleTime: Infinity,
  });
  const bookmarks = useQuery({
    queryKey: ["quran-bookmarks", user?.id],
    queryFn: fetchBookmarks,
    enabled: !!user,
  });
  const lastRead = useQuery({
    queryKey: ["quran-last-read", user?.id],
    queryFn: fetchLastRead,
    enabled: !!user,
  });

  useEffect(() => {
    if (lastRead.data?.surah_number) setCurrent(lastRead.data.surah_number);
  }, [lastRead.data?.surah_number]);

  const mark = useMutation({
    mutationFn: (v: { ayah: number; existing?: string | undefined }) =>
      toggleBookmark(user!.id, current, v.ayah, v.existing),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quran-bookmarks", user?.id] }),
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (list.data ?? []).filter(
      (s) =>
        !q ||
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(query) ||
        String(s.number) === q,
    );
  }, [list.data, query]);

  const ayahs = surah.data?.ayahs ?? [];

  function play(index: number) {
    const ayah = ayahs[index];
    if (!ayah) return;
    setPlaying(index);
    const el = audioRef.current;
    if (!el) return;
    el.src = ayah.audio;
    void el.play();
    if (user) void saveLastRead(user.id, current, ayah.numberInSurah);
  }

  function onEnded() {
    if (continuous && playing !== null && playing + 1 < ayahs.length) {
      play(playing + 1);
      return;
    }
    setPlaying(null);
  }

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Coran" title="Les 114 sourates, en arabe, en français, à voix haute.">
        Texte arabe complet, traduction de Hamidullah et récitation du cheikh Mishary Al-Afasy.
        Connecté, votre lecture reprend exactement là où vous vous êtes arrêté.
      </PageHero>

      <audio ref={audioRef} onEnded={onEnded} className="hidden" />

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-cream rounded-[16px] ring-1 ring-black/5 p-4">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Chercher une sourate…"
                className="w-full bg-sand/60 rounded-[10px] px-4 py-3 text-sm placeholder:text-ink-soft/50 focus:outline-none focus:ring-2 focus:ring-terra/40"
              />
              {list.isLoading && <p className="mt-4 text-sm text-ink-soft">Chargement…</p>}
              <ul className="mt-3 max-h-[70vh] overflow-y-auto divide-y divide-ink/10">
                {filtered.map((s) => (
                  <li key={s.number}>
                    <button
                      onClick={() => {
                        setCurrent(s.number);
                        setPlaying(null);
                        audioRef.current?.pause();
                      }}
                      className={`w-full flex items-center gap-3 py-3 px-2 rounded-[10px] text-left ${
                        current === s.number ? "bg-sand/70" : "hover:bg-sand/40"
                      }`}
                    >
                      <span className="size-8 shrink-0 grid place-items-center rounded-full bg-forest/10 text-forest text-xs font-mono">
                        {s.number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm text-ink">{s.englishName}</span>
                        <span className="block text-xs text-ink-soft/70">
                          {s.numberOfAyahs} versets ·{" "}
                          {s.revelationType === "Meccan" ? "Mecquoise" : "Médinoise"}
                        </span>
                      </span>
                      <span className="font-arabic text-lg text-ink-soft" dir="rtl">
                        {s.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {user && (bookmarks.data?.length ?? 0) > 0 && (
              <div className="mt-4 bg-cream rounded-[16px] ring-1 ring-black/5 p-5">
                <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                  Mes marque-pages
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  {bookmarks.data!.map((b) => (
                    <li key={b.id}>
                      <button
                        onClick={() => setCurrent(b.surah_number)}
                        className="text-ink-soft hover:text-ink"
                      >
                        Sourate {b.surah_number}, verset {b.ayah_number}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <article className="bg-cream rounded-[16px] ring-1 ring-black/5 p-6 sm:p-8">
              {surah.isLoading && <p className="text-sm text-ink-soft">Chargement de la sourate…</p>}
              {surah.isError && (
                <p className="text-sm text-terra-deep">
                  La sourate n'a pas pu être chargée. Vérifiez votre connexion et réessayez.
                </p>
              )}
              {surah.data && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                        Sourate {surah.data.meta.number}
                      </div>
                      <h2 className="mt-2 font-display font-medium text-2xl text-ink">
                        {surah.data.meta.englishName}
                      </h2>
                      <div className="mt-1 text-sm text-ink-soft">
                        {surah.data.meta.englishNameTranslation} · {ayahs.length} versets
                      </div>
                    </div>
                    <div className="font-arabic text-3xl text-forest" dir="rtl">
                      {surah.data.meta.name}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => {
                        setContinuous(true);
                        play(0);
                      }}
                      className="text-sm font-medium bg-forest text-cream rounded-[10px] px-4 py-2.5"
                    >
                      ▶ Écouter la sourate
                    </button>
                    <button
                      onClick={() => {
                        audioRef.current?.pause();
                        setPlaying(null);
                        setContinuous(false);
                      }}
                      className="text-sm font-medium text-forest border border-forest/25 rounded-[10px] px-4 py-2.5 hover:bg-forest/5"
                    >
                      Arrêter
                    </button>
                    {user && (
                      <button
                        onClick={() => {
                          void saveLastRead(user.id, current, 1);
                          qc.invalidateQueries({ queryKey: ["quran-last-read", user.id] });
                          toast.success("Position enregistrée");
                        }}
                        className="text-sm text-ink-soft hover:text-ink"
                      >
                        Reprendre ici plus tard
                      </button>
                    )}
                  </div>

                  <div className="mt-8 divide-y divide-ink/10">
                    {ayahs.map((v, i) => {
                      const bm = bookmarks.data?.find(
                        (b) => b.surah_number === current && b.ayah_number === v.numberInSurah,
                      );
                      return (
                        <div
                          key={v.numberInSurah}
                          className={`py-6 ${playing === i ? "bg-sand/40 rounded-[12px] px-3" : ""}`}
                        >
                          <p className="font-arabic text-2xl leading-[2] text-ink text-right" dir="rtl">
                            {v.arabic}
                            <span className="ms-2 text-sm text-gold font-mono">
                              ﴿{v.numberInSurah}﴾
                            </span>
                          </p>
                          <p className="mt-3 text-sm text-ink-soft leading-relaxed">{v.french}</p>
                          <div className="mt-3 flex items-center gap-4 text-xs">
                            <button
                              onClick={() => {
                                setContinuous(false);
                                play(i);
                              }}
                              className="text-forest hover:underline"
                            >
                              ▶ Écouter ce verset
                            </button>
                            {user && (
                              <button
                                onClick={() => mark.mutate({ ayah: v.numberInSurah, existing: bm?.id })}
                                className={bm ? "text-terra-deep" : "text-ink-soft hover:text-ink"}
                              >
                                {bm ? "★ Marque-page" : "☆ Marquer"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </article>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
