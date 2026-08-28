import { createFileRoute, Link } from "@tanstack/react-router";

import heroDahra from "@/assets/hero-dahra.jpg";
import { PageHero } from "@/components/page-hero";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/a-propos")({
  head: () => ({
    meta: [
      { title: "À propos — la mission de Dahara Online" },
      {
        name: "description",
        content:
          "Dahara Online prolonge l'expérience du dahra traditionnel avec le numérique, pour relier enseignants africains et apprenants du monde entier.",
      },
      { property: "og:title", content: "À propos de Dahara Online" },
      {
        property: "og:description",
        content:
          "Notre mission : rendre l'apprentissage de l'arabe, du Coran et des sciences islamiques accessible, flexible et régulier.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AProposPage,
});

function AProposPage() {
  return (
    <div className="bg-cream text-ink font-body min-h-screen">
      <SiteHeader />
      <PageHero eyebrow="À propos" title="Le dahra continue, avec les outils d'aujourd'hui.">
        Dahara Online est née d'une conviction simple : la transmission du savoir islamique ne
        doit dépendre ni de la distance, ni des horaires, ni du hasard des rencontres.
      </PageHero>

      <section className="bg-sand">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16 grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5 text-ink-soft leading-relaxed">
            <p>
              Dans le dahra traditionnel, l'élève apprend par la répétition, la présence du maître
              et la régularité quotidienne. Ces trois piliers restent notre référence — nous les
              avons simplement traduits en produit numérique.
            </p>
            <p>
              Notre avantage tient à un trio : un professeur attitré, un parcours personnalisé et
              une motivation entretenue jour après jour. La bibliothèque, le minuteur de
              mémorisation et les rappels viennent ensuite maintenir l'élan.
            </p>
            <p>
              Nous travaillons depuis Dakar avec des enseignants vérifiés du Sénégal et d'ailleurs,
              pour des apprenants d'Afrique, d'Europe et d'Amérique du Nord — enfants comme adultes.
            </p>
            <div className="grid sm:grid-cols-3 gap-3 pt-4">
              {[
                ["2 400", "enseignants vérifiés"],
                ["6 200", "élèves actifs"],
                ["18", "pays"],
              ].map(([v, l]) => (
                <div key={l} className="bg-cream rounded-[14px] ring-1 ring-black/5 p-5">
                  <div className="font-display text-2xl text-ink">{v}</div>
                  <div className="mt-1 text-xs text-ink-soft/70">{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5">
            <img
              src={heroDahra}
              width={1024}
              height={1280}
              loading="lazy"
              alt="Élèves étudiant le Coran dans un dahra sénégalais"
              className="w-full aspect-[4/5] object-cover rounded-[16px] outline-1 -outline-offset-1 outline-black/5"
            />
          </div>
        </div>
      </section>

      <section className="bg-forest text-cream">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14">
          <h2 className="font-display font-medium text-2xl">Nos valeurs</h2>
          <div className="mt-7 grid sm:grid-cols-3 gap-4">
            {[
              ["Fidélité", "Un enseignement conforme, transmis par des maîtres identifiés et vérifiés."],
              ["Régularité", "Mieux vaut vingt minutes chaque jour qu'une longue séance oubliée."],
              ["Accessibilité", "Des tarifs pensés pour le Sénégal comme pour la diaspora."],
            ].map(([t, d]) => (
              <div key={t} className="bg-forest-deep/50 rounded-[14px] p-6 ring-1 ring-white/10">
                <div className="font-display text-xl">{t}</div>
                <p className="mt-2 text-sm text-cream/70 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
          <Link
            to="/contact"
            className="mt-9 inline-block text-sm font-medium bg-terra text-cream rounded-[10px] px-5 py-3"
          >
            Travailler avec nous
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
