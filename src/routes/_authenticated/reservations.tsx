import { Link, createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  BOOKING_LABELS,
  fetchMyBookings,
  fetchTeachers,
  formatMoney,
  formatSlot,
  setBookingStatus,
} from "@/lib/booking-queries";

export const Route = createFileRoute("/_authenticated/reservations")({
  head: () => ({
    meta: [
      { title: "Mes cours réservés | Dahara Online" },
      {
        name: "description",
        content:
          "Retrouvez vos cours à venir, leur statut de confirmation, le lien de la salle en direct et les enregistrements des séances passées.",
      },
      { property: "og:title", content: "Mes cours réservés — Dahara Online" },
      {
        property: "og:description",
        content: "Cours à venir, confirmations, salle en direct et enregistrements.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReservationsPage,
});

function ReservationsPage() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => fetchMyBookings(user!.id),
    enabled: !!user,
  });
  const teachers = useQuery({ queryKey: ["teachers"], queryFn: fetchTeachers });

  const cancel = useMutation({
    mutationFn: (id: string) => setBookingStatus(id, "annule"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-bookings", user?.id] });
      toast.success("Cours annulé");
    },
    onError: (e: Error) => toast.error("Échec", { description: e.message }),
  });

  const list = bookings.data ?? [];

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="Mes cours" title="Vos séances, du créneau à la salle en direct.">
        Suivez la confirmation de vos demandes, rejoignez la classe au moment venu et revoyez les
        enregistrements partagés par votre professeur.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-12 space-y-4">
          {bookings.isLoading && <p className="text-sm text-ink-soft">Chargement…</p>}
          {!bookings.isLoading && list.length === 0 && (
            <div className="bg-cream rounded-[16px] ring-1 ring-black/5 p-8 text-center">
              <p className="text-sm text-ink-soft">Vous n'avez pas encore réservé de cours.</p>
              <Link
                to="/professeurs"
                className="mt-5 inline-block text-sm font-medium bg-forest text-cream rounded-[10px] px-5 py-3"
              >
                Trouver un professeur
              </Link>
            </div>
          )}

          {list.map((b) => {
            const teacher = (teachers.data ?? []).find((t) => t.id === b.teacher_id);
            const start = new Date(b.starts_at);
            const joinable =
              b.status === "confirme" && start.getTime() - Date.now() < 30 * 60 * 1000 &&
              Date.now() < start.getTime() + b.duration_minutes * 60 * 1000;
            return (
              <article key={b.id} className="bg-cream rounded-[16px] ring-1 ring-black/5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                      {b.subject}
                    </div>
                    <h2 className="mt-1.5 font-display text-xl text-ink">
                      {teacher?.full_name ?? "Professeur"}
                    </h2>
                    <div className="mt-1 text-sm text-ink-soft">
                      {formatSlot(start)} · {b.duration_minutes} min · {formatMoney(b.price)}
                    </div>
                  </div>
                  <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-forest/10 text-forest">
                    {BOOKING_LABELS[b.status] ?? b.status}
                  </span>
                </div>

                {b.notes && <p className="mt-3 text-sm text-ink-soft/80">« {b.notes} »</p>}

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {b.status === "confirme" && (
                    <Link
                      to="/classe/$id"
                      params={{ id: b.id }}
                      className={`text-sm font-medium rounded-[10px] px-4 py-2.5 ${
                        joinable
                          ? "bg-forest text-cream"
                          : "ring-1 ring-black/10 text-ink-soft hover:bg-sand/60"
                      }`}
                    >
                      {joinable ? "Rejoindre la classe" : "Ouvrir la salle"}
                    </Link>
                  )}
                  {b.recording_url && (
                    <a
                      href={b.recording_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-terra-deep hover:underline"
                    >
                      Revoir l'enregistrement
                    </a>
                  )}
                  {(b.status === "en_attente" || b.status === "confirme") && (
                    <button
                      onClick={() => cancel.mutate(b.id)}
                      className="text-sm text-ink-soft hover:text-terra-deep"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
