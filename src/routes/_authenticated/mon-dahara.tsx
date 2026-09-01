import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Bar } from "@/components/bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  currentStreak,
  fetchGoals,
  fetchPath,
  fetchProfile,
  fetchReminders,
  fetchSessions,
  fetchSurahProgress,
  setStepStatus,
  weeklyVerses,
  type PathStep,
} from "@/lib/dahara-queries";
import { fetchPrayerTimes, nextPrayer } from "@/lib/prayer-times";

export const Route = createFileRoute("/_authenticated/mon-dahara")({
  head: () => ({
    meta: [
      { title: "Mon Dahara — parcours et progression | Dahara Online" },
      {
        name: "description",
        content:
          "Votre parcours personnalisé, vos étapes, vos objectifs, votre mémorisation du Coran et vos rappels de prière réunis en un seul espace.",
      },
      { property: "og:title", content: "Mon Dahara — votre espace d'apprentissage" },
      {
        property: "og:description",
        content: "Étapes du parcours, objectifs hebdomadaires, série de régularité et prochaine prière.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MonDaharaPage,
});

const STATUS_LABEL: Record<PathStep["status"], string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  termine: "Terminée",
};

function MonDaharaPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();

  const profile = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => fetchProfile(userId!),
    enabled: !!userId,
  });
  const path = useQuery({ queryKey: ["path", userId], queryFn: fetchPath, enabled: !!userId });
  const goals = useQuery({ queryKey: ["goals", userId], queryFn: fetchGoals, enabled: !!userId });
  const surahs = useQuery({
    queryKey: ["surah-progress", userId],
    queryFn: fetchSurahProgress,
    enabled: !!userId,
  });
  const sessions = useQuery({
    queryKey: ["sessions", userId],
    queryFn: fetchSessions,
    enabled: !!userId,
  });
  const reminders = useQuery({
    queryKey: ["reminders", userId],
    queryFn: fetchReminders,
    enabled: !!userId,
  });
  const city = reminders.data?.[0]?.city ?? profile.data?.city ?? "Dakar";
  const times = useQuery({
    queryKey: ["prayer-times", city],
    queryFn: () => fetchPrayerTimes(city),
    staleTime: 30 * 60 * 1000,
  });

  const advance = useMutation({
    mutationFn: ({ id, status }: { id: string; status: PathStep["status"] }) =>
      setStepStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["path", userId] });
      toast.success("Étape mise à jour");
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const next = times.data ? nextPrayer(times.data) : null;
  const steps = path.data?.steps ?? [];
  const done = steps.filter((s) => s.status === "termine").length;
  const pathPercent = steps.length ? Math.round((done / steps.length) * 100) : 0;
  const memorized = (surahs.data ?? []).reduce((s, r) => s + r.memorized_verses, 0);
  const week = weeklyVerses(sessions.data ?? []);
  const weekGoal = profile.data?.weekly_verses_goal ?? 20;
  const streak = currentStreak(sessions.data ?? []);
  const firstName = (profile.data?.full_name || "").split(" ")[0] || "cher apprenant";

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />

      <section className="bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16 animate-fadein">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-gold">
                Mon Dahara
              </div>
              <h1 className="mt-2 font-display font-medium text-3xl max-w-[40ch] text-balance">
                Bonjour {firstName}, le savoir vous attend.
              </h1>
            </div>
            <span className="font-mono text-xs text-cream/50">{city}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Stat label="Prochaine prière" value={next?.prayer ?? "—"}>
              <div className="mt-1 text-sm text-cream/70">
                {next ? (
                  <>
                    à <span className="font-mono text-gold">{next.time}</span> · dans{" "}
                    <span className="font-mono text-gold">{next.in} min</span>
                  </>
                ) : (
                  "Horaires en cours de chargement"
                )}
              </div>
              <Link to="/prieres" className="mt-4 block font-mono text-xs text-cream/50 hover:text-gold">
                Gérer mes rappels →
              </Link>
            </Stat>

            <Stat label="Parcours" value={`${pathPercent}\u00a0%`}>
              <div className="mt-1 text-sm text-cream/70">
                {done} / {steps.length} étapes terminées
              </div>
              <Bar value={pathPercent} />
            </Stat>

            <Stat label="Objectif de la semaine" value={`${week} / ${weekGoal}`}>
              <div className="mt-1 text-sm text-cream/70">versets mémorisés</div>
              <Bar value={weekGoal ? (week / weekGoal) * 100 : 0} />
            </Stat>

            <Stat label="Série & mémorisation" value={`${streak} jours`}>
              <div className="mt-1 text-sm text-cream/70">{memorized} versets au total</div>
              <Bar value={Math.min(100, streak * 10)} color="bg-terra" />
            </Stat>
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <h2 className="font-display font-medium text-2xl text-ink">
              {path.data?.path?.title ?? "Mon parcours"}
            </h2>
            <p className="mt-2 text-sm text-ink-soft max-w-[60ch]">
              {path.data?.path?.description ??
                "Votre parcours se construit étape par étape, à votre rythme."}
            </p>

            <ol className="mt-6 space-y-3">
              {steps.map((step, i) => (
                <li
                  key={step.id}
                  className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5 flex flex-wrap items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-ink-soft/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-lg text-ink">{step.title}</span>
                    </div>
                    {step.detail && (
                      <p className="mt-1 text-sm text-ink-soft max-w-[52ch]">{step.detail}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded-full ${
                        step.status === "termine"
                          ? "bg-forest/10 text-forest"
                          : step.status === "en_cours"
                            ? "bg-terra/15 text-terra-deep"
                            : "bg-ink/5 text-ink-soft"
                      }`}
                    >
                      {STATUS_LABEL[step.status]}
                    </span>
                    {step.status !== "termine" && (
                      <button
                        onClick={() =>
                          advance.mutate({
                            id: step.id,
                            status: step.status === "a_faire" ? "en_cours" : "termine",
                          })
                        }
                        className="text-xs font-medium bg-forest text-cream rounded-[8px] px-3 py-1.5"
                      >
                        {step.status === "a_faire" ? "Commencer" : "Valider"}
                      </button>
                    )}
                  </div>
                </li>
              ))}
              {!steps.length && !path.isLoading && (
                <li className="text-sm text-ink-soft">
                  Aucun parcours pour l'instant. Les comptes professeurs n'en ont pas par défaut.
                </li>
              )}
            </ol>

            <h2 className="mt-12 font-display font-medium text-2xl text-ink">Mes objectifs</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-3">
              {(goals.data ?? []).map((goal) => (
                <div key={goal.id} className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    {goal.period}
                  </div>
                  <div className="mt-3 font-display text-lg text-ink">{goal.label}</div>
                  <div className="mt-1 text-sm text-ink-soft">
                    {goal.current_value} / {goal.target_value} {goal.unit}
                  </div>
                  <Bar
                    value={goal.target_value ? (goal.current_value / goal.target_value) * 100 : 0}
                    color="bg-terra"
                    track="bg-ink/10"
                  />
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:col-span-5 space-y-4">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Relance du jour
              </div>
              <p className="mt-3 text-ink-soft text-sm leading-relaxed">
                {week >= weekGoal
                  ? "Objectif hebdomadaire atteint, mâ shâ Allah. Consolidez par une révision."
                  : `Il vous reste ${weekGoal - week} versets à mémoriser cette semaine. Une séance de 15 minutes suffit pour avancer.`}
              </p>
              <Link
                to="/memorisation"
                className="mt-5 block text-center text-sm font-medium bg-terra text-cream rounded-[10px] py-3"
              >
                Ouvrir la mémorisation
              </Link>
            </div>

            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Continuer
              </div>
              <div className="mt-4 space-y-2 text-sm">
                <Link to="/coran" className="block text-ink hover:text-terra">
                  Lire le Coran
                </Link>
                <Link to="/bibliotheque" className="block text-ink hover:text-terra">
                  Bibliothèque
                </Link>
                <Link to="/professeurs" className="block text-ink hover:text-terra">
                  Réserver une séance
                </Link>
                <Link to="/profil" className="block text-ink hover:text-terra">
                  Mon profil et mes objectifs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-forest-deep/50 rounded-[14px] p-5 ring-1 ring-white/10">
      <div className="text-cream/60 text-xs font-mono uppercase tracking-wider">{label}</div>
      <div className="mt-4 font-display text-2xl">{value}</div>
      {children}
    </div>
  );
}
