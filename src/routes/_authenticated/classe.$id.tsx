import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { fetchMyBookings, formatSlot } from "@/lib/booking-queries";

export const Route = createFileRoute("/_authenticated/classe/$id")({
  head: () => ({
    meta: [
      { title: "Classe en direct | Dahara Online" },
      {
        name: "description",
        content:
          "Salle de cours en direct avec vidéo, tableau blanc, partage d'écran et enregistrement de la séance.",
      },
      { property: "og:title", content: "Classe en direct — Dahara Online" },
      {
        property: "og:description",
        content: "Vidéo, tableau blanc, partage d'écran et enregistrement de la séance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ClassroomPage,
});

function ClassroomPage() {
  const { id } = Route.useParams();
  const { user } = useAuth();

  const bookings = useQuery({
    queryKey: ["my-bookings", user?.id],
    queryFn: () => fetchMyBookings(user!.id),
    enabled: !!user,
  });

  const booking = (bookings.data ?? []).find((b) => b.id === id);
  const room = booking?.room_name ?? `dahara-${id}`;
  const name = user?.email?.split("@")[0] ?? "Élève";

  return (
    <div className="bg-ink text-cream font-body min-h-screen">
      <div className="bg-cream text-ink">
        <SiteHeader />
      </div>

      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-sand/70">
              Classe en direct
            </div>
            <h1 className="mt-1 font-display font-medium text-2xl text-cream">
              {booking?.subject ?? "Séance"}
            </h1>
            {booking && (
              <div className="mt-1 text-sm text-sand/70">{formatSlot(new Date(booking.starts_at))}</div>
            )}
          </div>
          <Link to="/reservations" className="text-sm text-sand/80 hover:text-cream">
            ← Mes cours
          </Link>
        </div>

        <div className="mt-6 rounded-[16px] overflow-hidden ring-1 ring-cream/10 bg-black">
          <iframe
            title="Classe en direct Dahara Online"
            src={`https://meet.jit.si/${encodeURIComponent(room)}#userInfo.displayName=%22${encodeURIComponent(name)}%22&config.prejoinPageEnabled=true&config.localRecording.enabled=true`}
            allow="camera; microphone; display-capture; fullscreen; speaker-selection; autoplay; clipboard-write"
            className="w-full h-[70vh] min-h-[480px] border-0"
          />
        </div>

        <p className="mt-4 text-sm text-sand/70">
          Utilisez la barre d'outils de la salle pour le tableau blanc, le partage d'écran et
          l'enregistrement de la séance. Le professeur peut ensuite partager le lien de
          l'enregistrement depuis son espace.
        </p>
      </div>
    </div>
  );
}
