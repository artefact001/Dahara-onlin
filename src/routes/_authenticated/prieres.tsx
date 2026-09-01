import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { usePrayerNotifications } from "@/hooks/use-prayer-notifications";
import {
  PRAYER_LABELS,
  fetchReminders,
  setRemindersCity,
  updateReminder,
  type PrayerName,
} from "@/lib/dahara-queries";
import { CITIES, fetchPrayerTimes, minutesFromNow, nextPrayer } from "@/lib/prayer-times";

export const Route = createFileRoute("/_authenticated/prieres")({
  head: () => ({
    meta: [
      { title: "Rappels de prière personnalisés | Dahara Online" },
      {
        name: "description",
        content:
          "Calendrier des cinq prières selon votre ville et notifications personnalisées avant chaque prière.",
      },
      { property: "og:title", content: "Rappels de prière — Dahara Online" },
      {
        property: "og:description",
        content: "Horaires du jour, décalage de rappel par prière et notifications dans l'app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrieresPage,
});

function PrieresPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const qc = useQueryClient();

  const reminders = useQuery({
    queryKey: ["reminders", userId],
    queryFn: fetchReminders,
    enabled: !!userId,
  });
  const city = reminders.data?.[0]?.city ?? "Dakar";
  const times = useQuery({
    queryKey: ["prayer-times", city],
    queryFn: () => fetchPrayerTimes(city),
    staleTime: 30 * 60 * 1000,
  });

  const { permission, requestPermission } = usePrayerNotifications(times.data, reminders.data);

  const saveReminder = useMutation({
    mutationFn: ({ id, values }: { id: string; values: { enabled?: boolean; offset_minutes?: number } }) =>
      updateReminder(id, values),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reminders", userId] }),
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const saveCity = useMutation({
    mutationFn: (value: string) => setRemindersCity(userId!, value),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders", userId] });
      toast.success("Ville mise à jour");
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const next = times.data ? nextPrayer(times.data) : null;

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Prières" title="Vos rappels, à l'heure de votre ville">
        Le calendrier du jour est calculé pour votre ville. Choisissez combien de minutes avant
        chaque prière vous souhaitez être averti.
      </PageHero>

      <section className="bg-cream">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-14 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display font-medium text-2xl text-ink">Calendrier du jour</h2>
              <label className="text-sm text-ink-soft">
                Ville&nbsp;
                <select
                  value={city}
                  onChange={(e) => saveCity.mutate(e.target.value)}
                  className="bg-sand rounded-[8px] ring-1 ring-black/5 px-3 py-2 text-ink"
                >
                  {CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {next && (
              <p className="mt-4 text-sm text-ink-soft">
                Prochaine prière&nbsp;: <strong className="text-ink">{next.prayer}</strong> à{" "}
                <span className="font-mono">{next.time}</span> (dans {next.in} min).
              </p>
            )}

            <div className="mt-6 space-y-3">
              {(reminders.data ?? []).map((reminder) => {
                const time = times.data?.[reminder.prayer as PrayerName];
                const inMin = time ? minutesFromNow(time) : null;
                return (
                  <div
                    key={reminder.id}
                    className="bg-sand rounded-[14px] ring-1 ring-black/5 p-5 flex flex-wrap items-center gap-4 justify-between"
                  >
                    <div>
                      <div className="font-display text-lg text-ink">
                        {PRAYER_LABELS[reminder.prayer as PrayerName] ?? reminder.prayer}
                      </div>
                      <div className="mt-1 text-sm text-ink-soft font-mono">
                        {time ?? "--:--"}
                        {inMin !== null && inMin >= 0 ? ` · dans ${inMin} min` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-sm text-ink-soft">
                        Rappel&nbsp;
                        <select
                          value={reminder.offset_minutes}
                          onChange={(e) =>
                            saveReminder.mutate({
                              id: reminder.id,
                              values: { offset_minutes: Number(e.target.value) },
                            })
                          }
                          className="bg-cream rounded-[8px] ring-1 ring-black/5 px-2 py-1.5 text-ink"
                        >
                          {[0, 5, 10, 15, 20, 30].map((m) => (
                            <option key={m} value={m}>
                              {m === 0 ? "à l'heure" : `${m} min avant`}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() =>
                          saveReminder.mutate({
                            id: reminder.id,
                            values: { enabled: !reminder.enabled },
                          })
                        }
                        className={`text-xs font-medium rounded-[8px] px-3 py-2 ring-1 ${
                          reminder.enabled
                            ? "bg-forest text-cream ring-forest"
                            : "bg-cream text-ink-soft ring-black/10"
                        }`}
                      >
                        {reminder.enabled ? "Activé" : "Désactivé"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
              <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                Notifications
              </div>
              <p className="mt-3 text-sm text-ink-soft leading-relaxed">
                {permission === "granted"
                  ? "Les notifications sont actives : vous serez averti tant que l'onglet reste ouvert."
                  : permission === "denied"
                    ? "Les notifications sont bloquées par votre navigateur. Autorisez-les dans les réglages du site."
                    : permission === "unsupported"
                      ? "Votre navigateur ne prend pas en charge les notifications."
                      : "Autorisez les notifications pour recevoir un rappel avant chaque prière."}
              </p>
              {permission === "default" && (
                <button
                  onClick={requestPermission}
                  className="mt-5 w-full text-sm font-medium bg-terra text-cream rounded-[10px] py-3"
                >
                  Autoriser les notifications
                </button>
              )}
            </div>
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6 text-sm text-ink-soft leading-relaxed">
              Les horaires suivent la méthode de calcul de l'Université islamique de Karachi
              (méthode 2), largement utilisée en Afrique de l'Ouest.
            </div>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
