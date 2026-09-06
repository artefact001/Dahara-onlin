import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import {
  WEEKDAYS,
  createBooking,
  fetchAvailability,
  fetchBookedSlots,
  fetchTeacherBySlug,
  formatMoney,
  formatSlot,
  generateSlots,
} from "@/lib/booking-queries";

export const Route = createFileRoute("/professeurs/$slug")({
  head: () => ({
    meta: [
      { title: "Profil du professeur et réservation | Dahara Online" },
      {
        name: "description",
        content:
          "Découvrez le parcours du professeur, ses matières, ses langues et son agenda réel, puis réservez votre cours en ligne.",
      },
      { property: "og:title", content: "Profil du professeur — Dahara Online" },
      {
        property: "og:description",
        content: "Parcours, matières, tarif horaire et créneaux disponibles pour réserver un cours.",
      },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeacherPage,
});

function TeacherPage() {
  const { slug } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [slot, setSlot] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  const teacher = useQuery({ queryKey: ["teacher", slug], queryFn: () => fetchTeacherBySlug(slug) });
  const teacherId = teacher.data?.id;

  const availability = useQuery({
    queryKey: ["availability", teacherId],
    queryFn: () => fetchAvailability(teacherId!),
    enabled: !!teacherId,
  });
  const booked = useQuery({
    queryKey: ["booked", teacherId],
    queryFn: () => fetchBookedSlots(teacherId!),
    enabled: !!teacherId,
  });

  const slots = generateSlots(availability.data ?? [], booked.data ?? []);

  const book = useMutation({
    mutationFn: () =>
      createBooking({
        student_id: user!.id,
        teacher_id: teacherId!,
        subject: subject || teacher.data!.subjects[0] || "Coran",
        starts_at: slot!,
        duration_minutes: 60,
        price: teacher.data!.hourly_price,
        notes,
      }),
    onSuccess: () => {
      toast.success("Demande envoyée", {
        description: "Le professeur confirmera votre créneau très vite.",
      });
      navigate({ to: "/reservations" });
    },
    onError: (e: Error) => toast.error("Réservation impossible", { description: e.message }),
  });

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />

      <section className="bg-sand/50 border-b border-ink/10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10">
          <Link to="/professeurs" className="text-sm text-ink-soft hover:text-ink">
            ← Tous les professeurs
          </Link>
          {teacher.isLoading && <p className="mt-6 text-sm text-ink-soft">Chargement…</p>}
          {teacher.data === null && (
            <p className="mt-6 text-sm text-terra-deep">Ce professeur n'est pas disponible.</p>
          )}
          {teacher.data && (
            <div className="mt-5 flex flex-wrap items-center gap-5">
              <div className="size-20 rounded-full bg-forest/10 text-forest grid place-items-center font-display text-3xl">
                {teacher.data.full_name.slice(0, 1)}
              </div>
              <div>
                <h1 className="font-display font-medium text-3xl text-ink">
                  {teacher.data.full_name}
                </h1>
                <p className="mt-1 text-sm text-ink-soft">{teacher.data.headline}</p>
                <div className="mt-2 text-xs font-mono text-ink-soft/70">
                  {teacher.data.city} · ★ {teacher.data.rating.toFixed(1)} ·{" "}
                  {formatMoney(teacher.data.hourly_price)} / heure
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {teacher.data && (
        <section className="bg-cream">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="font-display text-2xl text-ink">Présentation</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{teacher.data.bio}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Info title="Matières" items={teacher.data.subjects} />
                <Info title="Langues" items={teacher.data.languages} />
              </div>
              <div>
                <h3 className="text-[11px] font-mono uppercase tracking-[0.22em] text-terra-deep">
                  Disponibilités habituelles
                </h3>
                <ul className="mt-3 text-sm text-ink-soft space-y-1">
                  {(availability.data ?? []).map((a) => (
                    <li key={a.id}>
                      {WEEKDAYS[a.weekday]} · {a.start_time.slice(0, 5)} – {a.end_time.slice(0, 5)}
                    </li>
                  ))}
                  {(availability.data ?? []).length === 0 && <li>Aucun créneau publié.</li>}
                </ul>
              </div>
            </div>

            <aside className="lg:col-span-5">
              <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6">
                <h2 className="font-display font-medium text-xl text-ink">Réserver un cours</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Cours d'une heure en visio, {formatMoney(teacher.data.hourly_price)}.
                </p>

                <label className="block mt-5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    Matière
                  </span>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="input mt-1.5"
                  >
                    {teacher.data.subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="mt-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    Créneaux des 14 prochains jours
                  </span>
                  <div className="mt-2 max-h-64 overflow-y-auto grid grid-cols-2 gap-2">
                    {slots.map((s) => {
                      const iso = s.start.toISOString();
                      return (
                        <button
                          key={iso}
                          disabled={s.taken}
                          onClick={() => setSlot(iso)}
                          className={`text-xs rounded-[10px] px-2.5 py-2 ring-1 ${
                            slot === iso
                              ? "bg-forest text-cream ring-forest"
                              : s.taken
                                ? "bg-ink/5 text-ink-soft/40 ring-transparent line-through"
                                : "bg-cream text-ink-soft ring-black/5 hover:ring-ink/20"
                          }`}
                        >
                          {formatSlot(s.start)}
                        </button>
                      );
                    })}
                    {slots.length === 0 && (
                      <p className="col-span-2 text-sm text-ink-soft">
                        Aucun créneau libre pour le moment.
                      </p>
                    )}
                  </div>
                </div>

                <label className="block mt-4">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">
                    Un mot pour le professeur
                  </span>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input mt-1.5"
                    placeholder="Mon niveau, mes objectifs…"
                  />
                </label>

                {user ? (
                  <button
                    disabled={!slot || book.isPending}
                    onClick={() => book.mutate()}
                    className="mt-5 w-full text-sm font-medium bg-forest text-cream rounded-[10px] py-3 disabled:opacity-50"
                  >
                    {book.isPending ? "Envoi…" : "Demander ce créneau"}
                  </button>
                ) : (
                  <Link
                    to="/auth"
                    className="mt-5 block text-center text-sm font-medium bg-forest text-cream rounded-[10px] py-3"
                  >
                    Se connecter pour réserver
                  </Link>
                )}
              </div>
            </aside>
          </div>
        </section>
      )}

      <SiteFooter />
    </div>
  );
}

function Info({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="bg-sand/50 rounded-[14px] p-5">
      <div className="text-[11px] font-mono uppercase tracking-wider text-terra-deep">{title}</div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((i) => (
          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-cream text-ink-soft">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}
