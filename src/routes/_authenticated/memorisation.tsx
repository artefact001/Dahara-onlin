import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { Bar } from "@/components/bar";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  addSession,
  currentStreak,
  fetchProfile,
  fetchSessions,
  fetchSurahProgress,
  updateProfile,
  upsertSurahProgress,
  weeklyVerses,
} from "@/lib/dahara-queries";
import { SURAHS } from "@/lib/site-data";

export const Route = createFileRoute("/_authenticated/memorisation")({
  head: () => ({
    meta: [
      { title: "Mémorisation du Coran — progression par sourate | Dahara Online" },
      {
        name: "description",
        content:
          "Suivez votre mémorisation sourate par sourate, fixez un objectif hebdomadaire de versets et recevez des relances de motivation.",
      },
      { property: "og:title", content: "Mémorisation du Coran — Dahara Online" },
      {
        property: "og:description",
        content: "Progression par sourate, objectif hebdomadaire, séries et relances de motivation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MemorisationPage,
});

function MemorisationPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();

  const [surahNumber, setSurahNumber] = useState<number>(1);
  const [verses, setVerses] = useState(5);
  const [minutes, setMinutes] = useState(15);

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  const progress = useQuery({
    queryKey: ["surah-progress", userId],
    queryFn: fetchSurahProgress,
    enabled: !!userId,
  });
  const sessions = useQuery({
    queryKey: ["sessions", userId],
    queryFn: fetchSessions,
    enabled: !!userId,
  });

  const weekGoal = profile.data?.weekly_verses_goal ?? 20;
  const week = weeklyVerses(sessions.data ?? []);
  const streak = currentStreak(sessions.data ?? []);
  const rows = progress.data ?? [];
  const totalMemorized = rows.reduce((s, r) => s + r.memorized_verses, 0);
  const completed = rows.filter((r) => r.memorized_verses >= r.total_verses).length;

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["surah-progress", userId] });
    qc.invalidateQueries({ queryKey: ["sessions", userId] });
  };

  const logSession = useMutation({
    mutationFn: async () => {
      const surah = SURAHS.find((s) => s.n === surahNumber);
      const existing = rows.find((r) => r.surah_number === surahNumber);
      const total = existing?.total_verses ?? surah?.verses ?? 0;
      const memorized = Math.min(total, (existing?.memorized_verses ?? 0) + verses);
      await upsertSurahProgress({
        user_id: userId!,
        surah_number: surahNumber,
        surah_name: existing?.surah_name ?? surah?.name ?? `Sourate ${surahNumber}`,
        total_verses: total,
        memorized_verses: memorized,
      });
      await addSession({ user_id: userId!, surah_number: surahNumber, verses, minutes });
    },
    onSuccess: () => {
      refresh();
      toast.success("Séance enregistrée", {
        description: `${verses} versets · ${minutes} min. Qu'Allah facilite la suite.`,
      });
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const adjust = useMutation({
    mutationFn: async ({ surah, delta }: { surah: (typeof rows)[number]; delta: number }) => {
      await upsertSurahProgress({
        user_id: userId!,
        surah_number: surah.surah_number,
        surah_name: surah.surah_name,
        total_verses: surah.total_verses,
        memorized_verses: Math.max(0, Math.min(surah.total_verses, surah.memorized_verses + delta)),
      });
    },
    onSuccess: refresh,
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const saveGoal = useMutation({
    mutationFn: (value: number) => updateProfile(userId!, { weekly_verses_goal: value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
      toast.success("Objectif hebdomadaire mis à jour");
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const motivation =
    week >= weekGoal
      ? "Objectif atteint cette semaine. Prenez le temps de réviser ce qui est acquis."
      : streak === 0
        ? "Aucune séance aujourd'hui : cinq versets suffisent pour relancer la série."
        : `Série de ${streak} jours en cours — ne la laissez pas s'interrompre, il reste ${weekGoal - week} versets.`;

  const available = SURAHS.map((s) => ({ n: s.n, name: s.name }));

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Mémorisation" title="Votre hifz, sourate par sourate">
        Enregistrez chaque séance, suivez votre progression et gardez le cap grâce à un objectif
        hebdomadaire et des relances régulières.
      </PageHero>

      <section className="bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Versets mémorisés", `${totalMemorized}`],
            ["Sourates achevées", `${completed}`],
            ["Cette semaine", `${week} / ${weekGoal}`],
            ["Série", `${streak} jours`],
          ].map(([label, value]) => (
            <div key={label} className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
              <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">{label}</div>
              <div className="mt-4 font-display text-2xl">{value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <h2 className="font-display font-medium text-2xl text-ink">Progression par sourate</h2>
            <div className="mt-5 space-y-3">
              {rows.map((row) => {
                const pct = row.total_verses
                  ? Math.round((row.memorized_verses / row.total_verses) * 100)
                  : 0;
                return (
                  <div key={row.id} className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="font-display text-lg text-ink">
                          {row.surah_number}. {row.surah_name}
                        </div>
                        <div className="mt-1 text-sm text-ink-soft font-mono">
                          {row.memorized_verses} / {row.total_verses} versets · {pct} %
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => adjust.mutate({ surah: row, delta: -1 })}
                          className="size-9 rounded-[8px] ring-1 ring-black/10 text-ink-soft"
                          aria-label={`Retirer un verset de ${row.surah_name}`}
                        >
                          −
                        </button>
                        <button
                          onClick={() => adjust.mutate({ surah: row, delta: 1 })}
                          className="size-9 rounded-[8px] bg-forest text-cream"
                          aria-label={`Ajouter un verset à ${row.surah_name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <Bar value={pct} color="bg-forest" track="bg-ink/10" />
                  </div>
                );
              })}
              {!rows.length && !progress.isLoading && (
                <p className="text-sm text-ink-soft">
                  Enregistrez une première séance pour créer votre suivi.
                </p>
              )}
            </div>

            <h2 className="mt-12 font-display font-medium text-2xl text-ink">Dernières séances</h2>
            <div className="mt-5 space-y-2">
              {(sessions.data ?? []).slice(0, 8).map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between text-sm bg-sand rounded-[12px] ring-1 ring-black/5 px-5 py-3"
                >
                  <span className="font-mono text-ink-soft">{s.session_date}</span>
                  <span className="text-ink">
                    {s.verses} versets · {s.minutes} min
                  </span>
                </div>
              ))}
              {!sessions.data?.length && (
                <p className="text-sm text-ink-soft">Aucune séance enregistrée pour l'instant.</p>
              )}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Nouvelle séance
              </div>
              <div className="mt-4 space-y-3">
                <label className="block text-sm text-ink-soft">
                  Sourate
                  <select
                    value={surahNumber}
                    onChange={(e) => setSurahNumber(Number(e.target.value))}
                    className="mt-1.5 w-full bg-cream rounded-[10px] ring-1 ring-black/10 px-3 py-2.5 text-ink"
                  >
                    {available.map((s) => (
                      <option key={s.n} value={s.n}>
                        {s.n}. {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block text-sm text-ink-soft">
                    Versets
                    <input
                      type="number"
                      min={1}
                      value={verses}
                      onChange={(e) => setVerses(Number(e.target.value))}
                      className="mt-1.5 w-full bg-cream rounded-[10px] ring-1 ring-black/10 px-3 py-2.5 text-ink"
                    />
                  </label>
                  <label className="block text-sm text-ink-soft">
                    Minutes
                    <input
                      type="number"
                      min={1}
                      value={minutes}
                      onChange={(e) => setMinutes(Number(e.target.value))}
                      className="mt-1.5 w-full bg-cream rounded-[10px] ring-1 ring-black/10 px-3 py-2.5 text-ink"
                    />
                  </label>
                </div>
                <button
                  onClick={() => logSession.mutate()}
                  disabled={logSession.isPending}
                  className="w-full text-sm font-medium bg-terra text-cream rounded-[10px] py-3 disabled:opacity-60"
                >
                  Enregistrer la séance
                </button>
              </div>
            </div>

            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Objectif hebdomadaire
              </div>
              <div className="mt-4 flex items-center gap-2">
                {[10, 20, 35, 50].map((v) => (
                  <button
                    key={v}
                    onClick={() => saveGoal.mutate(v)}
                    className={`text-sm rounded-[10px] px-3 py-2 ring-1 ${
                      weekGoal === v
                        ? "bg-forest text-cream ring-forest"
                        : "bg-cream text-ink-soft ring-black/10"
                    }`}
                  >
                    {v}
                  </button>
                ))}
                <span className="text-sm text-ink-soft">versets / semaine</span>
              </div>
              <Bar value={weekGoal ? (week / weekGoal) * 100 : 0} color="bg-terra" track="bg-ink/10" />
            </div>

            <div className="bg-forest text-cream rounded-[16px] p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
                Relance
              </div>
              <p className="mt-3 text-sm text-cream/80 leading-relaxed">{motivation}</p>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
