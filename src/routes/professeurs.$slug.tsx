import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TEACHERS } from "@/lib/site-data";

export const Route = createFileRoute("/professeurs/$slug")({
  loader: ({ params }) => {
    const teacher = TEACHERS.find((t) => t.slug === params.slug);
    if (!teacher) throw notFound();
    return { teacher };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Professeur introuvable — Dahara Online" }, { name: "robots", content: "noindex" }],
      };
    }
    const { teacher } = loaderData;
    const title = `${teacher.name} — ${teacher.subjects} · Dahara Online`;
    const description = `${teacher.name}, ${teacher.meta}. ${teacher.rating}/5 sur ${teacher.reviews} avis. Séances à partir de ${teacher.price} FCFA.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  notFoundComponent: TeacherNotFound,
  component: TeacherPage,
});

function TeacherNotFound() {
  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 text-center">
        <h1 className="font-display text-3xl">Ce professeur n'existe pas</h1>
        <p className="mt-3 text-ink-soft">Le profil que vous cherchez a peut-être été retiré.</p>
        <Link
          to="/professeurs"
          className="mt-6 inline-block text-sm font-medium bg-forest text-cream rounded-[10px] px-5 py-3"
        >
          Voir tous les professeurs
        </Link>
      </div>
      <SiteFooter />
    </div>
  );
}

const SLOTS = ["Lun 18:00", "Mer 18:00", "Jeu 20:00", "Sam 10:00", "Sam 17:00", "Dim 11:00"];

function TeacherPage() {
  const { teacher } = Route.useLoaderData();

  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />

      <section className="bg-cream border-b border-ink/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid lg:grid-cols-12 gap-10 animate-fadein">
          <div className="lg:col-span-7">
            <Link to="/professeurs" className="text-xs font-mono text-ink-soft hover:text-ink">
              ← Tous les professeurs
            </Link>
            <div className="mt-6 flex items-start gap-5">
              <img
                src={teacher.photo}
                width={512}
                height={512}
                alt={`Portrait de ${teacher.name}`}
                className="size-24 shrink-0 rounded-[16px] object-cover outline-1 -outline-offset-1 outline-black/5"
              />
              <div>
                <h1 className="font-display font-medium text-3xl text-ink">{teacher.name}</h1>
                <div className="mt-1.5 text-sm text-ink-soft">{teacher.subjects}</div>
                <div className="mt-1 text-xs text-ink-soft/70">{teacher.meta}</div>
                <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-mono text-ink-soft">
                  {teacher.languages.map((l) => (
                    <span key={l} className="px-2 py-0.5 bg-sand rounded">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-8 text-base text-ink-soft leading-relaxed max-w-[58ch] text-pretty">
              {teacher.bio}
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-3">
              <Stat label="Note" value={`${teacher.rating}/5`} sub={`${teacher.reviews} avis`} />
              <Stat label="Niveaux" value={teacher.levels[0]} sub={teacher.levels.join(" · ")} />
              <Stat label="Ville" value={teacher.city} sub="Cours en ligne" />
            </div>
          </div>

          <aside className="lg:col-span-5">
            <div className="bg-sand rounded-[16px] ring-1 ring-black/5 p-6 lg:sticky lg:top-24">
              <div className="font-display text-3xl text-terra-deep">
                {teacher.price} <span className="text-sm font-body text-ink-soft/70">FCFA</span>
              </div>
              <div className="text-xs text-ink-soft/70">{teacher.session}</div>

              <div className="mt-6 text-[11px] font-mono uppercase tracking-[0.22em] text-ink-soft/70">
                Créneaux disponibles
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {SLOTS.map((s) => (
                  <button
                    key={s}
                    className="text-sm bg-cream rounded-[10px] py-2.5 ring-1 ring-black/5 hover:ring-forest/40"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <button className="mt-6 w-full text-sm font-medium bg-forest text-cream rounded-[10px] py-3 ring-1 ring-forest-deep/20 transition-transform hover:-translate-y-0.5">
                Réserver une séance
              </button>
              <Link
                to="/contact"
                className="mt-2 block text-center w-full text-sm font-medium text-forest border border-forest/25 rounded-[10px] py-2.5 hover:bg-forest/5"
              >
                Poser une question
              </Link>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="font-display font-medium text-2xl text-ink">Avis des élèves</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              ["Fatou D.", "Très patient avec mon fils, il lit maintenant sans hésiter."],
              ["Ibrahima S.", "Méthode claire et séances toujours ponctuelles."],
              ["Mariama B.", "Depuis Paris, c'est comme être au dahra de mon quartier."],
            ].map(([name, text]) => (
              <blockquote key={name} className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5">
                <p className="text-sm text-ink-soft leading-relaxed">« {text} »</p>
                <footer className="mt-4 text-xs font-mono text-ink-soft/70">{name}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-sand rounded-[14px] p-4 ring-1 ring-black/5">
      <div className="text-[11px] font-mono uppercase tracking-wider text-ink-soft/70">{label}</div>
      <div className="mt-2 font-display text-xl text-ink">{value}</div>
      <div className="mt-0.5 text-xs text-ink-soft/70">{sub}</div>
    </div>
  );
}
